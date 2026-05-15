"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Save } from "lucide-react";

type Props = {
  initialEnabled: boolean;
  initialPerPage: number;
};

export default function PaginationPanel({ initialEnabled, initialPerPage }: Props) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [busy, setBusy] = useState(false);

  async function save() {
    const n = Math.max(1, Math.min(100, Math.floor(Number(perPage) || 9)));
    setBusy(true);
    const { error } = await sb
      .from("site_settings")
      .update({
        portfolio_pagination_enabled: enabled,
        portfolio_per_page: n,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPerPage(n);
    toast.success("Pagination settings saved.");
    router.refresh();
  }

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.3em] text-[#00ff88]">
            Pagination
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Toggle pagination on the public Portfolio page and choose how many
            projects appear per page.
          </p>
        </div>
        <label className="inline-flex cursor-pointer select-none items-center gap-2">
          <span className="font-display text-[10px] uppercase tracking-[0.2em] text-white/70">
            Enable pagination
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 accent-[#00ff88]"
          />
        </label>
      </div>

      <div className="mt-5 grid items-end gap-4 sm:grid-cols-[200px_auto_1fr]">
        <div>
          <Label>Items per page</Label>
          <Input
            type="number"
            min={1}
            max={100}
            disabled={!enabled}
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          />
          <p className="mt-1 text-[10px] text-white/40">
            Between 1 and 100. Default is 9 (3×3 grid).
          </p>
        </div>
        <div className="flex">
          <Button onClick={save} disabled={busy} variant="primary" size="md">
            <Save size={14} /> {busy ? "Saving…" : "Save"}
          </Button>
        </div>
        <div className="hidden sm:block" />
      </div>

      {!enabled && (
        <p className="mt-4 text-xs text-white/50">
          Currently disabled — all projects render on the same Portfolio page.
        </p>
      )}
    </section>
  );
}
