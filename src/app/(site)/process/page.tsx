import { getProcessSteps } from "@/lib/queries";
import Reveal from "@/components/site/Reveal";
import DynamicIcon from "@/components/site/DynamicIcon";

export const revalidate = 60;

export default async function ProcessPage() {
  const steps = await getProcessSteps().catch(() => []);

  return (
    <div className="relative">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" aria-hidden />
      <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8 md:py-24">
        <Reveal>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Process</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            How I work.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Every project follows a deliberate path — from research to refined final output.
          </p>
        </Reveal>

        <div className="mt-16 relative">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-[#00ff88] via-[#00ff88]/30 to-transparent md:block" />
          <div className="space-y-6">
            {steps.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#1a1a1a] p-12 text-center text-white/50">
                Process steps will appear here once you add them in the admin.
              </div>
            ) : (
              steps.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.07}>
                  <article className="surface relative flex gap-5 p-6 md:ml-16">
                    <div className="absolute -left-16 top-6 hidden h-12 w-12 items-center justify-center rounded-full border border-[#00ff88] bg-black md:flex">
                      <span className="font-display text-sm font-bold text-[#00ff88]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#00ff88]/10 text-[#00ff88] md:hidden">
                      {s.icon ? <DynamicIcon name={s.icon} size={20} /> : <span className="font-display font-bold">{i + 1}</span>}
                    </div>
                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#00ff88]/10 text-[#00ff88] md:flex">
                      {s.icon ? <DynamicIcon name={s.icon} size={20} /> : null}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-white">{s.title}</h3>
                      {s.description && (
                        <p className="mt-2 text-sm leading-relaxed text-white/70">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
