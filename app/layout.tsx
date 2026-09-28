import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "ExamHaiti — Prépare tes examens 9e AF et NS4",
  description:
    "Plateforme éducative mobile pour préparer les examens officiels 9e AF et NS4 en Haïti : documents, quiz et examens blancs."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 font-sans min-h-screen pb-20">
        <div className="container-app">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
