"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import IconPicker from "@/components/admin/IconPicker";
import DynamicIcon from "@/components/site/DynamicIcon";
import type { ProcessStep } from "@/lib/supabase/types";
import { Plus, Trash2, Pencil, X, Check, ChevronUp, ChevronDown } from "lucide-react";

export default function ProcessAdmin({ initial }: { initial: ProcessStep[] }) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [steps, setSteps] = useState<ProcessStep[]>(initial);
  const [draft, setDraft] = useState<ProcessStep | null>(null);

  function newStep() {
    setDraft({
      id: "new",
      title: "",
      description: "",
      icon: null,
      sort_order: steps.length,
      created_at: new Date().toISOString(),
    });
  }

  async function save() {
    if (!draft || !draft.title.trim()) return toast.error("Title required.");
    const payload = {
      title: draft.title,
      description: draft.description || null,
      icon: draft.icon || null,
      sort_order: draft.sort_order,
    };
    if (draft.id === "new") {
      const { data, error } = await sb.from("process_steps").insert(payload).select().single();
      if (error) return toast.error(error.message);
      setSteps([...steps, data as ProcessStep].sort((a, b) => a.sort_order - b.sort_order));
    } else {
      const { error } = await sb.from("process_steps").update(payload).eq("id", draft.id);
      if (error) return toast.error(error.message);
      setSteps(steps.map((s) => (s.id === draft.id ? draft : s)));
    }
    setDraft(null);
    toast.success("Saved.");
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("Delete this step?")) return;
    const { error } = await sb.from("process_steps").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSteps(steps.filter((s) => s.id !== id));
    toast.success("Deleted.");
    router.refresh();
  }

  async function move(s: ProcessStep, dir: -1 | 1) {
    const i = steps.findIndex((x) => x.id === s.id);
    const swap = steps[i + dir];
    if (!swap) return;
    const a = { ...s, sort_order: swap.sort_order };
    const b = { ...swap, sort_order: s.sort_order };
    setSteps(steps.map((x) => (x.id === a.id ? a : x.id === b.id ? b : x)).sort((x, y) => x.sort_order - y.sort_order));
    await Promise.all([
      sb.from("process_steps").update({ sort_order: a.sort_order }).eq("id", a.id),
      sb.from("process_steps").update({ sort_order: b.sort_order }).eq("id", b.id),
    ]);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-end">
        <Button onClick={newStep} variant="primary" size="sm"><Plus size={12} /> Add step</Button>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#1a1a1a] p-12 text-center text-white/50">
          No steps yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {steps.map((s, i) => (
            <li key={s.id} className="surface flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88]">
                {s.icon ? <DynamicIcon name={s.icon} size={16} /> : <span className="font-display text-sm font-bold">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-white">{s.title}</p>
                {s.description && <p className="line-clamp-1 text-xs text-white/60">{s.description}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="muted" size="icon" disabled={i === 0} onClick={() => move(s, -1)}><ChevronUp size={12} /></Button>
                <Button variant="muted" size="icon" disabled={i === steps.length - 1} onClick={() => move(s, 1)}><ChevronDown size={12} /></Button>
              </div>
              <div className="flex gap-1">
                <Button variant="muted" size="icon" onClick={() => setDraft(s)}><Pencil size={12} /></Button>
                <Button variant="danger" size="icon" onClick={() => del(s.id)}><Trash2 size={12} /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft && (
        <div className="surface p-5 space-y-3 border-[#00ff88]/40">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div>
              <Label>Icon</Label>
              <IconPicker value={draft.icon} onChange={(icon) => setDraft({ ...draft, icon })} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="muted" size="sm" onClick={() => setDraft(null)}><X size={12} /> Cancel</Button>
            <Button variant="primary" size="sm" onClick={save}><Check size={12} /> Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
