import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Paths that pending/incomplete members are allowed to visit
const ALLOWED_FOR_PENDING = [
  "/members/complete-registration",
  "/members/pending",
  "/members/check-email",
  "/join",
  "/auth",
  "/api/",
];

function isAllowedForPending(pathname: string): boolean {
  return ALLOWED_FOR_PENDING.some((p) => pathname.startsWith(p));
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes — admin only
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // /members/complete-registration — allow pending users, require auth
    if (pathname.startsWith("/members/complete-registration")) {
      // Token is guaranteed by withAuth's authorized callback
      return NextResponse.next();
    }

    // Protected member routes: /dashboard, /profile, /invite
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/invite")) {
      // New users → join
      if (token?.status === "new") {
        return NextResponse.redirect(new URL("/join", req.url));
      }

      // Pending + not completed registration → complete-registration
      if (token?.status === "pending" && !token?.registrationCompleted) {
        return NextResponse.redirect(new URL("/members/complete-registration", req.url));
      }

      // Pending + completed registration → pending page
      if (token?.status === "pending" && token?.registrationCompleted) {
        return NextResponse.redirect(new URL("/members/pending", req.url));
      }

      // Any other non-approved, non-admin → members page
      if (token?.status !== "approved" && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/members", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/invite/:path*",
    "/members/complete-registration/:path*",
  ],
};
