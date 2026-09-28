"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type Payment = {
  id: string;
  user_id: string;
  plan_id: string;
  payment_method: "moncash" | "natcash";
  amount: number;
  transaction_reference: string;
  screenshot_url: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  profile?: { full_name: string | null; level: string | null; } | null;
  plan?: { name: string; duration_days: number } | null;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ url: string; name: string } | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function loadPayments() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from("payments")
      .select(
        "id,user_id,plan_id,payment_method,amount,transaction_reference,screenshot_url,status,rejection_reason,created_at,profile:profiles!payments_user_id_fkey(full_name,level),plan:plans(name,duration_days)"
      )
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data, error: e } = await query;

    if (e) {
      setError("Impossible de charger les paiements. Vérifie les droits RLS.");
      setPayments([]);
    } else {
      setError(null);
      setPayments((data as Payment[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPayments();
  }, [filter]);

  async function viewScreenshot(payment: Payment) {
    const { data, error: e } = await supabase.storage
      .from("payment-screenshots")
      .createSignedUrl(payment.screenshot_url, 300);

    if (e || !data?.signedUrl) {
      setError("Impossible d'afficher la capture.");
      return;
    }

    setViewer({
      url: data.signedUrl,
      name: payment.profile?.full_name || "Étudiant"
    });
  }

  async function approve(payment: Payment) {
    setBusy(payment.id);
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    const { error: e } = await supabase
      .from("payments")
      .update({
        status: "approved",
        rejection_reason: null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user?.id ?? null
      })
      .eq("id", payment.id);

    if (e) {
      setError("Impossible d'approuver le paiement.");
    } else {
      await loadPayments();
    }
    setBusy(null);
  }

  async function reject(payment: Payment) {
    setBusy(payment.id);
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    const { error: e } = await supabase
      .from("payments")
      .update({
        status: "rejected",
        rejection_reason: reason.trim() || "Paiement non validé.",
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user?.id ?? null
      })
      .eq("id", payment.id);

    if (e) {
      setError("Impossible de rejeter le paiement.");
    } else {
      setRejecting(null);
      setReason("");
      await loadPayments();
    }
    setBusy(null);
  }

  if (!isSupabaseConfigured) {
    return (
      <>
        <h1 className="text-xl font-extrabold text-brand-900">Paiements</h1>
        <div className="card mt-4">
          <p className="text-sm text-gray-500">
            Le module de paiement nécessite Supabase.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-xl font-extrabold text-brand-900">Paiements</h1>
      <p className="text-sm text-gray-500 mt-1">
        Vérifie la référence et la capture avant de valider.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mt-3">
          {error}
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto mt-4 pb-1">
        {[
          ["pending", "En attente"],
          ["approved", "Approuvés"],
          ["rejected", "Rejetés"],
          ["all", "Tous"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value as typeof filter)}
            className={`shrink-0 text-xs font-semibold rounded-full px-3 py-2 border ${
              filter === value
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-8">Chargement...</p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          Aucun paiement dans cette catégorie.
        </p>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {payments.map((payment) => (
            <div key={payment.id} className="card">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-bold text-brand-900">
                    {payment.profile?.full_name || "Étudiant"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {payment.profile?.level === "ns4" ? "NS4" : "9e AF"} ·{" "}
                    {payment.plan?.name || "Abonnement"}
                  </p>
                </div>
                <span className="font-extrabold text-brand-700">
                  {Number(payment.amount).toLocaleString("fr-FR")} HTG
                </span>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 mt-3 text-sm">
                <p>
                  <strong>Méthode :</strong>{" "}
                  {payment.payment_method === "moncash" ? "MonCash" : "NatCash"}
                </p>
                <p className="mt-1 break-all">
                  <strong>Référence :</strong> {payment.transaction_reference}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(payment.created_at).toLocaleString("fr-FR")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => viewScreenshot(payment)}
                className="btn-secondary py-2.5 text-sm mt-3"
              >
                🖼️ Voir la capture
              </button>

              {payment.status === "pending" && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    disabled={busy === payment.id}
                    onClick={() => approve(payment)}
                    className="rounded-xl bg-green-600 text-white font-semibold py-3 disabled:opacity-50"
                  >
                    {busy === payment.id ? "..." : "✓ Valider"}
                  </button>
                  <button
                    type="button"
                    disabled={busy === payment.id}
                    onClick={() => setRejecting(payment.id)}
                    className="rounded-xl bg-red-50 text-red-700 border border-red-200 font-semibold py-3 disabled:opacity-50"
                  >
                    ✕ Rejeter
                  </button>
                </div>
              )}

              {rejecting === payment.id && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                  <textarea
                    className="input-field min-h-24"
                    placeholder="Motif du rejet (facultatif)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejecting(null);
                        setReason("");
                      }}
                      className="rounded-xl bg-white border border-gray-300 py-2 font-semibold text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={busy === payment.id}
                      onClick={() => reject(payment)}
                      className="rounded-xl bg-red-600 text-white py-2 font-semibold text-sm"
                    >
                      Confirmer le rejet
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold">Capture — {viewer.name}</p>
              <button
                type="button"
                onClick={() => setViewer(null)}
                className="text-gray-500 text-xl px-2"
              >
                ×
              </button>
            </div>
            <img
              src={viewer.url}
              alt="Capture de paiement"
              className="w-full rounded-xl object-contain max-h-[70vh]"
            />
          </div>
        </div>
      )}
    </>
  );
}
