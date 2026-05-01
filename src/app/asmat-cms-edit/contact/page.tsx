import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import ContactAdmin from "./ContactAdmin";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/asmat-cms-edit/login");

  const [{ data: info }, { data: links }] = await Promise.all([
    sb.from("contact_info").select("*").eq("id", 1).maybeSingle(),
    sb.from("social_links").select("*").order("zone").order("sort_order"),
  ]);

  return (
    <AdminShell email={user.email ?? null}>
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Contact</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Contact info & socials</h1>
      </header>
      <ContactAdmin initialInfo={info ?? null} initialLinks={links ?? []} />
    </AdminShell>
  );
}
