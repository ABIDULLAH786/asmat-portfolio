"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { ContactMessage } from "@/lib/supabase/types";
import { Mail, MailOpen, Trash2, ChevronDown, ChevronRight, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessagesAdmin({ initial }: { initial: ContactMessage[] }) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [messages, setMessages] = useState<ContactMessage[]>(initial);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function toggleRead(m: ContactMessage) {
    const { error } = await sb.from("contact_messages").update({ is_read: !m.is_read }).eq("id", m.id);
    if (error) return toast.error(error.message);
    setMessages(messages.map((x) => (x.id === m.id ? { ...x, is_read: !m.is_read } : x)));
    router.refresh();
  }

  async function del(m: ContactMessage) {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    const { error } = await sb.from("contact_messages").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    setMessages(messages.filter((x) => x.id !== m.id));
    toast.success("Deleted.");
    router.refresh();
  }

  if (messages.length === 0) {
    return (
      <div className="mt-8 rounded-md border border-dashed border-[#1a1a1a] p-12 text-center text-white/50">
        No messages yet. They&apos;ll appear here when someone uses the contact form.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {messages.map((m) => {
        const isOpen = expanded === m.id;
        return (
          <article
            key={m.id}
            className={cn(
              "surface overflow-hidden",
              !m.is_read && "border-[#00ff88]/40"
            )}
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : m.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                m.is_read ? "bg-[#0f0f0f] text-white/60" : "bg-[#00ff88] text-black"
              )}>
                {m.is_read ? <MailOpen size={16} /> : <Mail size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-white">
                  {m.name} <span className="text-white/40">·</span>{" "}
                  <a
                    href={`mailto:${m.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#00ff88] hover:underline"
                  >
                    {m.email}
                  </a>
                </p>
                {m.subject && (
                  <p className="font-display text-xs text-white/70">{m.subject}</p>
                )}
                <p className="text-[10px] text-white/40">{new Date(m.created_at).toLocaleString()}</p>
              </div>
              {isOpen ? <ChevronDown size={16} className="text-white/50" /> : <ChevronRight size={16} className="text-white/50" />}
            </button>
            {isOpen && (
              <div className="border-t border-[#1a1a1a] p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{m.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="primary" size="sm">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "your message"))}`}>
                      <Reply size={12} /> Reply
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleRead(m)}>
                    {m.is_read ? <Mail size={12} /> : <MailOpen size={12} />} Mark as {m.is_read ? "unread" : "read"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => del(m)}>
                    <Trash2 size={12} /> Delete
                  </Button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
