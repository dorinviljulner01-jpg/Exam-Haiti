"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Merci de remplir tous les champs.");
      return;
    }

    if (!isSupabaseConfigured) {
      // Mode démo : pas de vrai backend connecté pour l'instant.
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <Header title="Connexion" />
      <main className="px-4 pb-8">
        <div className="pt-6">
          <h1 className="text-xl font-extrabold text-brand-900">
            Bon retour !
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connecte-toi pour continuer ta préparation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-6">
          <input
            type="email"
            placeholder="Adresse email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          {!isSupabaseConfigured && (
            <p className="text-xs text-gray-400">
              Mode démonstration : aucune vérification réelle tant que
              Supabase n'est pas configuré.
            </p>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-brand-700 font-semibold">
            Inscris-toi
          </Link>
        </p>
      </main>
    </>
  );
}
