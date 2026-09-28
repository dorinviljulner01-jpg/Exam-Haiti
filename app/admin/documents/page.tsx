"use client";

import { useState } from "react";
import { useCrud, useSubjects } from "@/lib/admin";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

interface Doc {
  id?: string;
  title: string;
  description: string;
  level: string;
  subject_id: string;
  year: number | null;
  file_url: string | null;
  is_premium: boolean;
}

const empty: Doc = {
  title: "", description: "", level: "9e-af", subject_id: "",
  year: new Date().getFullYear(), file_url: null, is_premium: false
};

export default function AdminDocuments() {
  const { rows, loading, error, save, remove } = useCrud<Doc>("documents");
  const subjects = useSubjects();
  const [form, setForm] = useState<Doc>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const levelSubjects = subjects.filter((s) => s.level === form.level);
  const set = (patch: Partial<Doc>) => setForm((f) => ({ ...f, ...patch }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title || !form.subject_id) {
      setMsg("Le titre et la matière sont obligatoires.");
      return;
    }
    setBusy(true);
    let file_url = form.file_url;
    if (file && isSupabaseConfigured) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
      if (upErr) {
        setBusy(false);
        setMsg("Échec de l'envoi du fichier. Réessaie.");
        return;
      }
      file_url = path;
    }
    const id = await save({ ...form, file_url });
    setBusy(false);
    if (id) {
      setMsg("Document enregistré ✅");
      setForm(empty);
      setFile(null);
    }
  }

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "—";

  return (
    <>
      <h1 className="text-xl font-extrabold text-brand-900">Documents</h1>

      <form onSubmit={submit} className="card flex flex-col gap-3 mt-4">
        <p className="font-semibold text-sm">{form.id ? "Modifier le document" : "Ajouter un document"}</p>
        <input className="input-field" placeholder="Titre" value={form.title}
          onChange={(e) => set({ title: e.target.value })} />
        <textarea className="input-field" rows={2} placeholder="Description" value={form.description}
          onChange={(e) => set({ description: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <select className="input-field" value={form.level}
            onChange={(e) => set({ level: e.target.value, subject_id: "" })}>
            <option value="9e-af">9e AF</option>
            <option value="ns4">NS4</option>
          </select>
          <input className="input-field" type="number" placeholder="Année" value={form.year ?? ""}
            onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <select className="input-field" value={form.subject_id}
          onChange={(e) => set({ subject_id: e.target.value })}>
          <option value="">Choisir la matière</option>
          {levelSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="file" accept=".pdf,.doc,.docx,image/*" className="text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <p className="text-xs text-gray-400">
          Envoie seulement des documents que tu as le droit de diffuser.
        </p>
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
          <button type="button" className="btn-secondary" onClick={() => { setForm(empty); setFile(null); }}>
            Annuler la modification
          </button>
        )}
      </form>

      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-6 mb-3">
        Documents existants
      </h2>
      {loading && <p className="text-sm text-gray-500">Chargement...</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-6">Aucun document.</p>
      )}
      <div className="flex flex-col gap-3">
        {rows.map((d) => (
          <div key={d.id} className="card">
            <div className="flex justify-between gap-2">
              <p className="font-semibold text-sm">{d.title}</p>
              <span className={d.is_premium ? "badge-premium" : "badge-free"}>
                {d.is_premium ? "Premium" : "Gratuit"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {d.level === "ns4" ? "NS4" : "9e AF"} · {subjectName(d.subject_id)} · {d.year ?? "—"}
            </p>
            <div className="flex gap-2 mt-3">
              <button className="btn-secondary py-2 text-sm" onClick={() => { setForm(d); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Modifier
              </button>
              <button className="btn-secondary py-2 text-sm !text-red-600 !border-red-300"
                onClick={() => d.id && confirm("Supprimer ce document ?") && remove(d.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
