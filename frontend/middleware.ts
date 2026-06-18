import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("dragones_token")?.value;
  const role = request.cookies.get("dragones_role")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token || role !== "admin") {
      return NextResponse.redirect(new URL("/login?from=admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/landing")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/landing/:path*"],
};
