"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { uploadToBucket, deleteByPublicUrl } from "@/lib/upload";
import { slugify } from "@/lib/utils";
import type { Category, Project, ProjectSlide } from "@/lib/supabase/types";
import { Plus, Pencil, Trash2, ExternalLink, Upload, X, Image as ImageIcon, ChevronUp, ChevronDown } from "lucide-react";

type Props = { initialProjects: Project[]; initialCategories: Category[] };

export default function ProjectsAdmin({ initialProjects, initialCategories }: Props) {
  const router = useRouter();
  const sb = supabaseBrowser();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editing, setEditing] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);

  function newProject() {
    setEditing({
      id: "new",
      title: "",
      slug: "",
      description: "",
      category_id: categories[0]?.id ?? null,
      cover_image: null,
      sort_order: projects.length,
      tags: [],
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async function deleteProject(p: Project) {
    if (!confirm(`Delete "${p.title}"? This will also delete its slides.`)) return;
    const { error } = await sb.from("projects").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    if (p.cover_image) await deleteByPublicUrl("projects", p.cover_image);
    setProjects(projects.filter((x) => x.id !== p.id));
    toast.success("Deleted.");
    router.refresh();
  }

  async function move(p: Project, dir: -1 | 1) {
    const idx = projects.findIndex((x) => x.id === p.id);
    const swap = projects[idx + dir];
    if (!swap) return;
    const a = { ...p, sort_order: swap.sort_order };
    const b = { ...swap, sort_order: p.sort_order };
    setProjects(projects.map((x) => (x.id === a.id ? a : x.id === b.id ? b : x)).sort((x, y) => x.sort_order - y.sort_order));
    await Promise.all([
      sb.from("projects").update({ sort_order: a.sort_order }).eq("id", a.id),
      sb.from("projects").update({ sort_order: b.sort_order }).eq("id", b.id),
    ]);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      <CategoriesPanel
        categories={categories}
        setCategories={setCategories}
        onChanged={() => router.refresh()}
      />

      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">Projects</h2>
        <Button variant="primary" size="sm" onClick={newProject}><Plus size={12} /> Add project</Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#1a1a1a] p-12 text-center text-white/50">
          No projects yet. Click &quot;Add project&quot; to begin.
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p, i) => {
            const cat = categories.find((c) => c.id === p.category_id);
            return (
              <li key={p.id} className="surface flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-[#1a1a1a] bg-[#0a0a0a]">
                  {p.cover_image ? (
                    <Image src={p.cover_image} alt="" fill sizes="120px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/30">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base font-semibold text-white">{p.title}</p>
                  <p className="text-xs text-white/60">/{p.slug}</p>
                  {cat && (
                    <p className="mt-0.5 inline-block rounded-full bg-[#00ff88]/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em] text-[#00ff88]">
                      {cat.name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="muted" size="icon" disabled={i === 0} onClick={() => move(p, -1)}><ChevronUp size={12} /></Button>
                  <Button variant="muted" size="icon" disabled={i === projects.length - 1} onClick={() => move(p, 1)}><ChevronDown size={12} /></Button>
                </div>
                <div className="flex gap-1">
                  <Button asChild variant="muted" size="icon">
                    <Link href={`/portfolio/${p.slug}`} target="_blank"><ExternalLink size={12} /></Link>
                  </Button>
                  <Button variant="muted" size="icon" onClick={() => setEditing(p)}><Pencil size={12} /></Button>
                  <Button variant="danger" size="icon" onClick={() => deleteProject(p)}><Trash2 size={12} /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <ProjectEditor
          project={editing}
          categories={categories}
          onCategoriesChange={setCategories}
          busy={busy}
          setBusy={setBusy}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setProjects((arr) =>
              arr.some((x) => x.id === saved.id)
                ? arr.map((x) => (x.id === saved.id ? saved : x))
                : [saved, ...arr]
            );
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
 * Categories panel
 * ============================================================ */
function CategoriesPanel({
  categories,
  setCategories,
  onChanged,
}: {
  categories: Category[];
  setCategories: (c: Category[]) => void;
  onChanged: () => void;
}) {
  const sb = supabaseBrowser();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  async function addCategory() {
    const n = name.trim();
    if (!n) return;
    const slug = slugify(n);
    const { data, error } = await sb
      .from("categories")
      .insert({ name: n, slug, sort_order: categories.length })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setCategories([...categories, data as Category]);
    setName("");
    setAdding(false);
    toast.success("Category added.");
    onChanged();
  }

  async function delCategory(id: string) {
    if (!confirm("Delete this category? Projects in it will become uncategorized.")) return;
    const { error } = await sb.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setCategories(categories.filter((c) => c.id !== id));
    toast.success("Deleted.");
    onChanged();
  }

  return (
    <section className="surface p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">Categories</h2>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus size={12} /> Add category
          </Button>
        )}
      </div>

      {adding && (
        <div className="mt-3 flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" autoFocus />
          <Button variant="primary" size="md" onClick={addCategory}>Save</Button>
          <Button variant="muted" size="md" onClick={() => { setAdding(false); setName(""); }}>Cancel</Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-full border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-1.5">
            <span className="font-display text-xs text-white">{c.name}</span>
            <button onClick={() => delCategory(c.id)} className="text-white/40 hover:text-red-400" aria-label="Delete">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
 * Project editor (modal-ish inline panel)
 * ============================================================ */
function ProjectEditor({
  project,
  categories,
  onCategoriesChange,
  busy,
  setBusy,
  onClose,
  onSaved,
}: {
  project: Project;
  categories: Category[];
  onCategoriesChange: (c: Category[]) => void;
  busy: boolean;
  setBusy: (v: boolean) => void;
  onClose: () => void;
  onSaved: (p: Project) => void;
}) {
  const sb = supabaseBrowser();
  const [draft, setDraft] = useState<Project>(project);
  const [slides, setSlides] = useState<ProjectSlide[]>([]);
  const [loadedSlides, setLoadedSlides] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    if (project.id !== "new") {
      sb.from("project_slides")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order")
        .then(({ data }) => {
          setSlides((data ?? []) as ProjectSlide[]);
          setLoadedSlides(true);
        });
    } else {
      setLoadedSlides(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (draft.cover_image) await deleteByPublicUrl("projects", draft.cover_image);
      const url = await uploadToBucket("projects", file);
      setDraft({ ...draft, cover_image: url });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function createCategory() {
    const n = newCat.trim();
    if (!n) return;
    const slug = slugify(n);
    const { data, error } = await sb.from("categories").insert({ name: n, slug, sort_order: categories.length }).select().single();
    if (error) return toast.error(error.message);
    const cat = data as Category;
    onCategoriesChange([...categories, cat]);
    setDraft({ ...draft, category_id: cat.id });
    setNewCat("");
    setShowNewCat(false);
    toast.success("Category added.");
  }

  async function saveAll() {
    if (!draft.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    const slug = draft.slug.trim() || slugify(draft.title);
    setBusy(true);

    let saved: Project;
    if (draft.id === "new") {
      const { data, error } = await sb
        .from("projects")
        .insert({
          title: draft.title,
          slug,
          description: draft.description || null,
          category_id: draft.category_id,
          cover_image: draft.cover_image,
          sort_order: draft.sort_order,
        })
        .select()
        .single();
      if (error) {
        setBusy(false);
        return toast.error(error.message);
      }
      saved = data as Project;
    } else {
      const { data, error } = await sb
        .from("projects")
        .update({
          title: draft.title,
          slug,
          description: draft.description || null,
          category_id: draft.category_id,
          cover_image: draft.cover_image,
          sort_order: draft.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draft.id)
        .select()
        .single();
      if (error) {
        setBusy(false);
        return toast.error(error.message);
      }
      saved = data as Project;
    }

    // Persist slides
    for (const s of slides) {
      const payload = {
        project_id: saved.id,
        title: s.title,
        description: s.description,
        images: s.images,
        sort_order: s.sort_order,
      };
      if (s.id.startsWith("draft-")) {
        await sb.from("project_slides").insert(payload);
      } else {
        await sb.from("project_slides").update(payload).eq("id", s.id);
      }
    }

    setBusy(false);
    toast.success("Project saved.");
    onSaved(saved);
    onClose();
  }

  function addSlide() {
    setSlides([
      ...slides,
      {
        id: `draft-${Date.now()}`,
        project_id: project.id,
        title: `Slide ${slides.length + 1}`,
        description: null,
        images: [],
        sort_order: slides.length,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  async function deleteSlide(s: ProjectSlide) {
    if (!confirm("Delete this slide?")) return;
    if (!s.id.startsWith("draft-")) {
      await sb.from("project_slides").delete().eq("id", s.id);
    }
    // also try to delete its images
    await Promise.all(s.images.map((u) => deleteByPublicUrl("projects", u)));
    setSlides(slides.filter((x) => x.id !== s.id));
  }

  async function uploadSlideImage(s: ProjectSlide, files: FileList) {
    setBusy(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadToBucket("projects", f)));
      setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, images: [...x.images, ...urls] } : x)));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeSlideImage(s: ProjectSlide, url: string) {
    await deleteByPublicUrl("projects", url);
    setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, images: x.images.filter((u) => u !== url) } : x)));
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="mx-auto my-6 max-w-4xl rounded-lg border border-[#1a1a1a] bg-[#070707] p-5 md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-white">
            {draft.id === "new" ? "New project" : "Edit project"}
          </h3>
          <Button variant="muted" size="icon" onClick={onClose}><X size={14} /></Button>
        </div>

        {/* Basic */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <Input value={draft.slug} placeholder={slugify(draft.title)} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea rows={3} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>

          {/* Category dropdown with create-on-fly */}
          <div className="md:col-span-2">
            <Label>Category</Label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-10 flex-1 rounded-md border border-[#1a1a1a] bg-[#0a0a0a] px-3 text-sm text-white focus:border-[#00ff88] focus:outline-none"
                value={draft.category_id ?? ""}
                onChange={(e) => setDraft({ ...draft, category_id: e.target.value || null })}
              >
                <option value="">— Uncategorized —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {!showNewCat ? (
                <Button variant="outline" size="sm" onClick={() => setShowNewCat(true)}>
                  <Plus size={12} /> New category
                </Button>
              ) : (
                <div className="flex w-full gap-2 sm:w-auto">
                  <Input
                    placeholder="New category name"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    autoFocus
                  />
                  <Button variant="primary" size="md" onClick={createCategory}>Add</Button>
                  <Button variant="muted" size="md" onClick={() => { setShowNewCat(false); setNewCat(""); }}>Cancel</Button>
                </div>
              )}
            </div>
            <p className="mt-1 text-[10px] text-white/40">
              Can&apos;t find a matching category? Click &quot;New category&quot; to create one without leaving this form.
            </p>
          </div>

          {/* Cover image */}
          <div className="md:col-span-2">
            <Label>Cover image</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-32 overflow-hidden rounded-md border border-[#1a1a1a] bg-[#0a0a0a]">
                {draft.cover_image ? (
                  <Image src={draft.cover_image} alt="" fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/30">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={uploadCover} />
                <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#00ff88] bg-[#00ff88] px-3 font-display text-[10px] uppercase tracking-[0.2em] text-black hover:bg-transparent hover:text-[#00ff88]">
                  <Upload size={12} /> Upload cover
                </span>
              </label>
              {draft.cover_image && (
                <Button variant="danger" size="sm" onClick={async () => {
                  if (draft.cover_image) await deleteByPublicUrl("projects", draft.cover_image);
                  setDraft({ ...draft, cover_image: null });
                }}>
                  <Trash2 size={12} /> Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Slides */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">Slides / tabs</h4>
            <Button variant="outline" size="sm" onClick={addSlide}><Plus size={12} /> Add slide</Button>
          </div>
          <p className="mt-1 text-xs text-white/50">
            E.g. Logo, Guidelines, Mockups. Each tab can have multiple images.
          </p>

          {!loadedSlides ? (
            <p className="mt-4 text-sm text-white/40">Loading slides…</p>
          ) : (
            <div className="mt-4 space-y-4">
              {slides.length === 0 && (
                <div className="rounded-md border border-dashed border-[#1a1a1a] p-6 text-center text-xs text-white/50">
                  No slides yet.
                </div>
              )}
              {slides.map((s) => (
                <div key={s.id} className="rounded-md border border-[#1a1a1a] bg-[#0a0a0a] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 grid gap-3 md:grid-cols-2">
                      <div>
                        <Label>Tab title</Label>
                        <Input value={s.title ?? ""} onChange={(e) => setSlides(slides.map((x) => x.id === s.id ? { ...x, title: e.target.value } : x))} />
                      </div>
                      <div>
                        <Label>Tab description</Label>
                        <Input value={s.description ?? ""} onChange={(e) => setSlides(slides.map((x) => x.id === s.id ? { ...x, description: e.target.value } : x))} />
                      </div>
                    </div>
                    <Button variant="danger" size="icon" onClick={() => deleteSlide(s)}><Trash2 size={12} /></Button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-white/60">Images ({s.images.length})</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => e.target.files && uploadSlideImage(s, e.target.files)}
                        />
                        <span className="inline-flex h-8 items-center gap-2 rounded-md border border-[#00ff88] bg-transparent px-3 font-display text-[10px] uppercase tracking-[0.2em] text-[#00ff88] hover:bg-[#00ff88] hover:text-black">
                          <Upload size={12} /> Add images
                        </span>
                      </label>
                    </div>
                    {s.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {s.images.map((url, i) => (
                          <div key={url + i} className="group relative aspect-square overflow-hidden rounded-md border border-[#1a1a1a]">
                            <Image src={url} alt="" fill sizes="180px" className="object-cover" />
                            <button
                              onClick={() => removeSlideImage(s, url)}
                              className="absolute right-1 top-1 rounded-full bg-black/80 p-1 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                              aria-label="Remove"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 flex justify-end gap-2">
          <Button variant="muted" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={saveAll} disabled={busy}>
            {busy ? "Saving…" : "Save project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
