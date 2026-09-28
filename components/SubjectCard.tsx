import Link from "next/link";
import { Subject, Level } from "@/lib/sampleData";

export default function SubjectCard({
  subject,
  level
}: {
  subject: Subject;
  level: Level;
}) {
  return (
    <Link
      href={`/documents?level=${level}&subject=${subject.slug}`}
      className="card flex items-center gap-3 active:bg-gray-50"
    >
      <span className="text-2xl">{subject.icon}</span>
      <div>
        <p className="font-semibold text-sm">{subject.name}</p>
        <p className="text-xs text-gray-500">Documents · Quiz · Exercices</p>
      </div>
    </Link>
  );
}
