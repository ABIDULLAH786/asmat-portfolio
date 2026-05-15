import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/queries";
import ProjectDetailClient from "./ProjectDetailClient";
import Reveal from "@/components/site/Reveal";
import DynamicIcon from "@/components/site/DynamicIcon";
import { detectProjectSource } from "@/lib/projectSource";
import { ChevronLeft, ExternalLink } from "lucide-react";

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
  const source = detectProjectSource(project.source_url);

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

          {source && project.source_url && (
            <Reveal delay={0.15}>
              <a
                href={project.source_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${source.label} (opens in new tab)`}
                className="group mt-6 inline-flex items-center gap-3 rounded-full border border-[#00ff88]/40 bg-[#00ff88]/5 px-5 py-2.5 font-display text-[11px] uppercase tracking-[0.2em] text-[#00ff88] transition-all hover:border-[#00ff88] hover:bg-[#00ff88] hover:text-black hover:shadow-[0_0_22px_rgba(0,255,136,0.45)]"
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  <DynamicIcon name={source.icon} size={14} />
                </span>
                {source.label}
                <ExternalLink
                  size={12}
                  className="opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </a>
            </Reveal>
          )}
        </header>

        <ProjectDetailClient slides={slides} cover={project.cover_image} />
      </div>
    </article>
  );
}
