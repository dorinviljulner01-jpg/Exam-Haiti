"use client";

import { useState } from "react";
import { useCrud, useSubjects } from "@/lib/admin";

interface Question {
  id?: string;
  level: string;
  subject_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: "facile" | "moyen" | "difficile";
  source: string;
  year: number | null;
  is_premium: boolean;
}

const empty: Question = {
  level: "9e-af", subject_id: "", question: "",
  option_a: "", option_b: "", option_c: "", option_d: "",
  correct_answer: "a", explanation: "", difficulty: "moyen",
  source: "Question de démonstration", year: null, is_premium: false
};

export default function AdminQuestions() {
  const { rows, loading, error, save, remove } = useCrud<Question>("questions");
  const subjects = useSubjects();
  const [form, setForm] = useState<Question>(empty);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (patch: Partial<Question>) => setForm((f) => ({ ...f, ...patch }));
  const levelSubjects = subjects.filter((s) => s.level === form.level);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.subject_id || !form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setMsg("Remplis la matière, la question et les 4 réponses.");
      return;
    }
    setBusy(true);
    const id = await save(form);
    setBusy(false);
    if (id) {
      setMsg("Question enregistrée ✅");
      setForm({ ...empty, level: form.level, subject_id: form.subject_id });
    }
  }

  return (
    <>
      <h1 className="text-xl font-extrabold text-brand-900">Questions</h1>

      <form onSubmit={submit} className="card flex flex-col gap-3 mt-4">
        <p className="font-semibold text-sm">{form.id ? "Modifier la question" : "Ajouter une question"}</p>
        <div className="grid grid-cols-2 gap-2">
          <select className="input-field" value={form.level}
            onChange={(e) => set({ level: e.target.value, subject_id: "" })}>
            <option value="9e-af">9e AF</option>
            <option value="ns4">NS4</option>
          </select>
          <select className="input-field" value={form.difficulty}
            onChange={(e) => set({ difficulty: e.target.value as Question["difficulty"] })}>
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
          </select>
        </div>
        <select className="input-field" value={form.subject_id}
          onChange={(e) => set({ subject_id: e.target.value })}>
          <option value="">Choisir la matière</option>
          {levelSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <textarea className="input-field" rows={3} placeholder="Question" value={form.question}
          onChange={(e) => set({ question: e.target.value })} />
        {(["a", "b", "c", "d"] as const).map((k) => (
          <div key={k} className="flex items-center gap-2">
            <input type="radio" name="correct" checked={form.correct_answer === k}
              onChange={() => set({ correct_answer: k })} aria-label={`Réponse correcte ${k}`} />
            <input className="input-field" placeholder={`Réponse ${k.toUpperCase()}`}
              value={form[`option_${k}` as const]}
              onChange={(e) => set({ [`option_${k}`]: e.target.value } as Partial<Question>)} />
          </div>
        ))}
        <p className="text-xs text-gray-400">Coche le bouton à côté de la bonne réponse.</p>
        <textarea className="input-field" rows={2} placeholder="Explication" value={form.explanation}
          onChange={(e) => set({ explanation: e.target.value })} />
        <input className="input-field" placeholder="Source" value={form.source}
          onChange={(e) => set({ source: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_premium}
            onChange={(e) => set({ is_premium: e.target.checked })} />
          Contenu premium
        </label>
        {msg && <p className="text-sm text-brand-700 bg-brand-50 rounded-xl px-3 py-2">{msg}</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        <button className="btn-primary disabled:opacity-40" disabled={busy}>
          {busy ? "Enregistrement..." : "Enregistrer"}
        </button>
        {form.id && (
          <button type="button" className="btn-secondary" onClick={() => setForm(empty)}>
            Annuler la modification
          </button>
        )}
      </form>

      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-6 mb-3">
        Questions existantes ({rows.length})
      </h2>
      {loading && <p className="text-sm text-gray-500">Chargement...</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-6">Aucune question.</p>
      )}
      <div className="flex flex-col gap-3">
        {rows.map((q) => (
          <div key={q.id} className="card">
            <p className="font-semibold text-sm">{q.question}</p>
            <p className="text-xs text-gray-500 mt-1">
              {q.level === "ns4" ? "NS4" : "9e AF"} · {q.difficulty} ·{" "}
              {q.is_premium ? "Premium" : "Gratuit"} · bonne réponse : {q.correct_answer.toUpperCase()}
            </p>
            <div className="flex gap-2 mt-3">
              <button className="btn-secondary py-2 text-sm" onClick={() => { setForm(q); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Modifier
              </button>
              <button className="btn-secondary py-2 text-sm !text-red-600 !border-red-300"
                onClick={() => q.id && confirm("Supprimer cette question ?") && remove(q.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
