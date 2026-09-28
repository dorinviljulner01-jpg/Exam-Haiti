"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const progressBySubject = [
  { subject: "Mathématiques", percentage: 75 },
  { subject: "Français", percentage: 82 },
  { subject: "Sciences expérimentales", percentage: 68 }
];

export default function DashboardPage() {
  const [premium, setPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("is_premium,premium_until")
        .eq("id", auth.user.id)
        .single();

      const active = Boolean(
        data?.is_premium &&
          (!data.premium_until || new Date(data.premium_until).getTime() > Date.now())
      );

      setPremium(active);
      setPremiumUntil(data?.premium_until ?? null);
    })();
  }, []);

  return (
    <>
      <Header title="Mon profil" />
      <main className="px-4 pb-8">
        <div className="pt-6">
          <h1 className="text-xl font-extrabold text-brand-900">
            Bonjour, Étudiant 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Voici un résumé de ta progression.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="card text-center py-4">
            <p className="text-2xl font-extrabold text-brand-700">4</p>
            <p className="text-xs text-gray-500 mt-1">Quiz réalisés</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-extrabold text-brand-700">76%</p>
            <p className="text-xs text-gray-500 mt-1">Score moyen</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-extrabold text-brand-700">0</p>
            <p className="text-xs text-gray-500 mt-1">Examens blancs</p>
          </div>
          <div className="card text-center py-4">
            <p className={`text-2xl font-extrabold ${premium ? "text-accent-600" : "text-gray-500"}`}>
              {premium ? "Premium" : "Gratuit"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Statut du compte</p>
          </div>
        </div>

        {premium && premiumUntil && (
          <div className="card mt-4 bg-green-50 border-green-200">
            <p className="text-sm font-bold text-green-800">Abonnement actif ✅</p>
            <p className="text-xs text-green-700 mt-1">
              Accès Premium jusqu'au{" "}
              {new Date(premiumUntil).toLocaleDateString("fr-FR")}
            </p>
          </div>
        )}

        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-6 mb-3">
          Progression par matière
        </h2>
        <div className="flex flex-col gap-3">
          {progressBySubject.map((p) => (
            <div key={p.subject} className="card">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>{p.subject}</span>
                <span className="text-brand-700 font-semibold">
                  {p.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full"
                  style={{ width: `${p.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-6 text-center py-5">
          {premium ? (
            <>
              <p className="text-sm font-semibold text-green-700">
                Ton accès Premium est actif.
              </p>
              <Link href="/documents" className="btn-primary mt-3 block">
                Accéder aux contenus
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-700">
                Passe au Premium pour débloquer tout le contenu
              </p>
              <Link href="/subscription" className="btn-primary mt-3 block">
                Voir les abonnements
              </Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
