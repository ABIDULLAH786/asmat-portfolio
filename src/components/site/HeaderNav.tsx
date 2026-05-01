"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",          label: "Home" },
  { href: "/about",     label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/process",   label: "Process" },
  { href: "/notes",     label: "Notes" },
  { href: "/contact",   label: "Contact" },
];

export default function HeaderNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "relative px-4 py-2 font-display text-xs uppercase tracking-[0.2em] transition-colors",
              isActive(n.href) ? "text-[#00ff88]" : "text-white/70 hover:text-white"
            )}
          >
            {n.label}
            {isActive(n.href) && (
              <motion.span
                layoutId="nav-underline"
                className="absolute inset-x-3 -bottom-0.5 h-px bg-[#00ff88]"
              />
            )}
          </Link>
        ))}
      </nav>

      <button
        className="md:hidden text-white p-2"
        onClick={() => setOpen((s) => !s)}
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full border-b border-[#1a1a1a] bg-black md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "border-b border-[#111] px-2 py-3 font-display text-sm uppercase tracking-[0.2em] transition-colors",
                    isActive(n.href) ? "text-[#00ff88]" : "text-white/70"
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
