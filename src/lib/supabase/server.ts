import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Anon, cookie-less client for PUBLIC reads.
 * - Does NOT read cookies, so pages stay statically generatable + ISR-cached.
 * - Wraps fetch with `next: { revalidate, tags }` so identical queries are
 *   served from Next.js's Data Cache across requests instead of round-tripping
 *   to Supabase every time.
 *
 * Cached for `PUBLIC_REVALIDATE` seconds. Tag the cache with "public" so we can
 * call `revalidateTag("public")` from admin mutations later if needed.
 */
const PUBLIC_REVALIDATE = 60;
let _publicClient: SupabaseClient | null = null;

export function supabasePublic(): SupabaseClient {
  if (_publicClient) return _publicClient;
  _publicClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input as RequestInfo, {
            ...init,
            // Next.js will cache responses across requests for this duration.
            next: { revalidate: PUBLIC_REVALIDATE, tags: ["public"] },
          }),
      },
    }
  );
  return _publicClient;
}

export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from server component — middleware refreshes the session
          }
        },
      },
    }
  );
}

export function supabaseAdmin() {
  // Service-role: server-only. NEVER import from a client component.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
