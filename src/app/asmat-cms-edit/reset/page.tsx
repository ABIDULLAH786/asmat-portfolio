import ResetClient from "./ResetClient";

export const metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="w-full surface p-8">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#00ff88]">Admin</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Set new password</h1>
          <p className="mt-1 text-sm text-white/60">Choose a strong new password.</p>
          <ResetClient />
        </div>
      </div>
    </div>
  );
}
