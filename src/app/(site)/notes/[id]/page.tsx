import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ExternalLink, FileText } from "lucide-react";

export const revalidate = 30;

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getNoteById(id).catch(() => null);
  if (!note) notFound();

  const isPdf = note.file_url?.toLowerCase().endsWith(".pdf");

  return (
    <article className="relative">
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" aria-hidden />
      <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8 md:py-20">
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#00ff88]"
        >
          <ChevronLeft size={14} /> Back to Notes
        </Link>

        <header className="mt-8">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">{note.title}</h1>
        </header>

        {note.thumbnail_url && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#1a1a1a]">
            <Image
              src={note.thumbnail_url}
              alt={note.title}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        )}

        {note.description && (
          <div className="mt-8 surface p-6 md:p-8">
            <p className="whitespace-pre-wrap text-base leading-relaxed text-white/80">
              {note.description}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {note.file_url && (
            <Button asChild variant="primary" size="lg">
              <a href={note.file_url} target="_blank" rel="noopener noreferrer" download>
                <FileText size={14} /> {isPdf ? "Open PDF" : "Open File"}
              </a>
            </Button>
          )}
          {note.external_link && (
            <Button asChild variant="outline" size="lg">
              <a href={note.external_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} /> Open Link
              </a>
            </Button>
          )}
        </div>

        {isPdf && note.file_url && (
          <div className="mt-10 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-2">
            <iframe
              src={note.file_url}
              className="h-[80vh] w-full rounded-md"
              title={note.title}
            />
          </div>
        )}
      </div>
    </article>
  );
}
