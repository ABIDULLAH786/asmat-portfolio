"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import IconPicker from "@/components/admin/IconPicker";
import DynamicIcon from "@/components/site/DynamicIcon";
import type { ContactInfo, SocialLink, SocialZone } from "@/lib/supabase/types";
import { Plus, Save, Trash2, Pencil, X, Check } from "lucide-react";

const ZONES: { key: SocialZone; title: string; description: string }[] = [
  { key: "contact",     title: "Contact page",   description: "Extra contact links shown on the Contact page (e.g. X, Threads, custom URLs)." },
  { key: "follow_work", title: "Follow My Work", description: "Larger icon block on the Contact page for social presence." },
  { key: "footer",      title: "Footer",         description: "Tiny social icons in the site footer." },
];

export default function ContactAdmin({
  initialInfo,
  initialLinks,
}: {
  initialInfo: ContactInfo | null;
  initialLinks: SocialLink[];
}) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [info, setInfo] = useState<ContactInfo>({
    id: 1,
    email: initialInfo?.email ?? "",
    phone: initialInfo?.phone ?? "",
    location: initialInfo?.location ?? "",
    blurb: initialInfo?.blurb ?? "",
    updated_at: initialInfo?.updated_at ?? new Date().toISOString(),
  });
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [draft, setDraft] = useState<SocialLink | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveInfo() {
    setBusy(true);
    const { error } = await sb
      .from("contact_info")
      .update({
        email: info.email,
        phone: info.phone || null,
        location: info.location,
        blurb: info.blurb,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Contact info saved.");
    router.refresh();
  }

  function addLink(zone: SocialZone) {
    setDraft({
      id: "new",
      zone,
      label: "",
      url: "",
      icon: "FaLink",
      sort_order: links.filter((l) => l.zone === zone).length,
      created_at: new Date().toISOString(),
    });
  }

  async function saveLink() {
    if (!draft) return;
    if (!draft.label.trim() || !draft.url.trim() || !draft.icon) {
      toast.error("Label, URL and icon are required.");
      return;
    }
    setBusy(true);
    if (draft.id === "new") {
      const { data, error } = await sb
        .from("social_links")
        .insert({
          zone: draft.zone,
          label: draft.label,
          url: draft.url,
          icon: draft.icon,
          sort_order: draft.sort_order,
        })
        .select()
        .single();
      setBusy(false);
      if (error) return toast.error(error.message);
      setLinks([...links, data as SocialLink]);
    } else {
      const { error } = await sb
        .from("social_links")
        .update({
          label: draft.label,
          url: draft.url,
          icon: draft.icon,
          sort_order: draft.sort_order,
        })
        .eq("id", draft.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      setLinks(links.map((l) => (l.id === draft.id ? draft : l)));
    }
    setDraft(null);
    toast.success("Saved.");
    router.refresh();
  }

  async function delLink(id: string) {
    if (!confirm("Delete this link?")) return;
    const { error } = await sb.from("social_links").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setLinks(links.filter((l) => l.id !== id));
    toast.success("Deleted.");
    router.refresh();
  }

  const byZone = useMemo(() => {
    const m: Record<SocialZone, SocialLink[]> = { contact: [], follow_work: [], footer: [] };
    links.forEach((l) => m[l.zone].push(l));
    return m;
  }, [links]);

  return (
    <div className="mt-8 space-y-8">
      <section className="surface p-6 space-y-4">
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">Contact info</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
          </div>
          <div>
            <Label>Phone (optional)</Label>
            <Input value={info.phone ?? ""} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={info.location} onChange={(e) => setInfo({ ...info, location: e.target.value })} />
          </div>
          <div>
            <Label>&quot;Available for…&quot; blurb</Label>
            <Input value={info.blurb} onChange={(e) => setInfo({ ...info, blurb: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={saveInfo} disabled={busy}>
            <Save size={14} /> Save
          </Button>
        </div>
      </section>

      {ZONES.map((z) => (
        <section key={z.key} className="surface p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">{z.title}</h2>
              <p className="mt-1 text-xs text-white/50">{z.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => addLink(z.key)}>
              <Plus size={12} /> Add link
            </Button>
          </div>

          <ul className="mt-5 space-y-2">
            {byZone[z.key].length === 0 && (
              <li className="rounded-md border border-dashed border-[#1a1a1a] p-6 text-center text-xs text-white/50">
                No links yet.
              </li>
            )}
            {byZone[z.key].map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-md border border-[#1a1a1a] bg-[#0f0f0f] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0a0a0a] text-[#00ff88]">
                  <DynamicIcon name={l.icon} size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm text-white">{l.label}</p>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="line-clamp-1 text-xs text-white/50 hover:text-[#00ff88]">{l.url}</a>
                </div>
                <Button variant="muted" size="icon" onClick={() => setDraft(l)}><Pencil size={12} /></Button>
                <Button variant="danger" size="icon" onClick={() => delLink(l.id)}><Trash2 size={12} /></Button>
              </li>
            ))}
          </ul>

          {draft?.zone === z.key && (
            <div className="mt-4 rounded-md border border-[#00ff88]/40 bg-[#0a0a0a] p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Label</Label>
                  <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="e.g. LinkedIn" />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" />
                </div>
              </div>
              <div>
                <Label>Icon</Label>
                <IconPicker value={draft.icon} onChange={(icon) => setDraft({ ...draft, icon })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="muted" size="sm" onClick={() => setDraft(null)}><X size={12} /> Cancel</Button>
                <Button variant="primary" size="sm" onClick={saveLink} disabled={busy}><Check size={12} /> Save link</Button>
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
