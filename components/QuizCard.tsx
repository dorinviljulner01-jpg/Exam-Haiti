import Link from "next/link";
import { Quiz } from "@/lib/sampleData";

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <Link href={`/quiz/${quiz.id}`} className="card block active:bg-gray-50">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-snug">{quiz.title}</p>
        <span className={quiz.isPremium ? "badge-premium" : "badge-free"}>
          {quiz.isPremium ? "Premium" : "Gratuit"}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {quiz.level === "9e-af" ? "9e AF" : "NS4"} · {quiz.subject} ·{" "}
        {quiz.questions.length} questions
      </p>
    </Link>
  );
}
