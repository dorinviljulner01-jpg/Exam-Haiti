"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import { useAdminGuard } from "@/lib/admin";

const tabs = [
  { href: "/admin", label: "Tableau" },
  { href: "/admin/students", label: "Étudiants" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/quizzes", label: "Quiz" },
  { href: "/admin/payments", label: "Paiements" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status, demo } = useAdminGuard();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <>
        <Header title="Administration" />
        <p className="p-6 text-center text-gray-500">Chargement...</p>
      </>
    );
  }

  if (status === "denied") {
    return (
      <>
        <Header title="Administration" />
        <main className="px-4 py-10 text-center">
          <p className="text-4xl">🔒</p>
          <p className="font-semibold mt-3">Accès réservé aux administrateurs.</p>
          <p className="text-sm text-gray-500 mt-1">
            Connecte-toi avec un compte administrateur pour continuer.
          </p>
          <Link href="/login" className="btn-primary mt-5 inline-block">
            Se connecter
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Administration" />
      {demo && (
        <p className="bg-yellow-50 text-yellow-800 text-xs px-4 py-2">
          Mode démo : Supabase n'est pas configuré. Les changements ne sont pas
          sauvegardés.
        </p>
      )}
      <nav className="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-gray-100">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`shrink-0 text-xs font-semibold rounded-full px-3 py-2 border ${
              pathname === t.href
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <main className="px-4 pb-8 pt-4">{children}</main>
    </>
  );
}
