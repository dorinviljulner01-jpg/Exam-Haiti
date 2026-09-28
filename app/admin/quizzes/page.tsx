"use client";

import { useEffect, useState } from "react";
import { useCrud, useSubjects } from "@/lib/admin";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

interface Quiz {
  id?: string;
  title: string;
  level: string;
  subject_id: string;
  is_premium: boolean;
}

interface QRow {
  id?: string;
  question: string;
  level: string;
  subject_id: string;
}

const empty: Quiz = { title: "", level: "9e-af", subject_id: "", is_premium: false };

export default function AdminQuizzes() {
  const quizzes = useCrud<Quiz>("quizzes");
  const questions = useCrud<QRow>("questions", [], 200);
  const subjects = useSubjects();
  const [form, setForm] = useState<Quiz>(empty);
  const [selected, setSelected] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (patch: Partial<Quiz>) => setForm((f) => ({ ...f, ...patch }));
  const levelSubjects = subjects.filter((s) => s.level === form.level);
  const available = questions.rows.filter(
    (q) => q.level === form.level && (!form.subject_id || q.subject_id === form.subject_id)
  );

  // Nombre de questions par quiz (mode Supabase)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("quiz_questions")
      .select("quiz_id")
      .then(({ data }) => {
        const c: Record<string, number> = {};
        (data ?? []).forEach((r: any) => (c[r.quiz_id] = (c[r.quiz_id] ?? 0) + 1));
        setCounts(c);
      });
  }, [quizzes.rows]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title || !form.subject_id) {
      setMsg("Le titre et la matière sont obligatoires.");
      return;
    }
    if (selected.length === 0) {
      setMsg("Choisis au moins une question.");
      return;
    }
    setBusy(true);
    const id = await quizzes.save(form);
    if (id) {
      if (isSupabaseConfigured) {
        await supabase.from("quiz_questions").delete().eq("quiz_id", id);
        const { error } = await supabase.from("quiz_questions").insert(
          selected.map((qid, i) => ({ quiz_id: id, question_id: qid, position: i }))
        );
        if (error) {
          setBusy(false);
          setMsg("Le quiz est créé mais les questions n'ont pas pu être liées.");
          return;
        }
      } else {
        setCounts((c) => ({ ...c, [id]: selected.length }));
      }
      setMsg("Quiz enregistré ✅");
      setForm(empty);
      setSelected([]);
    }
    setBusy(false);
  }

  async function edit(q: Quiz) {
    setForm(q);
    if (isSupabaseConfigured && q.id) {
      const { data } = await supabase.from("quiz_questions").select("question_id").eq("quiz_id", q.id);
      setSelected((data ?? []).map((r: any) => r.question_id));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <h1 className="text-xl font-extrabold text-brand-900">Quiz</h1>

      <form onSubmit={submit} className="card flex flex-col gap-3 mt-4">
        <p className="font-semibold text-sm">{form.id ? "Modifier le quiz" : "Créer un quiz"}</p>
        <input className="input-field" placeholder="Titre du quiz" value={form.title}
          onChange={(e) => set({ title: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <select className="input-field" value={form.level}
            onChange={(e) => { set({ level: e.target.value, subject_id: "" }); setSelected([]); }}>
            <option value="9e-af">9e AF</option>
            <option value="ns4">NS4</option>
          </select>
          <select className="input-field" value={form.subject_id}
            onChange={(e) => set({ subject_id: e.target.value })}>
            <option value="">Matière</option>
            {levelSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_premium}
            onChange={(e) => set({ is_premium: e.target.checked })} />
          Contenu premium
        </label>

        <p className="text-sm font-semibold mt-1">
          Questions ({selected.length} choisie{selected.length > 1 ? "s" : ""})
        </p>
        <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
          {available.length === 0 && (
            <p className="text-xs text-gray-500">
              Aucune question pour ce niveau/cette matière. Ajoute-en dans l'onglet Questions.
            </p>
          )}
          {available.map((q) => (
            <label key={q.id} className="flex items-start gap-2 text-sm border border-gray-200 rounded-xl p-2">
              <input type="checkbox" className="mt-1" checked={selected.includes(q.id!)}
                onChange={() => toggle(q.id!)} />
              <span>{q.question}</span>
            </label>
          ))}
        </div>

        {msg && <p className="text-sm text-brand-700 bg-brand-50 rounded-xl px-3 py-2">{msg}</p>}
        {quizzes.error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{quizzes.error}</p>}
        <button className="btn-primary disabled:opacity-40" disabled={busy}>
          {busy ? "Enregistrement..." : "Enregistrer le quiz"}
        </button>
        {form.id && (
          <button type="button" className="btn-secondary" onClick={() => { setForm(empty); setSelected([]); }}>
            Annuler la modification
          </button>
        )}
      </form>

      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-6 mb-3">
        Quiz existants
      </h2>
      {quizzes.loading && <p className="text-sm text-gray-500">Chargement...</p>}
      {!quizzes.loading && quizzes.rows.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-6">Aucun quiz.</p>
      )}
      <div className="flex flex-col gap-3">
        {quizzes.rows.map((q) => (
          <div key={q.id} className="card">
            <div className="flex justify-between gap-2">
              <p className="font-semibold text-sm">{q.title}</p>
              <span className={q.is_premium ? "badge-premium" : "badge-free"}>
                {q.is_premium ? "Premium" : "Gratuit"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {q.level === "ns4" ? "NS4" : "9e AF"} · {counts[q.id!] ?? 0} questions
            </p>
            <div className="flex gap-2 mt-3">
              <button type="button" className="btn-secondary py-2 text-sm" onClick={() => edit(q)}>
                Modifier
              </button>
              <button type="button" className="btn-secondary py-2 text-sm !text-red-600 !border-red-300"
                onClick={() => q.id && confirm("Supprimer ce quiz ?") && quizzes.remove(q.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
