import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import ProjectsAdmin from "./ProjectsAdmin";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/asmat-cms-edit/login");

  const [{ data: projects }, { data: categories }] = await Promise.all([
    sb.from("projects").select("*").order("sort_order").order("created_at", { ascending: false }),
    sb.from("categories").select("*").order("sort_order").order("name"),
  ]);

  return (
    <AdminShell email={user.email ?? null}>
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Projects</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Portfolio projects</h1>
        <p className="mt-1 text-sm text-white/60">
          Add, edit and delete projects. Each project can have multiple slides with images.
        </p>
      </header>
      <ProjectsAdmin
        initialProjects={projects ?? []}
        initialCategories={categories ?? []}
      />
    </AdminShell>
  );
}
