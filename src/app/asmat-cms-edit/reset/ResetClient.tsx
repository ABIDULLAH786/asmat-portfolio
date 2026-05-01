"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Save } from "lucide-react";

export default function ResetClient() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 8) {
      setBusy(false);
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setBusy(false);
      toast.error("Passwords don't match.");
      return;
    }
    const sb = supabaseBrowser();
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. Redirecting…");
    router.push("/asmat-cms-edit");
    router.refresh();
  }

  return (
    <div className="mt-6">
      {!hasSession && (
        <div className="mb-4 rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">
          Open the reset link from your email to authenticate this session.
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <Button type="submit" disabled={busy || !hasSession} variant="primary" size="lg" className="w-full">
          {busy ? "Updating…" : (
            <>
              <Save size={14} /> Update password
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
