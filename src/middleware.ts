import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { COMING_SOON } from "@/lib/site";

// Everything private is gated here, server-side, before any page or API code runs.
// Uses only Web-standard APIs (Web Crypto) so it runs on Cloudflare Workers.
export const config = {
  // All pages and API routes; skips Next.js assets and files such as robots.txt and favicon.svg.
  matcher: ["/((?!_next/static|_next/image|.*\\.[\\w]+$).*)"],
};

const PRIVATE_PREFIXES = ["/dashboard", "/dj-builder", "/api/dj", "/api/spotify", "/api/admin", "/api/upload"];

function isPrivate(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function lock(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isPrivate(pathname)) {
    // Pre-launch: visitors only see the coming-soon page at "/". Signed-in admins and
    // contributors can browse the full site to preview it. Remove with COMING_SOON = false.
    if (!COMING_SOON || pathname === "/" || pathname === "/login" || pathname.startsWith("/api/")) return NextResponse.next();
    if (await verifySession(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
    const home = req.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return NextResponse.redirect(home);
  }

  const isApi = pathname.startsWith("/api/");
  // The DJ builder and the Spotify account routes are for the admin only.
  const adminOnly = pathname.startsWith("/dj-builder") || pathname.startsWith("/api/dj") || pathname.startsWith("/api/spotify");

  if (pathname === "/dj-builder/login") return lock(NextResponse.next());

  // Reject cross-site writes to the private APIs.
  if (isApi && req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    if (origin) {
      let sameSite = false;
      try {
        sameSite = new URL(origin).host === req.nextUrl.host;
      } catch {}
      if (!sameSite) return lock(NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 }));
    }
  }

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const allowed = session !== null && (!adminOnly || session.role === "admin");
  if (allowed) return lock(NextResponse.next());

  if (isApi) {
    return lock(NextResponse.json({ error: session ? "Admin access required." : "Sign in required." }, { status: session ? 403 : 401 }));
  }
  const login = req.nextUrl.clone();
  login.pathname = adminOnly ? "/dj-builder/login" : "/login";
  login.search = "";
  if (!adminOnly) login.searchParams.set("next", pathname);
  return lock(NextResponse.redirect(login));
}
