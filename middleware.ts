import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes — admin only
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Protected member routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/invite")) {
      if (token?.status === "new") {
        return NextResponse.redirect(new URL("/join", req.url));
      }

      // Pending members who haven't completed registration → complete-registration
      if (token?.status === "pending" && !token?.registrationCompleted) {
        if (!pathname.startsWith("/members/complete-registration")) {
          return NextResponse.redirect(new URL("/members/complete-registration", req.url));
        }
      }

      // Pending members who completed registration → pending page
      if (token?.status === "pending" && token?.registrationCompleted) {
        return NextResponse.redirect(new URL("/members/pending", req.url));
      }

      if (token?.status !== "approved" && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/members", req.url));
      }
    }

    // Allow /members/complete-registration for pending users (don't redirect away)
    if (pathname.startsWith("/members/complete-registration")) {
      if (!token) {
        return NextResponse.redirect(new URL("/members", req.url));
      }
      // Let pending users through — they need this page
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
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
