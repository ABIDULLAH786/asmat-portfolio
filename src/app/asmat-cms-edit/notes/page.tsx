import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import NotesAdmin from "./NotesAdmin";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/asmat-cms-edit/login");

  const { data: notes } = await sb.from("notes").select("*").order("sort_order").order("created_at", { ascending: false });

  return (
    <AdminShell email={user.email ?? null}>
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Notes</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Resources & study notes</h1>
      </header>
      <NotesAdmin initial={notes ?? []} />
    </AdminShell>
  );
}
