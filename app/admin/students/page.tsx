"use client";

import { useCrud } from "@/lib/admin";

interface Profile {
  id?: string;
  full_name: string | null;
  level: string | null;
  role: string;
  is_premium: boolean;
}

export default function AdminStudents() {
  const { rows, loading, error, save } = useCrud<Profile>("profiles");

  return (
    <>
      <h1 className="text-xl font-extrabold text-brand-900">Étudiants</h1>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mt-3">{error}</p>}
      {loading && <p className="text-sm text-gray-500 mt-4">Chargement...</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-10">Aucun étudiant pour l'instant.</p>
      )}
      <div className="flex flex-col gap-3 mt-4">
        {rows.map((p) => (
          <div key={p.id} className="card">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold text-sm">{p.full_name || "Sans nom"}</p>
                <p className="text-xs text-gray-500">
                  {p.level === "ns4" ? "NS4" : p.level === "9e-af" ? "9e AF" : "—"} ·{" "}
                  {p.role === "admin" ? "Admin" : "Étudiant"}
                </p>
              </div>
              <span className={p.is_premium ? "badge-premium" : "badge-free"}>
                {p.is_premium ? "Premium" : "Gratuit"}
              </span>
            </div>
            <button
              className="btn-secondary py-2 text-sm mt-3"
              onClick={() => save({ ...p, is_premium: !p.is_premium })}
            >
              {p.is_premium ? "Retirer le premium" : "Activer le premium"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
