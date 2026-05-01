import Link from "next/link";
import { getSiteSettings } from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import Reveal from "@/components/site/Reveal";
import HeroOrbit from "@/components/site/HeroOrbit";
import { ArrowRight, Download, Sparkles } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  let settings = null;
  try {
    settings = await getSiteSettings();
  } catch {}

  const name = settings?.hero_name ?? "Asmat Muntazir";
  const tagline = settings?.hero_tagline ?? "Graphic Designer crafting modern, tech-inspired visuals.";
  const intro =
    settings?.hero_intro ??
    "I design clean visual identities, illustrations and packaging that turn ideas into brands.";
  const profile = settings?.profile_image;
  const resume = settings?.resume_url;
  const [first, ...rest] = name.split(" ");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" aria-hidden />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-28">
        <div className="relative z-10 order-2 md:order-1">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#00ff88]/40 bg-[#00ff88]/5 px-3 py-1 font-display text-[10px] uppercase tracking-[0.3em] text-[#00ff88]">
              <Sparkles size={12} /> Available for work
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Hi, I&apos;m{" "}
              <span className="text-glow text-[#00ff88]">{first}</span>
              {rest.length > 0 && (
                <>
                  <br />
                  {rest.join(" ")}
                </>
              )}
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 font-display text-sm uppercase tracking-[0.25em] text-white/60">
              {tagline}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75">{intro}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <Link href="/portfolio">
                  View Portfolio <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Me</Link>
              </Button>
              {resume && (
                <Button asChild variant="outline" size="lg">
                  <a href={resume} download target="_blank" rel="noopener noreferrer">
                    <Download size={16} /> Download Resume
                  </a>
                </Button>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="order-1 md:order-2">
          <HeroOrbit profileSrc={profile ?? null} />
        </Reveal>
      </div>
    </section>
  );
}
