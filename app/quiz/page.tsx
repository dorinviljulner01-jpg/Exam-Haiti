import Header from "@/components/Header";
import QuizCard from "@/components/QuizCard";
import { sampleQuizzes } from "@/lib/sampleData";

export default function QuizListPage() {
  return (
    <>
      <Header title="Quiz" />
      <main className="px-4 pb-8">
        <div className="pt-5 pb-2">
          <h1 className="text-xl font-extrabold text-brand-900">
            Quiz interactifs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Teste tes connaissances, matière par matière.
          </p>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          {sampleQuizzes.map((q) => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
      </main>
    </>
  );
}
