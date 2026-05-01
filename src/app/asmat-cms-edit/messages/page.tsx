import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import MessagesAdmin from "./MessagesAdmin";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/asmat-cms-edit/login");

  const { data: messages } = await sb
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const unread = (messages ?? []).filter((m) => !m.is_read).length;

  return (
    <AdminShell email={user.email ?? null}>
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Messages</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Inbox</h1>
        </div>
        {unread > 0 && (
          <span className="rounded-full bg-[#00ff88] px-3 py-1 font-display text-[10px] uppercase tracking-[0.2em] text-black">
            {unread} unread
          </span>
        )}
      </header>
      <MessagesAdmin initial={messages ?? []} />
    </AdminShell>
  );
}
