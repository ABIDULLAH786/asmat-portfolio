"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { LogIn, KeyRound, ArrowLeft } from "lucide-react";

type Mode = "signin" | "request-reset";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/asmat-cms-edit";
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);

  async function onSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back.");
    router.push(next);
    router.refresh();
  }

  async function onRequestReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const sb = supabaseBrowser();
    const redirectTo = `${window.location.origin}/asmat-cms-edit/reset`;
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Reset link sent. Check your inbox.");
    setMode("signin");
  }

  return (
    <div className="mt-6">
      {mode === "signin" ? (
        <form onSubmit={onSignIn} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required defaultValue="asmat@gmail.com" autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" disabled={busy} variant="primary" size="lg" className="w-full">
            {busy ? "Signing in…" : (
              <>
                <LogIn size={14} /> Sign in
              </>
            )}
          </Button>
          <button
            type="button"
            onClick={() => setMode("request-reset")}
            className="mt-2 block w-full text-center font-display text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-[#00ff88]"
          >
            Forgot password?
          </button>
        </form>
      ) : (
        <form onSubmit={onRequestReset} className="space-y-4">
          <p className="text-sm text-white/70">
            Enter your account email. We&apos;ll send you a reset link.
          </p>
          <div>
            <Label htmlFor="reset-email">Email</Label>
            <Input id="reset-email" name="email" type="email" required defaultValue="asmat@gmail.com" />
          </div>
          <Button type="submit" disabled={busy} variant="primary" size="lg" className="w-full">
            {busy ? "Sending…" : (
              <>
                <KeyRound size={14} /> Send reset link
              </>
            )}
          </Button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="mt-2 inline-flex items-center gap-1 font-display text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-[#00ff88]"
          >
            <ArrowLeft size={12} /> Back to sign in
          </button>
        </form>
      )}
    </div>
  );
}
