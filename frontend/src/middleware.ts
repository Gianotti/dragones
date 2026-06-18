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

  // /landing handles its own auth inline (shows login form if no token)

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
