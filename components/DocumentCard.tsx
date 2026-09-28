import { DocumentItem } from "@/lib/sampleData";

export default function DocumentCard({ doc }: { doc: DocumentItem }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-snug">{doc.title}</p>
        <span className={doc.isPremium ? "badge-premium" : "badge-free"}>
          {doc.isPremium ? "Premium" : "Gratuit"}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {doc.level === "9e-af" ? "9e AF" : "NS4"} · {doc.subject} · {doc.year}
      </p>
      <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
      <div className="flex gap-2 mt-3">
        <button className="btn-secondary py-2 text-sm">Voir</button>
        <button
          className="btn-primary py-2 text-sm"
          disabled={doc.isPremium}
          title={doc.isPremium ? "Contenu premium — abonnement requis" : ""}
        >
          {doc.isPremium ? "🔒 Télécharger" : "Télécharger"}
        </button>
      </div>
    </div>
  );
}
