import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Allow common image hosts used during data import
      { protocol: "https" as const, hostname: "github.com" },
      { protocol: "https" as const, hostname: "raw.githubusercontent.com" },
      { protocol: "https" as const, hostname: "upload.wikimedia.org" },
      { protocol: "https" as const, hostname: "static.canva.com" },
    ],
  },
};

export default nextConfig;
