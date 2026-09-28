"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { sampleQuizzes } from "@/lib/sampleData";

type Answer = "a" | "b" | "c" | "d" | null;

export default function QuizPlayPage() {
  const params = useParams();
  const router = useRouter();
  const quiz = sampleQuizzes.find((q) => q.id === params.id);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    quiz ? Array(quiz.questions.length).fill(null) : []
  );
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [durationSec, setDurationSec] = useState(0);

  if (!quiz) {
    return (
      <>
        <Header title="Quiz" />
        <main className="px-4 py-10 text-center">
          <p className="text-gray-600">Ce quiz est introuvable.</p>
          <button className="btn-secondary mt-4" onClick={() => router.push("/quiz")}>
            Retour aux quiz
          </button>
        </main>
      </>
    );
  }

  const question = quiz.questions[current];
  const selected = answers[current];

  function selectAnswer(choice: Answer) {
    const next = [...answers];
    next[current] = choice;
    setAnswers(next);
  }

  function goNext() {
    if (current < quiz!.questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setDurationSec(Math.round((Date.now() - startTime) / 1000));
      setFinished(true);
    }
  }

  function goPrevious() {
    if (current > 0) setCurrent(current - 1);
  }

  function retry() {
    setAnswers(Array(quiz!.questions.length).fill(null));
    setCurrent(0);
    setFinished(false);
  }

  if (finished) {
    const correctCount = answers.filter(
      (a, i) => a === quiz.questions[i].correct
    ).length;
    const total = quiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);

    return (
      <>
        <Header title="Résultat" />
        <main className="px-4 pb-8">
          <div className="card text-center mt-6 py-8">
            <p className="text-sm text-gray-500">Ton score</p>
            <p className="text-4xl font-extrabold text-brand-700 mt-1">
              {correctCount}/{total}
            </p>
            <p className="text-lg font-semibold text-brand-600 mt-1">
              {percentage}%
            </p>
            <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
              <span>✅ {correctCount} correctes</span>
              <span>❌ {total - correctCount} incorrectes</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Temps utilisé : {durationSec}s
            </p>
          </div>

          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-6 mb-3">
            Corrections
          </h2>
          <div className="flex flex-col gap-3">
            {quiz.questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correct;
              return (
                <div key={q.id} className="card">
                  <p className="text-sm font-semibold">
                    {i + 1}. {q.question}
                  </p>
                  <p
                    className={`text-xs mt-2 font-medium ${
                      isCorrect ? "text-brand-600" : "text-red-600"
                    }`}
                  >
                    {isCorrect ? "✅ Bonne réponse" : "❌ Mauvaise réponse"} —
                    réponse correcte : {q.options[q.correct]}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button className="btn-primary" onClick={retry}>
              Refaire le quiz
            </button>
            <button className="btn-secondary" onClick={() => router.push("/quiz")}>
              Retour aux quiz
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title={quiz.title} />
      <main className="px-4 pb-8">
        <div className="pt-4">
          <p className="text-xs font-semibold text-gray-500">
            Question {current + 1} / {quiz.questions.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-brand-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${((current + 1) / quiz.questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="card mt-4">
          <p className="font-semibold text-base leading-snug">
            {question.question}
          </p>
          <div className="flex flex-col gap-2 mt-4">
            {(["a", "b", "c", "d"] as const).map((key) => (
              <button
                key={key}
                onClick={() => selectAnswer(key)}
                className={`text-left rounded-xl border-2 px-4 py-3 text-sm font-medium ${
                  selected === key
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                <span className="font-bold mr-2 uppercase">{key}.</span>
                {question.options[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          {current > 0 && (
            <button className="btn-secondary" onClick={goPrevious}>
              Précédent
            </button>
          )}
          <button
            className="btn-primary disabled:opacity-40"
            disabled={selected === null}
            onClick={goNext}
          >
            {current < quiz.questions.length - 1
              ? "Question suivante"
              : "Terminer le quiz"}
          </button>
        </div>
      </main>
    </>
  );
}
