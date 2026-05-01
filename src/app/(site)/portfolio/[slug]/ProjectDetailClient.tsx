"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import type { ProjectSlide } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Props = { slides: ProjectSlide[]; cover: string | null };

export default function ProjectDetailClient({ slides, cover }: Props) {
  const tabs = useMemo<ProjectSlide[]>(() => {
    if (slides.length > 0) return slides;
    if (cover) {
      return [
        {
          id: "cover",
          project_id: "",
          title: "Overview",
          description: null,
          images: [cover],
          sort_order: 0,
          created_at: "",
        },
      ];
    }
    return [];
  }, [slides, cover]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);
  // Slide direction for image transitions: 1 = next, -1 = prev
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (tabs.length === 0) return;
    function onKey(e: KeyboardEvent) {
      const n = tabs[activeIdx]?.images?.length ?? 0;
      if (n < 2) return;
      if (e.key === "ArrowLeft") {
        setDir(-1);
        setImageIdx((i) => (i - 1 + n) % n);
      } else if (e.key === "ArrowRight") {
        setDir(1);
        setImageIdx((i) => (i + 1) % n);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx, tabs]);

  if (tabs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-12 rounded-md border border-dashed border-[#1a1a1a] py-20 text-center text-white/50"
      >
        No project visuals yet.
      </motion.div>
    );
  }

  const activeTab = tabs[activeIdx];
  const images = activeTab.images ?? [];
  const safeImageIdx = Math.min(imageIdx, Math.max(images.length - 1, 0));
  const currentImage = images[safeImageIdx];

  const setTab = (i: number) => {
    setDir(i > activeIdx ? 1 : -1);
    setActiveIdx(i);
    setImageIdx(0);
  };

  const next = () => {
    setDir(1);
    setImageIdx((i) => (i + 1) % images.length);
  };
  const prev = () => {
    setDir(-1);
    setImageIdx((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      className="mt-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Tabs */}
      {tabs.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4"
        >
          {tabs.map((t, i) => {
            const active = activeIdx === i;
            return (
              <motion.button
                key={t.id}
                onClick={() => setTab(i)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className={cn(
                  "relative shrink-0 rounded-full border px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] transition-colors",
                  active
                    ? "border-[#00ff88] text-black"
                    : "border-[#1a1a1a] text-white/70 hover:border-[#00ff88] hover:text-[#00ff88]"
                )}
                data-cursor="hover"
              >
                {active && (
                  <motion.span
                    layoutId="project-tab-active"
                    className="absolute inset-0 rounded-full bg-[#00ff88]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{t.title || `Slide ${i + 1}`}</span>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Big image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]"
      >
        <AnimatePresence mode="wait" custom={dir}>
          {currentImage ? (
            <motion.div
              key={currentImage}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 1.02 }),
                center: { opacity: 1, x: 0, scale: 1 },
                exit:   (d: number) => ({ opacity: 0, x: d * -60, scale: 0.99 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={currentImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-contain"
                priority
              />
            </motion.div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/30">
              <ImageIcon size={48} />
            </div>
          )}
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <motion.button
              onClick={prev}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-[#1a1a1a] bg-black/70 p-2 text-[#00ff88] backdrop-blur"
              aria-label="Previous image"
              data-cursor="hover"
            >
              <ChevronLeft size={18} />
            </motion.button>
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#1a1a1a] bg-black/70 p-2 text-[#00ff88] backdrop-blur"
              aria-label="Next image"
              data-cursor="hover"
            >
              <ChevronRight size={18} />
            </motion.button>
            <motion.div
              key={safeImageIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 font-display text-[10px] tracking-[0.2em] text-white/80"
            >
              {safeImageIdx + 1} / {images.length}
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
          }}
          initial="hidden"
          animate="show"
          className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8"
        >
          {images.map((src, i) => (
            <motion.button
              key={src + i}
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.9 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
              }}
              whileHover={{ y: -3, scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              onClick={() => {
                setDir(i > safeImageIdx ? 1 : -1);
                setImageIdx(i);
              }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border",
                safeImageIdx === i
                  ? "border-[#00ff88] shadow-[0_0_18px_rgba(0,255,136,0.4)]"
                  : "border-[#1a1a1a] opacity-70 hover:opacity-100"
              )}
              data-cursor="hover"
              aria-label={`Show image ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Slide description */}
      <AnimatePresence mode="wait">
        {activeTab.description && (
          <motion.div
            key={`desc-${activeTab.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mt-8 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6"
          >
            <p className="whitespace-pre-wrap text-base leading-relaxed text-white/80">
              {activeTab.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
