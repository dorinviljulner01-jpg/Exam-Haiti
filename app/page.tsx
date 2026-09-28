import Link from "next/link";
import Header from "@/components/Header";

const features = [
  { icon: "📚", label: "Documents de révision" },
  { icon: "🧠", label: "Quiz interactifs" },
  { icon: "⏱️", label: "Examens blancs chronométrés" },
  { icon: "📊", label: "Suivi des progrès" },
  { icon: "🔐", label: "Contenu premium" }
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="px-4 pb-8">
        {/* Hero */}
        <section className="pt-8 pb-6 text-center">
          <h1 className="text-2xl font-extrabold text-brand-900 leading-snug">
            Préparez vos examens avec confiance
          </h1>
          <p className="text-gray-600 text-sm mt-3">
            Révisez, entraînez-vous et testez vos connaissances avec nos
            documents, quiz et examens blancs.
          </p>
          <div className="flex flex-col gap-3 mt-5">
            <Link href="/register" className="btn-primary">
              Commencer gratuitement
            </Link>
            <Link href="/documents" className="btn-secondary">
              Voir les programmes
            </Link>
          </div>
        </section>

        {/* Exam categories */}
        <section className="mt-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Choisis ton niveau
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/9e-af"
              className="card flex items-center justify-between active:bg-gray-50"
            >
              <div>
                <p className="font-bold text-brand-800">9e AF</p>
                <p className="text-xs text-gray-500 mt-1">
                  Documents · Quiz · Examens blancs
                </p>
              </div>
              <span className="text-2xl">➡️</span>
            </Link>
            <Link
              href="/ns4"
              className="card flex items-center justify-between active:bg-gray-50"
            >
              <div>
                <p className="font-bold text-brand-800">NS4</p>
                <p className="text-xs text-gray-500 mt-1">
                  Documents · Quiz · Examens blancs
                </p>
              </div>
              <span className="text-2xl">➡️</span>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mt-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Pourquoi ExamHaiti ?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.label} className="card text-center py-5">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-xs font-medium text-gray-700">{f.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
