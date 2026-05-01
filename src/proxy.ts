import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_PREFIX = "/asmat-cms-edit";
const LOGIN_PATH = "/asmat-cms-edit/login";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Protected admin routes (everything under /asmat-cms-edit except /login + /reset)
  const isAdmin =
    path === ADMIN_PREFIX ||
    (path.startsWith(ADMIN_PREFIX + "/") &&
      !path.startsWith(LOGIN_PATH) &&
      !path.startsWith(ADMIN_PREFIX + "/reset"));

  if (isAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // If signed in and visiting login, bounce into the dashboard
  if (path === LOGIN_PATH && user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_PREFIX;
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
