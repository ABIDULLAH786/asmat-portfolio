import { getContactInfo, getSocialLinks } from "@/lib/queries";
import Reveal from "@/components/site/Reveal";
import DynamicIcon from "@/components/site/DynamicIcon";
import ContactForm from "./ContactForm";
import { Mail, MapPin, Phone, Sparkles } from "lucide-react";

export const revalidate = 60;

export default async function ContactPage() {
  const [info, contactSocials, followSocials] = await Promise.all([
    getContactInfo().catch(() => null),
    getSocialLinks("contact").catch(() => []),
    getSocialLinks("follow_work").catch(() => []),
  ]);

  return (
    <div className="relative">
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" aria-hidden />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24 grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Contact</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Let&apos;s build something together.
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Have a project in mind? Drop me a message — I usually respond within a day.
            </p>
          </Reveal>

          <div className="mt-10 space-y-3">
            {info?.email && (
              <ContactRow icon={<Mail size={16} />} label="Email" value={info.email} href={`mailto:${info.email}`} />
            )}
            {info?.phone && (
              <ContactRow icon={<Phone size={16} />} label="Phone" value={info.phone} href={`tel:${info.phone.replace(/\s+/g, "")}`} />
            )}
            {info?.location && (
              <ContactRow icon={<MapPin size={16} />} label="Location" value={info.location} />
            )}
            {contactSocials.map((s) => (
              <ContactRow
                key={s.id}
                icon={<DynamicIcon name={s.icon} size={16} />}
                label={s.label}
                value={s.url.replace(/^https?:\/\//, "")}
                href={s.url}
                external
              />
            ))}
          </div>

          {followSocials.length > 0 && (
            <div className="mt-10">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-white/60">Follow My Work</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {followSocials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0a0a0a] text-white/80 transition-all hover:border-[#00ff88] hover:bg-[#00ff88] hover:text-black hover:shadow-[0_0_22px_rgba(0,255,136,0.55)]"
                  >
                    <DynamicIcon name={s.icon} size={18} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {info?.blurb && (
            <div className="mt-10 surface p-5 inline-flex items-center gap-3">
              <Sparkles size={16} className="text-[#00ff88]" />
              <p className="text-sm text-white/80">{info.blurb}</p>
            </div>
          )}
        </div>

        <Reveal delay={0.05}>
          <div className="surface p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-white">Send a message</h2>
            <p className="mt-1 text-sm text-white/60">All fields are required.</p>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <div className="surface flex items-center gap-4 p-4 transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00ff88]/10 text-[#00ff88]">
        {icon}
      </div>
      <div>
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/50">{label}</p>
        <p className="font-display text-sm text-white">{value}</p>
      </div>
    </div>
  );
  if (!href) return inner;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="block"
    >
      {inner}
    </a>
  );
}
