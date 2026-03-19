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
      return NextResponse.next();
    }

    // Allow these paths for any authenticated user (including pending)
    if (
      pathname.startsWith("/members/complete-registration") ||
      pathname.startsWith("/members/pending")
    ) {
      return NextResponse.next();
    }

    // Protected member routes: /dashboard, /profile, /invite, /contribute
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/contribute")
    ) {
      if (token?.status === "new") {
        return NextResponse.redirect(new URL("/join", req.url));
      }
      if (token?.status === "pending") {
        return NextResponse.redirect(new URL("/members/pending", req.url));
      }
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
    "/contribute/:path*",
    "/members/complete-registration/:path*",
    "/members/pending/:path*",
  ],
};
