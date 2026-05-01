"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uploadToBucket, deleteByPublicUrl } from "@/lib/upload";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import type { SiteSettings, LogoSize } from "@/lib/supabase/types";
import { Save, Trash2, Upload } from "lucide-react";

const LOGO_SIZES: { value: LogoSize; label: string; recommended?: boolean }[] = [
  { value: 60, label: "60 × 60", recommended: true },
  { value: 80, label: "80 × 80" },
  { value: 100, label: "100 × 100" },
];

export default function SiteSettingsForm({ initial }: { initial: SiteSettings | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<SiteSettings>({
    id: 1,
    logo_url: initial?.logo_url ?? null,
    logo_size: (initial?.logo_size ?? 60) as LogoSize,
    resume_url: initial?.resume_url ?? null,
    resume_label: initial?.resume_label ?? "Download Resume",
    profile_image: initial?.profile_image ?? null,
    hero_name: initial?.hero_name ?? "Asmat Muntazir",
    hero_tagline: initial?.hero_tagline ?? "",
    hero_intro: initial?.hero_intro ?? "",
    updated_at: initial?.updated_at ?? new Date().toISOString(),
  });

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      // Replace policy: remove old before adding new
      if (data.logo_url) await deleteByPublicUrl("logos", data.logo_url);
      const url = await uploadToBucket("logos", file);
      setData({ ...data, logo_url: url });
      toast.success("Logo uploaded.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function removeLogo() {
    if (!data.logo_url) return;
    setBusy(true);
    await deleteByPublicUrl("logos", data.logo_url);
    setData({ ...data, logo_url: null });
    setBusy(false);
    toast.success("Logo removed.");
  }

  async function handleProfileFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (data.profile_image) await deleteByPublicUrl("profiles", data.profile_image);
      const url = await uploadToBucket("profiles", file);
      setData({ ...data, profile_image: url });
      toast.success("Profile image uploaded.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function handleResumeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      // Single-resume policy: replace existing
      if (data.resume_url) await deleteByPublicUrl("resumes", data.resume_url);
      const url = await uploadToBucket("resumes", file);
      setData({ ...data, resume_url: url });
      toast.success("Resume uploaded.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function removeResume() {
    if (!data.resume_url) return;
    setBusy(true);
    await deleteByPublicUrl("resumes", data.resume_url);
    setData({ ...data, resume_url: null });
    setBusy(false);
    toast.success("Resume removed.");
  }

  async function save() {
    setBusy(true);
    const sb = supabaseBrowser();
    const { error } = await sb
      .from("site_settings")
      .update({
        logo_url: data.logo_url,
        logo_size: data.logo_size,
        resume_url: data.resume_url,
        resume_label: data.resume_label,
        profile_image: data.profile_image,
        hero_name: data.hero_name,
        hero_tagline: data.hero_tagline,
        hero_intro: data.hero_intro,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved.");
    router.refresh();
  }

  const logoSize = data.logo_size;
  const padding = logoSize === 60 ? 0 : logoSize === 80 ? 6 : 10;

  return (
    <div className="mt-8 space-y-8">
      {/* Hero text */}
      <Section title="Hero">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name">
            <Input
              value={data.hero_name}
              onChange={(e) => setData({ ...data, hero_name: e.target.value })}
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={data.hero_tagline}
              onChange={(e) => setData({ ...data, hero_tagline: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Intro paragraph">
          <Textarea
            rows={3}
            value={data.hero_intro}
            onChange={(e) => setData({ ...data, hero_intro: e.target.value })}
          />
        </Field>
      </Section>

      {/* Logo */}
      <Section title="Logo">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div
            className="relative inline-flex items-center justify-center rounded-full border border-[#00ff88]/40 bg-black overflow-hidden"
            style={{ width: logoSize, height: logoSize, padding }}
          >
            {data.logo_url ? (
              <Image
                src={data.logo_url}
                alt="Logo preview"
                width={logoSize}
                height={logoSize}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="font-display text-base font-bold text-[#00ff88]">AM</span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <Label>Display size</Label>
              <div className="flex gap-2">
                {LOGO_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setData({ ...data, logo_size: s.value })}
                    className={`rounded-md border px-3 py-2 font-display text-[10px] uppercase tracking-[0.2em] transition-all ${
                      data.logo_size === s.value
                        ? "border-[#00ff88] bg-[#00ff88] text-black"
                        : "border-[#1a1a1a] text-white/70 hover:border-[#00ff88]/50"
                    }`}
                  >
                    {s.label}{s.recommended ? " (recommended)" : ""}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/50">
                60 × 60 looks crispest for the header. Larger sizes get extra padding so the image doesn&apos;t touch the edges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFile}
                />
                <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#00ff88] bg-[#00ff88] px-3 font-display text-[10px] uppercase tracking-[0.2em] text-black hover:bg-transparent hover:text-[#00ff88]">
                  <Upload size={12} /> Upload new logo
                </span>
              </label>
              {data.logo_url && (
                <Button onClick={removeLogo} variant="danger" size="sm">
                  <Trash2 size={12} /> Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-white/40">
              Uploading a new logo automatically replaces the existing one.
            </p>
          </div>
        </div>
      </Section>

      {/* Profile image */}
      <Section title="Profile image (Home hero)">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border border-[#1a1a1a] bg-[#0a0a0a]">
            {data.profile_image ? (
              <Image src={data.profile_image} alt="Profile preview" fill sizes="112px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-[#00ff88]">AM</div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleProfileFile} />
              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#00ff88] bg-[#00ff88] px-3 font-display text-[10px] uppercase tracking-[0.2em] text-black hover:bg-transparent hover:text-[#00ff88]">
                <Upload size={12} /> Upload profile image
              </span>
            </label>
            {data.profile_image && (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  if (!data.profile_image) return;
                  await deleteByPublicUrl("profiles", data.profile_image);
                  setData({ ...data, profile_image: null });
                }}
              >
                <Trash2 size={12} /> Remove
              </Button>
            )}
          </div>
        </div>
      </Section>

      {/* Resume */}
      <Section title="Resume / CV">
        <p className="text-xs text-white/60">
          Upload a file (PDF/DOC) or paste an external URL. Only one resume can exist at a time.
        </p>

        {data.resume_url ? (
          <div className="rounded-md border border-[#00ff88]/40 bg-[#00ff88]/5 p-4">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-[#00ff88]">Currently linked</p>
            <a
              href={data.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block break-all text-sm text-white underline-offset-2 hover:underline"
            >
              {data.resume_url}
            </a>
            <Button onClick={removeResume} variant="danger" size="sm" className="mt-3">
              <Trash2 size={12} /> Remove resume
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="surface flex cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center hover:border-[#00ff88]">
              <Upload size={20} className="text-[#00ff88]" />
              <p className="font-display text-xs uppercase tracking-[0.2em] text-white">Upload file</p>
              <p className="text-xs text-white/50">PDF, DOC, DOCX</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleResumeFile}
              />
            </label>
            <Field label="Or paste a URL">
              <Input
                placeholder="https://drive.google.com/…"
                onBlur={(e) => {
                  const v = e.currentTarget.value.trim();
                  if (!v) return;
                  setData({ ...data, resume_url: v });
                  toast.success("Resume URL set. Don't forget to save.");
                }}
              />
              <p className="mt-1 text-[10px] text-white/40">Press Tab to set the URL.</p>
            </Field>
          </div>
        )}
        <Field label="Button label">
          <Input
            value={data.resume_label ?? ""}
            onChange={(e) => setData({ ...data, resume_label: e.target.value })}
          />
        </Field>
      </Section>

      <div className="flex justify-end gap-2 sticky bottom-0 z-10 -mx-4 md:-mx-8 border-t border-[#1a1a1a] bg-[#070707] p-4 md:px-8">
        <Button onClick={save} disabled={busy} variant="primary" size="lg">
          <Save size={14} /> {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface p-6">
      <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
