"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import DocumentCard from "@/components/DocumentCard";
import { sampleDocuments } from "@/lib/sampleData";

function DocumentsContent() {
  const searchParams = useSearchParams();
  const [level, setLevel] = useState(searchParams.get("level") ?? "tous");
  const [access, setAccess] = useState("tous");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return sampleDocuments.filter((d) => {
      if (level !== "tous" && d.level !== level) return false;
      if (access === "gratuit" && d.isPremium) return false;
      if (access === "premium" && !d.isPremium) return false;
      if (
        search &&
        !d.title.toLowerCase().includes(search.toLowerCase()) &&
        !d.subject.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [level, access, search]);

  return (
    <>
      <Header title="Documents" />
      <main className="px-4 pb-8">
        <div className="pt-5 pb-2">
          <h1 className="text-xl font-extrabold text-brand-900">
            Bibliothèque de documents
          </h1>
        </div>

        <input
          type="text"
          placeholder="Rechercher un document, une matière..."
          className="input-field mt-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {[
            { v: "tous", label: "Tous niveaux" },
            { v: "9e-af", label: "9e AF" },
            { v: "ns4", label: "NS4" }
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setLevel(opt.v)}
              className={`shrink-0 text-xs font-semibold rounded-full px-3 py-2 border ${
                level === opt.v
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
          {[
            { v: "tous", label: "Gratuit + Premium" },
            { v: "gratuit", label: "Gratuit" },
            { v: "premium", label: "Premium" }
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setAccess(opt.v)}
              className={`shrink-0 text-xs font-semibold rounded-full px-3 py-2 border ${
                access === opt.v
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-10">
              Aucun document trouvé. Essaie une autre recherche.
            </p>
          ) : (
            filtered.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
          )}
        </div>
      </main>
    </>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-gray-500">Chargement...</p>}>
      <DocumentsContent />
    </Suspense>
  );
}
