import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
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
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"],
};
