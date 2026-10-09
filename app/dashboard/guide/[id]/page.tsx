import Link from "next/link";
import { ChapterView } from "@/components/Guide";
import { textLink } from "@/components/ui";
import { CHAPTERS } from "@/content/guide";

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ id: c.id }));
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = CHAPTERS.findIndex((c) => c.id === id);
  if (index === -1) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-4xl font-extrabold uppercase">Chapter not found</h1>
        <p className="mt-3 text-muted">This chapter may have been renamed or removed.</p>
        <Link href="/dashboard/guide" className={`mt-6 inline-block text-sm ${textLink}`}>
          See all chapters
        </Link>
      </div>
    );
  }
  return <ChapterView index={index} />;
}
