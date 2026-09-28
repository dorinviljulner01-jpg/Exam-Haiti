"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type Stats = Record<string, number>;

async function count(table: string, filter?: [string, string]) {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStats({
        students: 0, pending: 0, approved: 0, rejected: 0,
        quizzes: 0, documents: 0, attempts: 0
      });
      return;
    }
    (async () => {
      const [students, pending, approved, rejected, quizzes, documents, attempts] =
        await Promise.all([
          count("profiles", ["role", "student"]),
          count("payments", ["status", "pending"]),
          count("payments", ["status", "approved"]),
          count("payments", ["status", "rejected"]),
          count("quizzes"),
          count("documents"),
          count("quiz_attempts")
        ]);
      setStats({ students, pending, approved, rejected, quizzes, documents, attempts });
    })();
  }, []);

  const items = [
    { k: "students", label: "Étudiants", icon: "👩‍🎓" },
    { k: "pending", label: "Paiements en attente", icon: "⏳" },
    { k: "approved", label: "Paiements approuvés", icon: "✅" },
    { k: "rejected", label: "Paiements rejetés", icon: "❌" },
    { k: "quizzes", label: "Quiz", icon: "🧠" },
    { k: "documents", label: "Documents", icon: "📚" },
    { k: "attempts", label: "Tentatives de quiz", icon: "📊" }
  ];

  return (
    <>
      <h1 className="text-xl font-extrabold text-brand-900">Vue d'ensemble</h1>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {items.map((i) => (
          <div key={i.k} className="card text-center py-4">
            <p className="text-xl">{i.icon}</p>
            <p className="text-2xl font-extrabold text-brand-700">
              {stats ? stats[i.k] : "…"}
            </p>
            <p className="text-xs text-gray-500 mt-1">{i.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}
