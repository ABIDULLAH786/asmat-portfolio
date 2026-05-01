import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import AboutAdmin from "./AboutAdmin";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/asmat-cms-edit/login");

  const [
    { data: about },
    { data: values },
    { data: skills },
    { data: experiences },
  ] = await Promise.all([
    sb.from("about_content").select("*").eq("id", 1).maybeSingle(),
    sb.from("core_values").select("*").order("sort_order").order("created_at"),
    sb.from("skills").select("*").order("sort_order").order("created_at"),
    sb.from("experiences").select("*").order("sort_order").order("start_date", { ascending: false }),
  ]);

  return (
    <AdminShell email={user.email ?? null}>
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">About</p>
        <h1 className="mt-2 font-display text-3xl font-bold">About page</h1>
      </header>
      <AboutAdmin
        initialAbout={about ?? null}
        initialValues={values ?? []}
        initialSkills={skills ?? []}
        initialExperiences={experiences ?? []}
      />
    </AdminShell>
  );
}
