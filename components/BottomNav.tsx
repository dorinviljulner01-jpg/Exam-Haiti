"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/documents", label: "Documents", icon: "📚" },
  { href: "/quiz", label: "Quiz", icon: "🧠" },
  { href: "/dashboard", label: "Progression", icon: "📊" },
  { href: "/login", label: "Profil", icon: "👤" }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="container-app grid grid-cols-5">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 text-xs font-medium ${
                active ? "text-brand-700" : "text-gray-400"
              }`}
            >
              <span className="text-xl leading-none mb-0.5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
