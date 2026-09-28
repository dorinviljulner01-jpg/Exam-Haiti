import Link from "next/link";

export default function Header({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
            E
          </span>
          <span className="font-bold text-lg text-brand-800">
            {title ?? "ExamHaiti"}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-semibold text-brand-700 px-3 py-2"
          >
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
}
