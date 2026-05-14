"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uploadToBucket, deleteByPublicUrl } from "@/lib/upload";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import IconPicker from "@/components/admin/IconPicker";
import type { AboutContent, CoreValue, Experience, Skill } from "@/lib/supabase/types";
import { Plus, Save, Trash2, Pencil, X, Check, Upload, Briefcase } from "lucide-react";
import { durationBetween } from "@/lib/utils";

type Props = {
  initialAbout: AboutContent | null;
  initialValues: CoreValue[];
  initialSkills: Skill[];
  initialExperiences: Experience[];
};

export default function AboutAdmin({ initialAbout, initialValues, initialSkills, initialExperiences }: Props) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [busy, setBusy] = useState(false);

  // -------- About text + master skill bars
  const [about, setAbout] = useState<AboutContent>({
    id: 1,
    intro: initialAbout?.intro ?? "",
    journey: initialAbout?.journey ?? "",
    bio: initialAbout?.bio ?? null,
    show_skill_bars: initialAbout?.show_skill_bars ?? true,
    updated_at: initialAbout?.updated_at ?? new Date().toISOString(),
  });

  // -------- Core values
  const [values, setValues] = useState<CoreValue[]>(initialValues);
  const [valueDraft, setValueDraft] = useState<CoreValue | null>(null);

  // -------- Skills
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [skillDraft, setSkillDraft] = useState<Skill | null>(null);

  // -------- Experience
  const [exps, setExps] = useState<Experience[]>(initialExperiences);
  const [expDraft, setExpDraft] = useState<Experience | null>(null);

  // ===== About save
  async function saveAbout() {
    setBusy(true);
    const { error } = await sb
      .from("about_content")
      .update({
        intro: about.intro,
        journey: about.journey,
        show_skill_bars: about.show_skill_bars,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("About saved.");
    router.refresh();
  }

  // ===== Master toggle: also flip every skill
  async function toggleMaster(next: boolean) {
    setAbout({ ...about, show_skill_bars: next });
    setSkills((arr) => arr.map((s) => ({ ...s, show_bar: next })));
    // Persist immediately
    setBusy(true);
    const { error: e1 } = await sb
      .from("about_content")
      .update({ show_skill_bars: next, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (e1) {
      toast.error(e1.message);
      setBusy(false);
      return;
    }
    if (skills.length > 0) {
      const { error: e2 } = await sb.from("skills").update({ show_bar: next }).neq("id", "");
      if (e2) toast.error(e2.message);
    }
    setBusy(false);
    toast.success(next ? "All skill bars enabled." : "All skill bars hidden.");
    router.refresh();
  }

  // ===== Core value CRUD
  function newValue() {
    setValueDraft({
      id: "new",
      title: "",
      description: "",
      icon: null,
      sort_order: values.length,
      created_at: new Date().toISOString(),
    });
  }
  async function saveValue() {
    if (!valueDraft || !valueDraft.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setBusy(true);
    if (valueDraft.id === "new") {
      const { data, error } = await sb
        .from("core_values")
        .insert({
          title: valueDraft.title,
          description: valueDraft.description || null,
          icon: valueDraft.icon || null,
          sort_order: valueDraft.sort_order,
        })
        .select()
        .single();
      setBusy(false);
      if (error) return toast.error(error.message);
      setValues([...values, data as CoreValue]);
    } else {
      const { error } = await sb
        .from("core_values")
        .update({
          title: valueDraft.title,
          description: valueDraft.description || null,
          icon: valueDraft.icon || null,
          sort_order: valueDraft.sort_order,
        })
        .eq("id", valueDraft.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      setValues(values.map((v) => (v.id === valueDraft.id ? valueDraft : v)));
    }
    setValueDraft(null);
    toast.success("Saved.");
    router.refresh();
  }
  async function deleteValue(id: string) {
    if (!confirm("Delete this value?")) return;
    const { error } = await sb.from("core_values").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setValues(values.filter((v) => v.id !== id));
    toast.success("Deleted.");
    router.refresh();
  }

  // ===== Skills CRUD
  function newSkill() {
    setSkillDraft({
      id: "new",
      name: "",
      percentage: 70,
      show_bar: about.show_skill_bars,
      sort_order: skills.length,
      category: null,
      icon_url: null,
      created_at: new Date().toISOString(),
    });
  }
  async function saveSkill() {
    if (!skillDraft || !skillDraft.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setBusy(true);
    if (skillDraft.id === "new") {
      const { data, error } = await sb
        .from("skills")
        .insert({
          name: skillDraft.name,
          percentage: skillDraft.percentage,
          show_bar: skillDraft.show_bar,
          sort_order: skillDraft.sort_order,
        })
        .select()
        .single();
      setBusy(false);
      if (error) return toast.error(error.message);
      setSkills([...skills, data as Skill]);
    } else {
      const { error } = await sb
        .from("skills")
        .update({
          name: skillDraft.name,
          percentage: skillDraft.percentage,
          show_bar: skillDraft.show_bar,
          sort_order: skillDraft.sort_order,
        })
        .eq("id", skillDraft.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      setSkills(skills.map((s) => (s.id === skillDraft.id ? skillDraft : s)));
    }
    setSkillDraft(null);
    toast.success("Saved.");
    router.refresh();
  }
  async function deleteSkill(id: string) {
    if (!confirm("Delete this skill?")) return;
    const { error } = await sb.from("skills").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSkills(skills.filter((s) => s.id !== id));
    toast.success("Deleted.");
    router.refresh();
  }

  // ===== Experience CRUD
  function newExp() {
    const today = new Date().toISOString().slice(0, 10);
    setExpDraft({
      id: "new",
      company: "",
      role: "",
      description: "",
      start_date: today,
      end_date: null,
      sort_order: exps.length,
      logo_url: null,
      created_at: new Date().toISOString(),
    });
  }
  async function uploadExpLogo(e: React.ChangeEvent<HTMLInputElement>) {
    if (!expDraft) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (expDraft.logo_url) await deleteByPublicUrl("logos", expDraft.logo_url);
      const url = await uploadToBucket("logos", file);
      setExpDraft({ ...expDraft, logo_url: url });
      toast.success("Logo uploaded.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  async function removeExpLogo() {
    if (!expDraft?.logo_url) return;
    await deleteByPublicUrl("logos", expDraft.logo_url);
    setExpDraft({ ...expDraft, logo_url: null });
  }

  async function saveExp() {
    if (!expDraft || !expDraft.company.trim() || !expDraft.role.trim()) {
      toast.error("Company and role are required.");
      return;
    }
    setBusy(true);
    const payload = {
      company: expDraft.company,
      role: expDraft.role,
      description: expDraft.description || null,
      start_date: expDraft.start_date,
      end_date: expDraft.end_date || null,
      sort_order: expDraft.sort_order,
      logo_url: expDraft.logo_url,
    };
    if (expDraft.id === "new") {
      const { data, error } = await sb.from("experiences").insert(payload).select().single();
      setBusy(false);
      if (error) return toast.error(error.message);
      setExps([data as Experience, ...exps]);
    } else {
      const { error } = await sb.from("experiences").update(payload).eq("id", expDraft.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      setExps(exps.map((e) => (e.id === expDraft.id ? expDraft : e)));
    }
    setExpDraft(null);
    toast.success("Saved.");
    router.refresh();
  }
  async function deleteExp(exp: Experience) {
    if (!confirm("Delete this experience?")) return;
    const { error } = await sb.from("experiences").delete().eq("id", exp.id);
    if (error) return toast.error(error.message);
    if (exp.logo_url) await deleteByPublicUrl("logos", exp.logo_url);
    setExps(exps.filter((e) => e.id !== exp.id));
    toast.success("Deleted.");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Intro/Journey */}
      <section className="surface p-6 space-y-4">
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">Intro & journey</h2>
        <div>
          <Label>Intro</Label>
          <Textarea rows={3} value={about.intro} onChange={(e) => setAbout({ ...about, intro: e.target.value })} />
        </div>
        <div>
          <Label>Journey / story</Label>
          <Textarea rows={5} value={about.journey} onChange={(e) => setAbout({ ...about, journey: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <Button onClick={saveAbout} disabled={busy} variant="primary" size="md">
            <Save size={14} /> Save text
          </Button>
        </div>
      </section>

      {/* Core values */}
      <section className="surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">Core values</h2>
          <Button onClick={newValue} variant="outline" size="sm">
            <Plus size={12} /> Add value
          </Button>
        </div>

        <ul className="mt-5 space-y-3">
          {values.length === 0 && (
            <li className="rounded-md border border-dashed border-[#1a1a1a] p-6 text-center text-xs text-white/50">
              No values yet.
            </li>
          )}
          {values.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 rounded-md border border-[#1a1a1a] bg-[#0f0f0f] p-3">
              <div>
                <p className="font-display text-sm text-white">{v.title}</p>
                {v.description && <p className="text-xs text-white/60">{v.description}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="muted" size="icon" onClick={() => setValueDraft(v)}><Pencil size={12} /></Button>
                <Button variant="danger" size="icon" onClick={() => deleteValue(v.id)}><Trash2 size={12} /></Button>
              </div>
            </li>
          ))}
        </ul>

        {valueDraft && (
          <div className="mt-4 rounded-md border border-[#00ff88]/40 bg-[#0a0a0a] p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input value={valueDraft.title} onChange={(e) => setValueDraft({ ...valueDraft, title: e.target.value })} />
              </div>
              <div>
                <Label>Icon (optional)</Label>
                <IconPicker value={valueDraft.icon} onChange={(icon) => setValueDraft({ ...valueDraft, icon })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={valueDraft.description ?? ""} onChange={(e) => setValueDraft({ ...valueDraft, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="muted" size="sm" onClick={() => setValueDraft(null)}><X size={12} /> Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveValue} disabled={busy}><Check size={12} /> Save</Button>
            </div>
          </div>
        )}
      </section>

      {/* Skills */}
      <section className="surface p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">Skills</h2>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2">
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-white/70">
                Show all percentage bars
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#00ff88]"
                checked={about.show_skill_bars}
                onChange={(e) => toggleMaster(e.target.checked)}
              />
            </label>
            <Button onClick={newSkill} variant="outline" size="sm">
              <Plus size={12} /> Add skill
            </Button>
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {skills.length === 0 && (
            <li className="rounded-md border border-dashed border-[#1a1a1a] p-6 text-center text-xs text-white/50">
              No skills yet.
            </li>
          )}
          {skills.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-md border border-[#1a1a1a] bg-[#0f0f0f] p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-sm text-white">{s.name}</p>
                  <span className="font-display text-xs text-[#00ff88]">{s.percentage}%</span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                  <div className="h-full bg-[#00ff88]" style={{ width: `${s.percentage}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-white/40">
                  Bar visible: {s.show_bar ? "yes" : "no"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="muted" size="icon" onClick={() => setSkillDraft(s)}><Pencil size={12} /></Button>
                <Button variant="danger" size="icon" onClick={() => deleteSkill(s.id)}><Trash2 size={12} /></Button>
              </div>
            </li>
          ))}
        </ul>

        {skillDraft && (
          <div className="mt-4 rounded-md border border-[#00ff88]/40 bg-[#0a0a0a] p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={skillDraft.name} onChange={(e) => setSkillDraft({ ...skillDraft, name: e.target.value })} />
              </div>
              <div>
                <Label>Percentage ({skillDraft.percentage}%)</Label>
                <input
                  type="range" min={0} max={100}
                  value={skillDraft.percentage}
                  onChange={(e) => setSkillDraft({ ...skillDraft, percentage: Number(e.target.value) })}
                  className="w-full accent-[#00ff88]"
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#00ff88]"
                checked={skillDraft.show_bar}
                onChange={(e) => setSkillDraft({ ...skillDraft, show_bar: e.target.checked })}
              />
              <span className="text-xs text-white/80">Show percentage bar for this skill</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="muted" size="sm" onClick={() => setSkillDraft(null)}><X size={12} /> Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveSkill} disabled={busy}><Check size={12} /> Save</Button>
            </div>
          </div>
        )}
      </section>

      {/* Experience */}
      <section className="surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">Experience</h2>
          <Button onClick={newExp} variant="outline" size="sm">
            <Plus size={12} /> Add experience
          </Button>
        </div>

        <ul className="mt-5 space-y-3">
          {exps.length === 0 && (
            <li className="rounded-md border border-dashed border-[#1a1a1a] p-6 text-center text-xs text-white/50">
              No experiences yet.
            </li>
          )}
          {exps.map((e) => (
            <li key={e.id} className="flex flex-col gap-3 rounded-md border border-[#1a1a1a] bg-[#0f0f0f] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#1a1a1a] bg-[#0a0a0a] text-white/30">
                  {e.logo_url ? (
                    <Image src={e.logo_url} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <Briefcase size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm text-white">{e.role}</p>
                  <p className="font-display text-xs text-[#00ff88]">{e.company}</p>
                  <p className="text-[10px] text-white/50">
                    {e.start_date} → {e.end_date ?? "Present"} · {durationBetween(e.start_date, e.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="muted" size="icon" onClick={() => setExpDraft(e)}><Pencil size={12} /></Button>
                <Button variant="danger" size="icon" onClick={() => deleteExp(e)}><Trash2 size={12} /></Button>
              </div>
            </li>
          ))}
        </ul>

        {expDraft && (
          <div className="mt-4 rounded-md border border-[#00ff88]/40 bg-[#0a0a0a] p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Company</Label>
                <Input value={expDraft.company} onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <Input value={expDraft.role} onChange={(e) => setExpDraft({ ...expDraft, role: e.target.value })} />
              </div>
              <div>
                <Label>Start date</Label>
                <Input type="date" value={expDraft.start_date} onChange={(e) => setExpDraft({ ...expDraft, start_date: e.target.value })} />
              </div>
              <div>
                <Label>End date (leave blank for &quot;Present&quot;)</Label>
                <Input
                  type="date"
                  value={expDraft.end_date ?? ""}
                  onChange={(e) => setExpDraft({ ...expDraft, end_date: e.target.value || null })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={expDraft.description ?? ""} onChange={(e) => setExpDraft({ ...expDraft, description: e.target.value })} />
            </div>

            <div>
              <Label>Company logo</Label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#1a1a1a] bg-[#0a0a0a] text-white/30">
                  {expDraft.logo_url ? (
                    <Image src={expDraft.logo_url} alt="Logo preview" fill sizes="64px" className="object-cover" />
                  ) : (
                    <Briefcase size={20} />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={uploadExpLogo} />
                  <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#00ff88] bg-[#00ff88] px-3 font-display text-[10px] uppercase tracking-[0.2em] text-black hover:bg-transparent hover:text-[#00ff88]">
                    <Upload size={12} /> {expDraft.logo_url ? "Replace" : "Upload"}
                  </span>
                </label>
                {expDraft.logo_url && (
                  <Button variant="danger" size="sm" onClick={removeExpLogo}>
                    <Trash2 size={12} /> Remove
                  </Button>
                )}
              </div>
              <p className="mt-1 text-[10px] text-white/40">
                Square images (e.g. 256×256) look best. Uploading replaces the previous file automatically.
              </p>
            </div>

            <p className="text-[10px] text-white/40">
              Duration auto-calculated: <span className="text-[#00ff88]">{durationBetween(expDraft.start_date, expDraft.end_date)}</span>
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="muted" size="sm" onClick={() => setExpDraft(null)}><X size={12} /> Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveExp} disabled={busy}><Check size={12} /> Save</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
