import Header from "@/components/Header";
import SubjectCard from "@/components/SubjectCard";
import { subjects9eAF } from "@/lib/sampleData";

export default function NeuvièmeAFPage() {
  return (
    <>
      <Header title="9e AF" />
      <main className="px-4 pb-8">
        <div className="pt-5 pb-2">
          <h1 className="text-xl font-extrabold text-brand-900">
            Matières — 9e Année Fondamentale
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choisis une matière pour accéder aux documents, quiz et
            exercices.
          </p>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          {subjects9eAF.map((s) => (
            <SubjectCard key={s.slug} subject={s} level="9e-af" />
          ))}
        </div>
      </main>
    </>
  );
}
