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

    // Protected routes — approved or admin only
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/contribute")
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
  ],
};
