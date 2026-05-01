import Link from "next/link";
import { getSocialLinks } from "@/lib/queries";
import DynamicIcon from "./DynamicIcon";

export default async function Footer() {
  let links: Awaited<ReturnType<typeof getSocialLinks>> = [];
  try {
    links = await getSocialLinks("footer");
  } catch {
    // db not ready yet
  }

  return (
    <footer className="relative mt-24 border-t border-[#1a1a1a] bg-[#050505]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-base font-semibold uppercase tracking-[0.2em] text-[#00ff88]">
            Asmat Muntazir
          </p>
          <p className="mt-2 max-w-xs text-sm text-white/60">
            Graphic designer building modern, tech-inspired identities, illustrations & packaging.
          </p>
        </div>

        <div className="md:text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-white/50">Explore</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 md:justify-center">
            {[
              ["Home", "/"],
              ["About", "/about"],
              ["Portfolio", "/portfolio"],
              ["Process", "/process"],
              ["Notes", "/notes"],
              ["Contact", "/contact"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="text-sm text-white/70 hover:text-[#00ff88] transition-colors">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:text-right">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-white/50">Follow</p>
          <ul className="mt-3 flex flex-wrap gap-3 md:justify-end">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1a1a1a] bg-black text-white/80 transition-all hover:border-[#00ff88] hover:text-[#00ff88] hover:shadow-[0_0_18px_rgba(0,255,136,0.35)]"
                >
                  <DynamicIcon name={l.icon} size={16} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[#111]">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/40 md:px-8">
          © {new Date().getFullYear()} Asmat Muntazir — All rights reserved.
        </p>
      </div>
    </footer>
  );
}
