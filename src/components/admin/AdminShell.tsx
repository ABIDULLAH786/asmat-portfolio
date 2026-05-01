"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Settings,
  User,
  Folder,
  Layers,
  Mail,
  Notebook,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/asmat-cms-edit",          label: "Site",     icon: Settings },
  { href: "/asmat-cms-edit/about",    label: "About",    icon: User },
  { href: "/asmat-cms-edit/projects", label: "Projects", icon: Folder },
  { href: "/asmat-cms-edit/process",  label: "Process",  icon: Layers },
  { href: "/asmat-cms-edit/contact",  label: "Contact",  icon: Mail },
  { href: "/asmat-cms-edit/notes",    label: "Notes",    icon: Notebook },
  { href: "/asmat-cms-edit/messages", label: "Messages", icon: MessageSquare },
];

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const sb = supabaseBrowser();
    await sb.auth.signOut();
    router.push("/asmat-cms-edit/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/asmat-cms-edit"
      ? pathname === "/asmat-cms-edit"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-[#1a1a1a] bg-[#070707] transition-transform md:translate-x-0",
          open && "translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#1a1a1a] px-4">
          <Link href="/" className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#00ff88]">
            Asmat CMS
          </Link>
          <button className="md:hidden text-white" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col p-3 gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 font-display text-xs uppercase tracking-[0.2em] transition-colors",
                  isActive(item.href)
                    ? "bg-[#00ff88] text-black"
                    : "text-white/70 hover:bg-[#101010] hover:text-white"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-[#1a1a1a] p-3">
          {email && (
            <p className="mb-2 truncate font-display text-[10px] uppercase tracking-[0.2em] text-white/50">
              {email}
            </p>
          )}
          <Button onClick={signOut} variant="muted" size="sm" className="w-full">
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex h-14 items-center justify-between border-b border-[#1a1a1a] bg-black px-4">
        <Link href="/" className="font-display text-xs uppercase tracking-[0.2em] text-[#00ff88]">
          Asmat CMS
        </Link>
        <button onClick={() => setOpen(true)} className="text-white" aria-label="Open menu">
          <Menu size={20} />
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
