import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/queries";
import ProjectDetailClient from "./ProjectDetailClient";
import Reveal from "@/components/site/Reveal";
import { ChevronLeft } from "lucide-react";

export const revalidate = 30;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug).catch(() => null);
  if (!data) notFound();
  const { project, slides, category } = data;

  return (
    <article className="relative">
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" aria-hidden />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8 md:py-20">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#00ff88]"
        >
          <ChevronLeft size={14} /> Back to Portfolio
        </Link>

        <header className="mt-8">
          {category && (
            <Reveal>
              <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">
                {category.name}
              </p>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              {project.title}
            </h1>
          </Reveal>
          {project.description && (
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/75">
                {project.description}
              </p>
            </Reveal>
          )}
        </header>

        <ProjectDetailClient slides={slides} cover={project.cover_image} />
      </div>
    </article>
  );
}
