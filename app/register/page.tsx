"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [level, setLevel] = useState<"9e-af" | "ns4">("9e-af");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password) {
      setError("Merci de remplir tous les champs.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!isSupabaseConfigured) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, level } }
    });
    setLoading(false);

    if (authError) {
      setError("Impossible de créer le compte. Réessaie.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <Header title="Inscription" />
      <main className="px-4 pb-8">
        <div className="pt-6">
          <h1 className="text-xl font-extrabold text-brand-900">
            Crée ton compte gratuit
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Commence à réviser dès maintenant.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-6">
          <input
            type="text"
            placeholder="Nom complet"
            className="input-field"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLevel("9e-af")}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold ${
                level === "9e-af"
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              9e AF
            </button>
            <button
              type="button"
              onClick={() => setLevel("ns4")}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold ${
                level === "ns4"
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              NS4
            </button>
          </div>

          <input
            type="email"
            placeholder="Adresse email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe (min. 6 caractères)"
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
              Mode démonstration : aucun compte réel n'est créé tant que
              Supabase n'est pas configuré.
            </p>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-brand-700 font-semibold">
            Connecte-toi
          </Link>
        </p>
      </main>
    </>
  );
}
