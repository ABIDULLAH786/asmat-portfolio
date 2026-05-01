"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { POPULAR_ICONS, allLibs, iconLibFor } from "@/lib/icons";
import DynamicIcon from "@/components/site/DynamicIcon";
import { Input } from "@/components/ui/Input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value?: string | null;
  onChange: (icon: string) => void;
  placeholder?: string;
};

/**
 * Dropdown that lets the user search across all react-icons libraries.
 * Uses lazy library loading + a per-keystroke search across the prefix
 * matching the query (or all if no prefix). For performance, when no
 * query is typed we show only the curated POPULAR_ICONS list.
 */
export default function IconPicker({ value, onChange, placeholder = "Search icons (e.g. twitter, youtube, github)…" }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Search effect (debounced) — only runs when there is a query term.
  useEffect(() => {
    if (!open) return;
    const term = q.trim().toLowerCase();
    if (!term) return;
    const handle = setTimeout(async () => {
      setSearching(true);
      const libs = allLibs();
      const all: string[] = [];
      // Load every lib in parallel — these are bundle-split chunks on
      // demand, but for search we accept the cost on first use.
      const mods = await Promise.all(libs.map((l) => l.loader().catch(() => null)));
      mods.forEach((mod, idx) => {
        if (!mod) return;
        const prefix = libs[idx].prefix;
        for (const name of Object.keys(mod as Record<string, unknown>)) {
          if (!name.startsWith(prefix)) continue;
          if (name.toLowerCase().includes(term)) all.push(name);
          if (all.length >= 240) break;
        }
      });
      setResults(all.slice(0, 240));
      setSearching(false);
    }, 220);
    return () => clearTimeout(handle);
  }, [q, open]);

  const displayed = q.trim() ? results : POPULAR_ICONS;
  const currentLib = useMemo(() => (value ? iconLibFor(value) : undefined), [value]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-md border bg-[#0a0a0a] px-3 py-2 text-left text-sm transition-colors",
          open ? "border-[#00ff88]" : "border-[#1a1a1a] hover:border-[#00ff88]/50"
        )}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0f0f0f] text-[#00ff88]">
            {value ? <DynamicIcon name={value} size={16} /> : <Search size={14} />}
          </span>
          <span className="truncate text-white/85">
            {value ? value : placeholder}
          </span>
          {currentLib && (
            <span className="hidden sm:inline shrink-0 rounded-full bg-[#00ff88]/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em] text-[#00ff88]">
              {currentLib.label}
            </span>
          )}
        </span>
        {value && (
          <span
            role="button"
            aria-label="Clear icon"
            className="text-white/40 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            <X size={14} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-md border border-[#1a1a1a] bg-[#0a0a0a] shadow-2xl">
          <div className="p-3">
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
            />
          </div>
          <div className="max-h-72 overflow-y-auto px-3 pb-3">
            {searching && (
              <div className="py-6 text-center text-xs text-white/50">Searching…</div>
            )}
            {!searching && displayed.length === 0 && (
              <div className="py-6 text-center text-xs text-white/50">No icons found.</div>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {displayed.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md border border-[#1a1a1a] bg-[#0f0f0f] px-2 py-2 text-left text-xs text-white/80 transition-colors hover:border-[#00ff88]/60 hover:text-white"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#00ff88]">
                    <DynamicIcon name={name} size={14} />
                  </span>
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
