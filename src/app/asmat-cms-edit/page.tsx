import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import SiteSettingsForm from "./SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/asmat-cms-edit/login");

  const { data: settings } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();

  return (
    <AdminShell email={user.email ?? null}>
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Site</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Site settings</h1>
        <p className="mt-1 text-sm text-white/60">
          Logo, hero text, profile image and resume.
        </p>
      </header>
      <SiteSettingsForm initial={settings ?? null} />
    </AdminShell>
  );
}
