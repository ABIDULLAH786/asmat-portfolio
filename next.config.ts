import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "");

const nextConfig: NextConfig = {
  images: {
    // The CMS lets the admin paste arbitrary image URLs (GitHub, gstatic,
    // imgur, anything they've already hosted). Whitelist any HTTPS host so
    // next/image accepts every URL the admin enters. The narrower Supabase
    // pattern still ensures Storage public reads work.
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
      // Catch-all — allow any HTTPS host. Admin-only writes, so the surface
      // is intentional and limited to images the site owner has chosen.
      { protocol: "https" as const, hostname: "**" },
    ],
  },
};

export default nextConfig;
