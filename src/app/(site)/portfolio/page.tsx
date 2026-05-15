import {
  getCategories,
  getCategoryCounts,
  getProjects,
  getSiteSettings,
} from "@/lib/queries";
import PortfolioClient from "./PortfolioClient";
import Reveal from "@/components/site/Reveal";

export const revalidate = 30;

export default async function PortfolioPage() {
  const [allCats, projects, counts, settings] = await Promise.all([
    getCategories().catch(() => []),
    getProjects().catch(() => []),
    getCategoryCounts().catch(() => new Map()),
    getSiteSettings().catch(() => null),
  ]);

  // Only categories that actually have projects
  const cats = allCats.filter((c) => (counts.get(c.id) ?? 0) > 0);
  const pagerEnabled = settings?.portfolio_pagination_enabled ?? false;
  const perPage = Math.max(1, Math.min(100, settings?.portfolio_per_page ?? 9));

  return (
    <div className="relative">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" aria-hidden />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div>
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Portfolio</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Selected Work.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-xl text-white/70">
              A collection of projects across identity, illustration, packaging, and more.
            </p>
          </Reveal>
        </div>

        <PortfolioClient
          categories={cats}
          projects={projects}
          pagerEnabled={pagerEnabled}
          perPage={perPage}
        />
      </div>
    </div>
  );
}
