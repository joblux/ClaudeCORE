import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// In-memory cache for maintenance mode status
let cachedStatus: { value: boolean; ts: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

const MAINTENANCE_BYPASS = [
  "/offline",
  "/api/",
  "/_next/",
  "/favicon.ico",
  "/images/",
  "/fonts/",
];

async function getMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (cachedStatus && now - cachedStatus.ts < CACHE_TTL) {
    return cachedStatus.value;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();

    if (error || !data) {
      cachedStatus = { value: false, ts: now };
      return false;
    }

    const isOn = data.value === "true";
    cachedStatus = { value: isOn, ts: now };
    return isOn;
  } catch {
    return cachedStatus?.value ?? false;
  }
}

const HOLDING_BYPASS = ["/holding", "/api", "/_next", "/logos", "/favicon"];

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const host = req.headers.get("host") || "";
    const token = req.nextauth.token;

    // Preview mode: ?preview=joblux2026 sets cookie and redirects to /
    if (req.nextUrl.searchParams.get("preview") === "joblux2026") {
      const response = NextResponse.redirect(new URL("/", req.url));
      response.cookies.set("joblux_preview", "true", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
      return response;
    }

    // Holding page: production domain without preview cookie
    if (
      host.includes("joblux.com") &&
      req.cookies.get("joblux_preview")?.value !== "true" &&
      !HOLDING_BYPASS.some((p) => pathname.startsWith(p))
    ) {
      return NextResponse.redirect(new URL("/holding", req.url));
    }

    // Check maintenance bypass paths
    if (!MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p))) {
      const isMaintenanceOn = await getMaintenanceMode();
      if (isMaintenanceOn && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/offline", req.url));
      }
    }

    // Admin routes — admin only
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Protected routes — approved or admin only
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/directory")
    ) {
      if (token?.status === "pending") {
        return NextResponse.redirect(new URL("/members/pending", req.url));
      }
      if (token?.status !== "approved" && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/join", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Allow unauthenticated access to public pages (maintenance redirect handles them)
        const publicPaths = ["/", "/about", "/holding", "/jobs", "/opportunities", "/wikilux", "/bloglux", "/brands", "/signals", "/careers", "/events", "/insights", "/travel", "/[slug]", "/escape", "/interviews", "/salaries", "/coaching", "/the-brief", "/members", "/join", "/offline", "/search", "/companies", "/interview-prep", "/terms", "/privacy", "/faq", "/contact", "/services", "/contribute", "/select-profile", "/connect", "/sitemap.xml", "/robots.txt", "/rss.xml", "/rss", "/feed", "/feed.xml"];
        if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
          return true;
        }
        // API routes and static assets always allowed
        if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/|logos/).*)",
  ],
};
