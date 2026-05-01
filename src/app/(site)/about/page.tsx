import {
  getAboutContent,
  getCoreValues,
  getExperiences,
  getSkills,
} from "@/lib/queries";
import Image from "next/image";
import Reveal from "@/components/site/Reveal";
import DynamicIcon from "@/components/site/DynamicIcon";
import { durationBetween, formatDate } from "@/lib/utils";
import { Briefcase } from "lucide-react";

export const revalidate = 60;

export default async function AboutPage() {
  const [about, values, skills, experiences] = await Promise.all([
    getAboutContent().catch(() => null),
    getCoreValues().catch(() => []),
    getSkills().catch(() => []),
    getExperiences().catch(() => []),
  ]);

  const showBars = about?.show_skill_bars ?? true;

  return (
    <div className="relative">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" aria-hidden />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24 space-y-24">
        {/* Intro */}
        <section>
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">About</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              The story behind the pixels.
            </h1>
          </Reveal>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <Reveal delay={0.05}>
              <p className="text-base leading-relaxed text-white/80">
                {about?.intro ?? "I'm a graphic designer with 1+ year of experience."}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-base leading-relaxed text-white/70">
                {about?.journey ?? ""}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Core Values */}
        {values.length > 0 && (
          <section>
            <Reveal>
              <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Core Values</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
                What I stand for.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <Reveal key={v.id} delay={i * 0.05}>
                  <div className="surface group h-full p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00ff88]/10 text-[#00ff88] group-hover:bg-[#00ff88] group-hover:text-black transition-colors">
                      {v.icon ? <DynamicIcon name={v.icon} size={18} /> : <span className="font-display font-bold">{i + 1}</span>}
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-white">{v.title}</h3>
                    {v.description && (
                      <p className="mt-2 text-sm text-white/70 leading-relaxed">{v.description}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <Reveal>
              <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Skills</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
                Tools & techniques.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {skills.map((s, i) => {
                const showThis = showBars && s.show_bar;
                return (
                  <Reveal key={s.id} delay={i * 0.04}>
                    <div className="surface p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {s.icon_url && (
                            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0f0f0f] p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={s.icon_url} alt="" className="h-full w-full object-contain" />
                            </span>
                          )}
                          <p className="font-display text-sm font-semibold text-white truncate">{s.name}</p>
                        </div>
                        {showThis && (
                          <span className="font-display text-xs text-[#00ff88]">{s.percentage}%</span>
                        )}
                      </div>
                      {showThis && (
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#111]">
                          <div
                            className="h-full rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]"
                            style={{ width: `${s.percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section>
            <Reveal>
              <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Experience</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
                Where I&apos;ve worked.
              </h2>
            </Reveal>
            <div className="mt-10 space-y-4">
              {experiences.map((exp, i) => (
                <Reveal key={exp.id} delay={i * 0.04}>
                  <article className="surface flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88]">
                        {exp.logo_url ? (
                          <Image
                            src={exp.logo_url}
                            alt={exp.company}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Briefcase size={18} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">{exp.role}</h3>
                        <p className="font-display text-sm uppercase tracking-[0.15em] text-[#00ff88]">
                          {exp.company}
                        </p>
                        {exp.description && (
                          <p className="mt-2 max-w-2xl text-sm text-white/70 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-display text-xs uppercase tracking-[0.2em] text-white/60">
                        {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                      </p>
                      <p className="mt-1 font-display text-sm font-semibold text-[#00ff88]">
                        {durationBetween(exp.start_date, exp.end_date)}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
