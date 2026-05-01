import Link from "next/link";
import Image from "next/image";
import HeaderNav from "./HeaderNav";
import { getSiteSettings } from "@/lib/queries";

export default async function Header() {
  let settings = null;
  try {
    settings = await getSiteSettings();
  } catch {
    // Supabase not configured yet — render header without logo.
  }

  const size = settings?.logo_size ?? 60;
  const padding = size === 60 ? 0 : size === 80 ? 6 : 10;
  const logoUrl = settings?.logo_url;

  const heroName = settings?.hero_name ?? "Asmat Muntazir";
  const [firstLine, ...restParts] = heroName.trim().split(/\s+/);
  const secondLine = restParts.join(" ");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1a1a1a] bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Home">
          <span
            className="relative inline-flex items-center justify-center rounded-full border border-[#00ff88]/40 bg-black overflow-hidden"
            style={{ width: size, height: size, padding }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                width={size}
                height={size}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="font-display text-base font-bold text-[#00ff88]">AM</span>
            )}
          </span>
          <span
            className="hidden flex-col justify-center font-display text-xl font-semibold uppercase leading-[1.05] tracking-[0.2em] text-white sm:flex"
            style={{ maxHeight: size }}
          >
            <span>{firstLine}</span>
            {secondLine && <span>{secondLine}</span>}
          </span>
        </Link>

        <HeaderNav />
      </div>
    </header>
  );
}
