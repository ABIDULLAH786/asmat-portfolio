import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin — Asmat Portfolio",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
