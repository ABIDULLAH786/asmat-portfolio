"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { uploadToBucket, deleteByPublicUrl } from "@/lib/upload";
import type { Note } from "@/lib/supabase/types";
import { Plus, Pencil, Trash2, Upload, X, Notebook, ExternalLink } from "lucide-react";

export default function NotesAdmin({ initial }: { initial: Note[] }) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [notes, setNotes] = useState<Note[]>(initial);
  const [draft, setDraft] = useState<Note | null>(null);
  const [busy, setBusy] = useState(false);

  function newNote() {
    setDraft({
      id: "new",
      title: "",
      description: "",
      thumbnail_url: null,
      file_url: null,
      external_link: null,
      sort_order: notes.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async function uploadThumb(e: React.ChangeEvent<HTMLInputElement>) {
    if (!draft) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (draft.thumbnail_url) await deleteByPublicUrl("thumbnails", draft.thumbnail_url);
      const url = await uploadToBucket("thumbnails", file);
      setDraft({ ...draft, thumbnail_url: url });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!draft) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (draft.file_url) await deleteByPublicUrl("notes", draft.file_url);
      const url = await uploadToBucket("notes", file);
      setDraft({ ...draft, file_url: url });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) return toast.error("Title is required.");
    if (!draft.file_url && !draft.external_link?.trim()) {
      return toast.error("Either upload a file OR provide an external link.");
    }
    setBusy(true);
    const payload = {
      title: draft.title,
      description: draft.description || null,
      thumbnail_url: draft.thumbnail_url,
      file_url: draft.file_url,
      external_link: draft.external_link?.trim() || null,
      sort_order: draft.sort_order,
    };
    if (draft.id === "new") {
      const { data, error } = await sb.from("notes").insert(payload).select().single();
      setBusy(false);
      if (error) return toast.error(error.message);
      setNotes([data as Note, ...notes]);
    } else {
      const { error } = await sb.from("notes").update(payload).eq("id", draft.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      setNotes(notes.map((n) => (n.id === draft.id ? draft : n)));
    }
    setDraft(null);
    toast.success("Saved.");
    router.refresh();
  }

  async function del(n: Note) {
    if (!confirm(`Delete "${n.title}"?`)) return;
    const { error } = await sb.from("notes").delete().eq("id", n.id);
    if (error) return toast.error(error.message);
    if (n.thumbnail_url) await deleteByPublicUrl("thumbnails", n.thumbnail_url);
    if (n.file_url) await deleteByPublicUrl("notes", n.file_url);
    setNotes(notes.filter((x) => x.id !== n.id));
    toast.success("Deleted.");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={newNote}><Plus size={12} /> Add note</Button>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#1a1a1a] p-12 text-center text-white/50">
          No notes yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="surface flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-[#1a1a1a] bg-[#0a0a0a]">
                {n.thumbnail_url ? (
                  <Image src={n.thumbnail_url} alt="" fill sizes="120px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/30">
                    <Notebook size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-semibold text-white">{n.title}</p>
                {n.description && <p className="line-clamp-1 text-xs text-white/60">{n.description}</p>}
                <div className="mt-1 flex flex-wrap gap-2">
                  {n.file_url && <Tag>File</Tag>}
                  {n.external_link && <Tag>Link</Tag>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button asChild variant="muted" size="icon">
                  <Link href={`/notes/${n.id}`} target="_blank"><ExternalLink size={12} /></Link>
                </Button>
                <Button variant="muted" size="icon" onClick={() => setDraft(n)}><Pencil size={12} /></Button>
                <Button variant="danger" size="icon" onClick={() => del(n)}><Trash2 size={12} /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
          <div className="mx-auto my-6 max-w-3xl rounded-lg border border-[#1a1a1a] bg-[#070707] p-5 md:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-white">
                {draft.id === "new" ? "New note" : "Edit note"}
              </h3>
              <Button variant="muted" size="icon" onClick={() => setDraft(null)}><X size={14} /></Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={4} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </div>

              <div>
                <Label>Thumbnail (optional)</Label>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-24 overflow-hidden rounded-md border border-[#1a1a1a] bg-[#0a0a0a]">
                    {draft.thumbnail_url ? (
                      <Image src={draft.thumbnail_url} alt="" fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <Notebook size={16} />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={uploadThumb} />
                    <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#00ff88] bg-transparent px-3 font-display text-[10px] uppercase tracking-[0.2em] text-[#00ff88] hover:bg-[#00ff88] hover:text-black">
                      <Upload size={12} /> Upload thumbnail
                    </span>
                  </label>
                  {draft.thumbnail_url && (
                    <Button variant="danger" size="sm" onClick={async () => {
                      if (draft.thumbnail_url) await deleteByPublicUrl("thumbnails", draft.thumbnail_url);
                      setDraft({ ...draft, thumbnail_url: null });
                    }}>
                      <Trash2 size={12} /> Remove
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-[#1a1a1a] bg-[#0a0a0a] p-4">
                  <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[#00ff88]">Option A — File</p>
                  {draft.file_url ? (
                    <div className="mt-3">
                      <a href={draft.file_url} target="_blank" rel="noopener noreferrer" className="block break-all text-xs text-white underline-offset-2 hover:underline">
                        {draft.file_url}
                      </a>
                      <Button variant="danger" size="sm" className="mt-3" onClick={async () => {
                        if (draft.file_url) await deleteByPublicUrl("notes", draft.file_url);
                        setDraft({ ...draft, file_url: null });
                      }}>
                        <Trash2 size={12} /> Remove file
                      </Button>
                    </div>
                  ) : (
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#00ff88] bg-transparent px-3 py-2 font-display text-[10px] uppercase tracking-[0.2em] text-[#00ff88] hover:bg-[#00ff88] hover:text-black">
                      <Upload size={12} /> Upload file
                      <input type="file" accept=".pdf,.doc,.docx,.txt,.zip" className="hidden" onChange={uploadFile} />
                    </label>
                  )}
                  <p className="mt-2 text-[10px] text-white/40">PDF, DOC, DOCX, TXT, ZIP.</p>
                </div>

                <div className="rounded-md border border-[#1a1a1a] bg-[#0a0a0a] p-4">
                  <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[#00ff88]">Option B — External link</p>
                  <Input
                    className="mt-3"
                    placeholder="https://drive.google.com/…"
                    value={draft.external_link ?? ""}
                    onChange={(e) => setDraft({ ...draft, external_link: e.target.value })}
                  />
                  <p className="mt-2 text-[10px] text-white/40">Google Drive, website URL, etc.</p>
                </div>
              </div>

              <p className="text-[10px] text-white/50">
                You must provide at least one of: file or external link.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="muted" size="md" onClick={() => setDraft(null)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save note"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#00ff88]/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em] text-[#00ff88]">
      {children}
    </span>
  );
}
