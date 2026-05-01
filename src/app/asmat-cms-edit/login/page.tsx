import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="w-full surface p-8">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Admin</p>
          <h1 className="mt-2 font-display text-3xl font-bold">CMS Access</h1>
          <p className="mt-1 text-sm text-white/60">
            Restricted area. Sign-up is disabled.
          </p>
          <Suspense fallback={<div className="mt-6 text-sm text-white/50">Loading…</div>}>
            <LoginClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
