"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type Plan = {
  id: string;
  name: string;
  price_htg: number;
  duration_days: number;
};

type Payment = {
  id: string;
  plan_id: string;
  payment_method: "moncash" | "natcash";
  amount: number;
  transaction_reference: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  plan?: Plan | null;
};

const MONCASH_NUMBER =
  process.env.NEXT_PUBLIC_MONCASH_NUMBER || "Numéro MonCash à configurer";
const NATCASH_NUMBER =
  process.env.NEXT_PUBLIC_NATCASH_NUMBER || "Numéro NatCash à configurer";

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [method, setMethod] = useState<"moncash" | "natcash">("moncash");
  const [reference, setReference] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const latestPending = useMemo(
    () => payments.find((p) => p.status === "pending"),
    [payments]
  );

  async function loadData() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/login");
      return;
    }

    setUserId(auth.user.id);

    const [{ data: plansData, error: plansError }, { data: profile }, { data: paymentData }] =
      await Promise.all([
        supabase.from("plans").select("id,name,price_htg,duration_days").order("duration_days"),
        supabase.from("profiles").select("is_premium,premium_until").eq("id", auth.user.id).single(),
        supabase
          .from("payments")
          .select("id,plan_id,payment_method,amount,transaction_reference,status,rejection_reason,created_at,plan:plans(id,name,price_htg,duration_days)")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false })
          .limit(10)
      ]);

    if (plansError) {
      setMessage({ type: "error", text: "Impossible de charger les abonnements." });
    }

    setPlans((plansData as Plan[]) ?? []);
    setPayments((paymentData as Payment[]) ?? []);
    setPremium(Boolean(profile?.is_premium));
    setPremiumUntil(profile?.premium_until ?? null);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!selectedPlan) {
      setMessage({ type: "error", text: "Choisis d'abord un abonnement." });
      return;
    }
    if (!reference.trim()) {
      setMessage({ type: "error", text: "Entre la référence de la transaction." });
      return;
    }
    if (!screenshot) {
      setMessage({ type: "error", text: "Ajoute la capture d'écran de la transaction." });
      return;
    }
    if (!isSupabaseConfigured || !userId) {
      setMessage({
        type: "error",
        text: "Supabase doit être configuré pour envoyer un vrai paiement."
      });
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(screenshot.type)) {
      setMessage({ type: "error", text: "La capture doit être JPG, PNG ou WebP." });
      return;
    }
    if (screenshot.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "La capture ne doit pas dépasser 5 Mo." });
      return;
    }

    setSubmitting(true);

    const paymentId = crypto.randomUUID();
    const extension = screenshot.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${paymentId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-screenshots")
      .upload(path, screenshot, {
        contentType: screenshot.type,
        upsert: false
      });

    if (uploadError) {
      setSubmitting(false);
      setMessage({
        type: "error",
        text: "Impossible d'envoyer la capture. Vérifie le stockage Supabase."
      });
      return;
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      id: paymentId,
      user_id: userId,
      plan_id: selectedPlan.id,
      payment_method: method,
      amount: selectedPlan.price_htg,
      transaction_reference: reference.trim(),
      screenshot_url: path,
      status: "pending"
    });

    if (paymentError) {
      await supabase.storage.from("payment-screenshots").remove([path]);
      setSubmitting(false);
      setMessage({
        type: "error",
        text: "Le paiement n'a pas pu être enregistré."
      });
      return;
    }

    setReference("");
    setScreenshot(null);
    setSelectedPlan(null);
    setSubmitting(false);
    setMessage({
      type: "ok",
      text: "Paiement envoyé. Il est maintenant en attente de validation."
    });
    await loadData();
  }

  if (loading) {
    return (
      <>
        <Header title="Abonnement" />
        <p className="p-6 text-center text-gray-500">Chargement...</p>
      </>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <>
        <Header title="Abonnement" />
        <main className="px-4 pb-8 pt-6">
          <div className="card">
            <p className="text-3xl">💳</p>
            <h1 className="text-xl font-extrabold text-brand-900 mt-3">
              Abonnement Premium
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              La page est prête. Pour accepter de vrais paiements, configure Supabase
              puis exécute les scripts SQL de Stage 2 et Stage 3.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Abonnement" />
      <main className="px-4 pb-8 pt-5">
        <div className="card">
          <p className="text-3xl">⭐</p>
          <h1 className="text-xl font-extrabold text-brand-900 mt-2">
            Passe à Premium
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Débloque les documents, quiz et contenus réservés aux abonnés.
          </p>

          {premium && (
            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3">
              <p className="font-bold text-green-800">Premium actif ✅</p>
              {premiumUntil && (
                <p className="text-xs text-green-700 mt-1">
                  Valable jusqu'au{" "}
                  {new Date(premiumUntil).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          )}
        </div>

        {message && (
          <p
            className={`mt-3 rounded-xl px-3 py-2 text-sm ${
              message.type === "ok"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}

        {latestPending && (
          <div className="card mt-4 border-yellow-200 bg-yellow-50">
            <p className="font-bold text-yellow-800">Paiement en attente ⏳</p>
            <p className="text-sm text-yellow-700 mt-1">
              {latestPending.plan?.name ?? "Abonnement"} ·{" "}
              {latestPending.payment_method === "moncash" ? "MonCash" : "NatCash"} ·{" "}
              Référence : {latestPending.transaction_reference}
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              Tu recevras l'accès Premium automatiquement dès que l'administrateur
              approuvera le paiement.
            </p>
          </div>
        )}

        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-6 mb-3">
          1. Choisis ton abonnement
        </h2>

        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <button
              type="button"
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`card text-left transition ${
                selectedPlan?.id === plan.id
                  ? "border-brand-600 ring-2 ring-brand-100"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-brand-900">{plan.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Accès Premium pendant {plan.duration_days} jours
                  </p>
                </div>
                <p className="font-extrabold text-brand-700">
                  {Number(plan.price_htg).toLocaleString("fr-FR")} HTG
                </p>
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={submitPayment} className="mt-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            2. Paie et envoie la preuve
          </h2>

          <div className="card">
            <p className="text-sm font-semibold">Numéros de paiement</p>
            <div className="grid grid-cols-1 gap-2 mt-3">
              <button
                type="button"
                onClick={() => setMethod("moncash")}
                className={`text-left rounded-xl border-2 p-3 ${
                  method === "moncash"
                    ? "border-brand-600 bg-brand-50"
                    : "border-gray-200"
                }`}
              >
                <p className="font-bold">MonCash</p>
                <p className="text-sm text-gray-600 mt-1">{MONCASH_NUMBER}</p>
              </button>
              <button
                type="button"
                onClick={() => setMethod("natcash")}
                className={`text-left rounded-xl border-2 p-3 ${
                  method === "natcash"
                    ? "border-brand-600 bg-brand-50"
                    : "border-gray-200"
                }`}
              >
                <p className="font-bold">NatCash</p>
                <p className="text-sm text-gray-600 mt-1">{NATCASH_NUMBER}</p>
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Fais le paiement sur le numéro correspondant, puis garde la
              référence affichée par le service.
            </p>

            <input
              className="input-field mt-4"
              placeholder="Référence / ID de transaction"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />

            <label className="block mt-4">
              <span className="text-sm font-semibold">Capture d'écran</span>
              <input
                className="input-field mt-2"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
              />
              {screenshot && (
                <span className="text-xs text-gray-500 mt-1 block">
                  {screenshot.name}
                </span>
              )}
            </label>

            <button
              type="submit"
              className="btn-primary mt-5"
              disabled={submitting}
            >
              {submitting ? "Envoi..." : "Envoyer le paiement pour validation"}
            </button>
          </div>
        </form>

        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-6 mb-3">
          Historique des paiements
        </h2>

        <div className="flex flex-col gap-3">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              Aucun paiement envoyé.
            </p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="card">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {payment.plan?.name ?? "Abonnement"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {payment.payment_method === "moncash" ? "MonCash" : "NatCash"} ·{" "}
                      {payment.transaction_reference}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      payment.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {payment.status === "approved"
                      ? "Approuvé"
                      : payment.status === "rejected"
                      ? "Rejeté"
                      : "En attente"}
                  </span>
                </div>
                {payment.rejection_reason && (
                  <p className="text-xs text-red-600 mt-2">
                    Motif : {payment.rejection_reason}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <Link
          href="/dashboard"
          className="block text-center text-sm font-semibold text-brand-700 mt-6"
        >
          ← Retour au tableau de bord
        </Link>
      </main>
    </>
  );
}
