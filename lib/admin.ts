"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { subjects9eAF, subjectsNS4 } from "./sampleData";

// ---------- Accès administrateur ----------
// NB : cette vérification côté navigateur sert seulement à l'affichage.
// La vraie protection est faite par les règles RLS dans supabase/stage2.sql.
export function useAdminGuard() {
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("ok"); // mode démo
      return;
    }
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setStatus("denied");
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      setStatus(profile?.role === "admin" ? "ok" : "denied");
    })();
  }, []);

  return { status, demo: !isSupabaseConfigured };
}

// ---------- Matières ----------
export interface SubjectRow {
  id: string;
  level: string;
  name: string;
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSubjects([
        ...subjects9eAF.map((s) => ({ id: `9e-af:${s.slug}`, level: "9e-af", name: s.name })),
        ...subjectsNS4.map((s) => ({ id: `ns4:${s.slug}`, level: "ns4", name: s.name }))
      ]);
      return;
    }
    supabase
      .from("subjects")
      .select("id, level, name")
      .order("name")
      .then(({ data }) => setSubjects((data as SubjectRow[]) ?? []));
  }, []);

  return subjects;
}

// ---------- CRUD générique (Supabase, ou mémoire en mode démo) ----------
export function useCrud<T extends { id?: string }>(
  table: string,
  seed: T[] = [],
  limit = 100
) {
  const [rows, setRows] = useState<T[]>(seed);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const { data, error: e } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (e) setError("Impossible de charger les données. Vérifie ta connexion.");
    else setRows((data as T[]) ?? []);
    setLoading(false);
  }, [table, limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Retourne l'id de la ligne enregistrée, ou null en cas d'erreur.
  async function save(row: T): Promise<string | null> {
    setError(null);
    if (!isSupabaseConfigured) {
      const id = row.id ?? crypto.randomUUID();
      setRows((prev) =>
        row.id
          ? prev.map((r) => (r.id === row.id ? { ...row } : r))
          : [{ ...row, id }, ...prev]
      );
      return id;
    }
    const { id, ...values } = row as any;
    const res = id
      ? await supabase.from(table).update(values).eq("id", id).select("id").single()
      : await supabase.from(table).insert(values).select("id").single();
    if (res.error) {
      setError("Enregistrement impossible. Vérifie les champs et tes droits admin.");
      return null;
    }
    await reload();
    return (res.data as any).id as string;
  }

  async function remove(id: string) {
    setError(null);
    if (!isSupabaseConfigured) {
      setRows((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    const { error: e } = await supabase.from(table).delete().eq("id", id);
    if (e) setError("Suppression impossible.");
    else await reload();
  }

  return { rows, loading, error, save, remove, reload };
}
