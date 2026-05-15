import { supabasePublic } from "@/lib/supabase/server";
import type {
  AboutContent,
  Category,
  ContactInfo,
  CoreValue,
  Experience,
  Note,
  ProcessStep,
  Project,
  ProjectSlide,
  SiteSettings,
  Skill,
  SocialLink,
  SocialZone,
} from "@/lib/supabase/types";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const sb = supabasePublic();
  const { data } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data as SiteSettings | null;
}

export async function getAboutContent(): Promise<AboutContent | null> {
  const sb = supabasePublic();
  const { data } = await sb.from("about_content").select("*").eq("id", 1).maybeSingle();
  return data as AboutContent | null;
}

export async function getCoreValues(): Promise<CoreValue[]> {
  const sb = supabasePublic();
  const { data } = await sb.from("core_values").select("*").order("sort_order").order("created_at");
  return (data ?? []) as CoreValue[];
}

export async function getSkills(): Promise<Skill[]> {
  const sb = supabasePublic();
  const { data } = await sb.from("skills").select("*").order("sort_order").order("created_at");
  return (data ?? []) as Skill[];
}

export async function getExperiences(): Promise<Experience[]> {
  const sb = supabasePublic();
  const { data } = await sb.from("experiences").select("*").order("sort_order").order("start_date", { ascending: false });
  return (data ?? []) as Experience[];
}

export async function getCategories(): Promise<Category[]> {
  const sb = supabasePublic();
  const { data } = await sb.from("categories").select("*").order("sort_order").order("name");
  return (data ?? []) as Category[];
}

export async function getProjects(): Promise<Project[]> {
  const sb = supabasePublic();
  const { data } = await sb.from("projects").select("*").order("sort_order").order("created_at", { ascending: false });
  return (data ?? []) as Project[];
}

export async function getProjectBySlug(
  slug: string
): Promise<{ project: Project; slides: ProjectSlide[]; category: Category | null } | null> {
  const sb = supabasePublic();
  const { data: project } = await sb.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (!project) return null;
  const [{ data: slides }, { data: category }] = await Promise.all([
    sb.from("project_slides").select("*").eq("project_id", project.id).order("sort_order"),
    project.category_id
      ? sb.from("categories").select("*").eq("id", project.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return {
    project: project as Project,
    slides: (slides ?? []) as ProjectSlide[],
    category: (category ?? null) as Category | null,
  };
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  const sb = supabasePublic();
  const { data } = await sb.from("process_steps").select("*").order("sort_order").order("created_at");
  return (data ?? []) as ProcessStep[];
}

export async function getContactInfo(): Promise<ContactInfo | null> {
  const sb = supabasePublic();
  const { data } = await sb.from("contact_info").select("*").eq("id", 1).maybeSingle();
  return data as ContactInfo | null;
}

export async function getSocialLinks(zone?: SocialZone): Promise<SocialLink[]> {
  const sb = supabasePublic();
  let q = sb.from("social_links").select("*").order("sort_order");
  if (zone) q = q.eq("zone", zone);
  const { data } = await q;
  return (data ?? []) as SocialLink[];
}

export async function getNotes(): Promise<Note[]> {
  const sb = supabasePublic();
  const { data } = await sb.from("notes").select("*").order("sort_order").order("created_at", { ascending: false });
  return (data ?? []) as Note[];
}

export async function getNoteById(id: string): Promise<Note | null> {
  const sb = supabasePublic();
  const { data } = await sb.from("notes").select("*").eq("id", id).maybeSingle();
  return data as Note | null;
}

/** Returns a Map<categoryId, count> for non-empty categories. */
export async function getCategoryCounts(): Promise<Map<string, number>> {
  const sb = supabasePublic();
  const { data } = await sb.from("projects").select("category_id");
  const m = new Map<string, number>();
  (data ?? []).forEach((row: { category_id: string | null }) => {
    if (!row.category_id) return;
    m.set(row.category_id, (m.get(row.category_id) ?? 0) + 1);
  });
  return m;
}
