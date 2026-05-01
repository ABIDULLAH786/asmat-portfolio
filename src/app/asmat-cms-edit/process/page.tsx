import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import ProcessAdmin from "./ProcessAdmin";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/asmat-cms-edit/login");

  const { data: steps } = await sb.from("process_steps").select("*").order("sort_order").order("created_at");

  return (
    <AdminShell email={user.email ?? null}>
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Process</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Process steps</h1>
        <p className="mt-1 text-sm text-white/60">
          Add, edit and re-order the workflow steps shown on the Process page.
        </p>
      </header>
      <ProcessAdmin initial={steps ?? []} />
    </AdminShell>
  );
}
