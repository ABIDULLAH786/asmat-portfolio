import Link from "next/link";
import Image from "next/image";
import { getNotes } from "@/lib/queries";
import Reveal from "@/components/site/Reveal";
import { Button } from "@/components/ui/Button";
import { ExternalLink, FileText, ArrowRight, Notebook } from "lucide-react";

export const revalidate = 30;

export default async function NotesPage() {
  const notes = await getNotes().catch(() => []);

  return (
    <div className="relative">
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" aria-hidden />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <Reveal>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Notes</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Resources & Study Notes.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Hand-picked materials, references and learnings I share with the community.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.length === 0 ? (
            <div className="col-span-full rounded-md border border-dashed border-[#1a1a1a] p-12 text-center text-white/50">
              No notes yet. Check back soon.
            </div>
          ) : (
            notes.map((n, i) => (
              <Reveal key={n.id} delay={i * 0.04}>
                <article className="surface group flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a0a0a]">
                    {n.thumbnail_url ? (
                      <Image
                        src={n.thumbnail_url}
                        alt={n.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <Notebook size={42} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold text-white group-hover:text-[#00ff88] transition-colors">
                      {n.title}
                    </h3>
                    {n.description && (
                      <p className="mt-2 line-clamp-3 text-sm text-white/70 leading-relaxed">
                        {n.description}
                      </p>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2 pt-2">
                      <Button asChild variant="primary" size="sm">
                        <Link href={`/notes/${n.id}`}>
                          View Details <ArrowRight size={12} />
                        </Link>
                      </Button>
                      {n.external_link && (
                        <Button asChild variant="outline" size="sm">
                          <a href={n.external_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={12} /> Open Link
                          </a>
                        </Button>
                      )}
                      {n.file_url && (
                        <Button asChild variant="outline" size="sm">
                          <a href={n.file_url} target="_blank" rel="noopener noreferrer" download>
                            <FileText size={12} /> Open File
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
