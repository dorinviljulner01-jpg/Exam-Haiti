// Données de démonstration pour le MVP (Stage 1).
// ⚠️ Ce sont des questions et documents FICTIFS créés pour la démo.
// Ce ne sont PAS des sujets d'examens officiels.

export type Level = "9e-af" | "ns4";

export interface Subject {
  slug: string;
  name: string;
  icon: string;
}

export const subjects9eAF: Subject[] = [
  { slug: "francais", name: "Français", icon: "📖" },
  { slug: "mathematiques", name: "Mathématiques", icon: "➗" },
  { slug: "sciences-experimentales", name: "Sciences expérimentales", icon: "🔬" },
  { slug: "sciences-sociales", name: "Sciences sociales", icon: "🌍" },
  { slug: "creole", name: "Créole", icon: "🗣️" },
  { slug: "anglais", name: "Anglais", icon: "🇬🇧" },
  { slug: "espagnol", name: "Espagnol", icon: "🇪🇸" },
  { slug: "eac", name: "Éducation à la citoyenneté", icon: "🏛️" },
  { slug: "etap", name: "ETAP", icon: "🛠️" },
  { slug: "eps", name: "EPS", icon: "⚽" },
  { slug: "eea", name: "EEA", icon: "🎨" }
];

export const subjectsNS4: Subject[] = [
  { slug: "francais", name: "Français", icon: "📖" },
  { slug: "mathematiques", name: "Mathématiques", icon: "➗" },
  { slug: "philosophie", name: "Philosophie", icon: "💭" },
  { slug: "physique", name: "Physique", icon: "⚛️" },
  { slug: "chimie", name: "Chimie", icon: "🧪" },
  { slug: "biologie", name: "Biologie", icon: "🧬" },
  { slug: "anglais", name: "Anglais", icon: "🇬🇧" },
  { slug: "creole", name: "Créole", icon: "🗣️" },
  { slug: "histoire-geo", name: "Histoire-Géographie", icon: "🗺️" }
];

export interface DocumentItem {
  id: string;
  title: string;
  level: Level;
  subject: string;
  year: number;
  description: string;
  isPremium: boolean;
}

export const sampleDocuments: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Examen de Mathématiques — 9e AF — 2024 (exemple)",
    level: "9e-af",
    subject: "Mathématiques",
    year: 2024,
    description: "Document de démonstration pour s'entraîner sur les exercices type examen.",
    isPremium: false
  },
  {
    id: "doc-2",
    title: "Révision de Français — NS4",
    level: "ns4",
    subject: "Français",
    year: 2023,
    description: "Fiche de révision sur la grammaire et la compréhension de texte.",
    isPremium: false
  },
  {
    id: "doc-3",
    title: "Résumé de Sciences expérimentales — 9e AF",
    level: "9e-af",
    subject: "Sciences expérimentales",
    year: 2024,
    description: "Résumé des notions clés avant l'examen.",
    isPremium: true
  },
  {
    id: "doc-4",
    title: "Physique — Mécanique — NS4",
    level: "ns4",
    subject: "Physique",
    year: 2024,
    description: "Cours complet sur la mécanique avec exercices corrigés.",
    isPremium: true
  }
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  correct: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: "facile" | "moyen" | "difficile";
}

export interface Quiz {
  id: string;
  title: string;
  level: Level;
  subject: string;
  isPremium: boolean;
  questions: QuizQuestion[];
}

export const sampleQuizzes: Quiz[] = [
  {
    id: "quiz-math-9eaf",
    title: "Mathématiques — Nombres et opérations",
    level: "9e-af",
    subject: "Mathématiques",
    isPremium: false,
    questions: [
      {
        id: "q1",
        question: "Combien font 12 × 8 ?",
        options: { a: "86", b: "96", c: "108", d: "112" },
        correct: "b",
        explanation: "12 × 8 = 96.",
        difficulty: "facile"
      },
      {
        id: "q2",
        question: "Quel est le résultat de 15 % de 200 ?",
        options: { a: "20", b: "25", c: "30", d: "35" },
        correct: "c",
        explanation: "15 % de 200 = 0,15 × 200 = 30.",
        difficulty: "moyen"
      },
      {
        id: "q3",
        question: "Quelle est la valeur de x dans 3x + 5 = 20 ?",
        options: { a: "3", b: "5", c: "7", d: "15" },
        correct: "b",
        explanation: "3x = 15 donc x = 5.",
        difficulty: "moyen"
      },
      {
        id: "q4",
        question: "Le périmètre d'un carré de côté 6 cm est :",
        options: { a: "12 cm", b: "18 cm", c: "24 cm", d: "36 cm" },
        correct: "c",
        explanation: "Périmètre = 4 × côté = 4 × 6 = 24 cm.",
        difficulty: "facile"
      },
      {
        id: "q5",
        question: "Quel nombre est premier ?",
        options: { a: "9", b: "15", c: "21", d: "17" },
        correct: "d",
        explanation: "17 n'est divisible que par 1 et lui-même.",
        difficulty: "difficile"
      }
    ]
  },
  {
    id: "quiz-francais-ns4",
    title: "Français — Grammaire",
    level: "ns4",
    subject: "Français",
    isPremium: false,
    questions: [
      {
        id: "q1",
        question: "Quel est le sujet dans « Les élèves étudient sérieusement » ?",
        options: { a: "étudient", b: "Les élèves", c: "sérieusement", d: "aucun" },
        correct: "b",
        explanation: "« Les élèves » est le groupe sujet.",
        difficulty: "facile"
      },
      {
        id: "q2",
        question: "Choisissez la bonne orthographe :",
        options: { a: "Ils se sont parlés", b: "Ils se sont parlé", c: "Ils se sont parler", d: "Ils s'ai parlé" },
        correct: "b",
        explanation: "« Se parler » : le COD n'est pas direct, le participe reste invariable.",
        difficulty: "difficile"
      },
      {
        id: "q3",
        question: "« Rapidement » est un(e) :",
        options: { a: "nom", b: "adjectif", c: "adverbe", d: "verbe" },
        correct: "c",
        explanation: "« Rapidement » modifie un verbe : c'est un adverbe.",
        difficulty: "moyen"
      }
    ]
  }
];
