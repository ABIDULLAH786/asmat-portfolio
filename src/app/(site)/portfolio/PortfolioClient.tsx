"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Star } from "lucide-react";
import type { Category, Project } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  projects: Project[];
  pagerEnabled?: boolean;
  perPage?: number;
};

const ALL = "__all__";

export default function PortfolioClient({
  categories,
  projects,
  pagerEnabled = false,
  perPage = 9,
}: Props) {
  const [active, setActive] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const railRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const filtered = useMemo(() => {
    if (active === ALL) return projects;
    return projects.filter((p) => p.category_id === active);
  }, [active, projects]);

  // Pagination math
  const totalPages = pagerEnabled
    ? Math.max(1, Math.ceil(filtered.length / perPage))
    : 1;
  const safePage = Math.min(page, totalPages);
  const visibleProjects = pagerEnabled
    ? filtered.slice((safePage - 1) * perPage, safePage * perPage)
    : filtered;

  // Reset to page 1 whenever the category changes
  useEffect(() => {
    setPage(1);
  }, [active]);

  // Track overflow state to show arrows only when needed
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      const overflows = el.scrollWidth > el.clientWidth + 2;
      setShowLeft(overflows && el.scrollLeft > 4);
      setShowRight(overflows && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [categories.length]);

  const scrollBy = (delta: number) => {
    railRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="mt-10">
      {/* Filter rail */}
      <div className="relative">
        {showLeft && (
          <button
            type="button"
            onClick={() => scrollBy(-220)}
            aria-label="Scroll categories left"
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[#1a1a1a] bg-black p-2 text-[#00ff88] hover:border-[#00ff88] sm:flex"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {showRight && (
          <button
            type="button"
            onClick={() => scrollBy(220)}
            aria-label="Scroll categories right"
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[#1a1a1a] bg-black p-2 text-[#00ff88] hover:border-[#00ff88] sm:flex"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <div className="flex items-center gap-2 sm:px-10">
          {/* Mobile arrows on the sides */}
          {showLeft && (
            <button
              type="button"
              onClick={() => scrollBy(-180)}
              aria-label="Scroll left"
              className="flex shrink-0 items-center justify-center rounded-full border border-[#1a1a1a] bg-black p-2 text-[#00ff88] sm:hidden"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div
            ref={railRef}
            className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            <FilterPill
              active={active === ALL}
              onClick={() => setActive(ALL)}
              label="All Work"
            />
            {categories.map((c) => (
              <FilterPill
                key={c.id}
                active={active === c.id}
                onClick={() => setActive(c.id)}
                label={c.name}
              />
            ))}
          </div>

          {showRight && (
            <button
              type="button"
              onClick={() => scrollBy(180)}
              aria-label="Scroll right"
              className="flex shrink-0 items-center justify-center rounded-full border border-[#1a1a1a] bg-black p-2 text-[#00ff88] sm:hidden"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-10">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-md border border-dashed border-[#1a1a1a] py-20 text-center text-white/50"
            >
              No projects in this category yet.
            </motion.p>
          ) : (
            <motion.div
              key={`${active}-${safePage}`}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
              }}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visibleProjects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {pagerEnabled && filtered.length > perPage && (
          <Pager
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            perPage={perPage}
            onChange={(p) => {
              setPage(p);
              // Scroll the grid back into view on page change
              if (typeof window !== "undefined") {
                window.scrollTo({ top: window.scrollY - 80, behavior: "smooth" });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Themed pager — black + neon green
 * ============================================================ */
function Pager({
  page,
  totalPages,
  total,
  perPage,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}) {
  const items = paginate(page, totalPages);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <motion.nav
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      aria-label="Portfolio pagination"
      className="mt-12 flex flex-col items-center gap-3"
    >
      <div className="flex items-center gap-2">
        <PagerButton
          disabled={page <= 1}
          onClick={() => onChange(Math.max(1, page - 1))}
          ariaLabel="Previous page"
          icon
        >
          <ChevronLeft size={14} />
        </PagerButton>

        <div className="flex items-center gap-1.5">
          {items.map((it, i) =>
            it === "…" ? (
              <span
                key={`gap-${i}`}
                className="px-1 font-display text-xs tracking-[0.2em] text-white/40"
              >
                …
              </span>
            ) : (
              <PageNumber
                key={it}
                value={it}
                active={it === page}
                onClick={() => onChange(it)}
              />
            )
          )}
        </div>

        <PagerButton
          disabled={page >= totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          ariaLabel="Next page"
          icon
        >
          <ChevronRight size={14} />
        </PagerButton>
      </div>

      <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/45">
        Showing {from}–{to} of {total}
      </p>
    </motion.nav>
  );
}

function PagerButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  icon?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={!disabled ? { scale: 1.06 } : undefined}
      whileTap={!disabled ? { scale: 0.94 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      data-cursor="hover"
      className={cn(
        "flex h-9 items-center justify-center rounded-full border font-display text-[10px] uppercase tracking-[0.2em] transition-colors",
        icon ? "w-9" : "px-3",
        disabled
          ? "cursor-not-allowed border-[#1a1a1a] text-white/25"
          : "border-[#1a1a1a] text-white/70 hover:border-[#00ff88] hover:text-[#00ff88]"
      )}
    >
      {children}
    </motion.button>
  );
}

function PageNumber({
  value,
  active,
  onClick,
}: {
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      aria-current={active ? "page" : undefined}
      data-cursor="hover"
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full border font-display text-xs transition-colors",
        active
          ? "border-[#00ff88] text-black"
          : "border-[#1a1a1a] text-white/70 hover:border-[#00ff88] hover:text-[#00ff88]"
      )}
    >
      {active && (
        <motion.span
          layoutId="pager-active"
          className="absolute inset-0 rounded-full bg-[#00ff88] shadow-[0_0_18px_rgba(0,255,136,0.45)]"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-10">{value}</span>
    </motion.button>
  );
}

/**
 * Build a compact page list: 1 … current-1 current current+1 … N
 * Always shows first + last, plus a small window around current.
 */
function paginate(page: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | "…"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative shrink-0 rounded-full border px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] transition-colors",
        active
          ? "border-[#00ff88] text-black"
          : "border-[#1a1a1a] bg-transparent text-white/70 hover:border-[#00ff88] hover:text-[#00ff88]"
      )}
      data-cursor="hover"
    >
      {active && (
        <motion.span
          layoutId="filter-pill-active"
          className="absolute inset-0 rounded-full bg-[#00ff88] shadow-[0_0_18px_rgba(0,255,136,0.4)]"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className="h-full"
    >
      <Link
        href={`/portfolio/${p.slug}`}
        className="surface group relative block h-full overflow-hidden"
        data-cursor="hover"
        aria-label={`Open ${p.title}`}
      >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0a0a0a]">
        {p.cover_image ? (
          <Image
            src={p.cover_image}
            alt={p.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30">
            <ImageIcon size={36} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>
      <div className="p-5">
        <h3 className="font-display text-base font-semibold text-white group-hover:text-[#00ff88] transition-colors">
          {p.title}
        </h3>
        {p.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-white/60">{p.description}</p>
        )}
        {p.tags && p.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#1a1a1a] bg-[#0f0f0f] px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-white/60"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      {p.featured && (
        <span
          className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#00ff88] px-2 py-1 font-display text-[9px] uppercase tracking-[0.2em] text-black"
          aria-label="Featured"
        >
          <Star size={10} /> Featured
        </span>
      )}
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-[#00ff88] px-2 py-1 font-display text-[9px] uppercase tracking-[0.2em] text-black opacity-0 transition-opacity group-hover:opacity-100">
        View
      </span>
      </Link>
    </motion.div>
  );
}
