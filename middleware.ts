import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// In-memory cache for maintenance mode status
let cachedStatus: { value: boolean; ts: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

const MAINTENANCE_BYPASS = [
  "/holding",
  "/auth",
  "/api/auth",
  "/api/",
  "/admin",
  "/dashboard",
  "/bloglux",
  "/insights",
  "/_next/",
  "/favicon.ico",
  "/images/",
  "/fonts/",
  "/logos/",
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

const ROLE_HOME: Record<string, string> = {
  business: "/dashboard/business",
  insider: "/dashboard/insider",
  insider_contributor: "/dashboard/insider",
  insider_key_speaker: "/dashboard/insider",
  rising: "/dashboard/candidate",
  pro: "/dashboard/candidate",
  executive: "/dashboard/candidate",
  professional: "/dashboard/candidate",
  admin: "/admin",
};

const PROTECTED_SURFACES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard/business", roles: ["business"] },
  { prefix: "/dashboard/insider", roles: ["insider", "insider_contributor", "insider_key_speaker"] },
  { prefix: "/dashboard/candidate", roles: ["rising", "pro", "executive", "professional"] },
  { prefix: "/admin", roles: ["admin"] },
];

export default withAuth(
  async function middleware(req) {
    const { pathname, searchParams } = req.nextUrl;
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

    // HOLDING PAGE — re-enable before soft launch if needed
    // if (
    //   host.includes("joblux.com") &&
    //   req.cookies.get("joblux_preview")?.value !== "true" &&
    //   !HOLDING_BYPASS.some((p) => pathname.startsWith(p))
    // ) {
    //   return NextResponse.redirect(new URL("/holding", req.url));
    // }

    // Prevent callbackUrl nesting — if the callbackUrl itself contains a callbackUrl, flatten it
    if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
      const cb = searchParams.get("callbackUrl");
      if (cb && cb.includes("callbackUrl")) {
        try {
          const inner = new URL(cb, req.url);
          const deepCb = inner.searchParams.get("callbackUrl");
          if (deepCb) {
            const cleaned = new URL(req.url);
            cleaned.searchParams.set("callbackUrl", deepCb);
            return NextResponse.redirect(cleaned);
          }
        } catch { /* malformed URL, continue */ }
      }
    }

    // Check maintenance bypass paths
    if (!MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p))) {
      const isMaintenanceOn = await getMaintenanceMode();
      if (isMaintenanceOn && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/holding", req.url));
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
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    // Role-based surface enforcement — members.role is mirrored to token.role via NextAuth JWT callback
    const surface = PROTECTED_SURFACES.find((s) => pathname.startsWith(s.prefix));
    if (surface) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      const userRole = token?.role as string | undefined;
      if (!userRole || !surface.roles.includes(userRole)) {
        const home = (userRole && ROLE_HOME[userRole]) || "/join";
        return NextResponse.redirect(new URL(home, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Let all requests through to our middleware — it handles access control
      authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/|logos/).*)",
  ],
};
