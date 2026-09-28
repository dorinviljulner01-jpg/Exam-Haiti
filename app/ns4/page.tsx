import Header from "@/components/Header";
import SubjectCard from "@/components/SubjectCard";
import { subjectsNS4 } from "@/lib/sampleData";

export default function NS4Page() {
  return (
    <>
      <Header title="NS4" />
      <main className="px-4 pb-8">
        <div className="pt-5 pb-2">
          <h1 className="text-xl font-extrabold text-brand-900">
            Matières — NS4
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choisis une matière pour accéder aux documents, quiz et
            exercices.
          </p>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          {subjectsNS4.map((s) => (
            <SubjectCard key={s.slug} subject={s} level="ns4" />
          ))}
        </div>
      </main>
    </>
  );
}
