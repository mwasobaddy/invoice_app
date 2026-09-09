import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnAuth = req.nextUrl.pathname.startsWith("/auth");
  const isVerifyPage = req.nextUrl.pathname.startsWith("/auth/verify");
  // Optional: enforce emailVerified for dashboard (allow verify page)
  const needsVerify = isLoggedIn && !(req.auth?.user as { emailVerified?: Date | null } | undefined)?.emailVerified;

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.nextUrl));
  }

  if (isOnDashboard && needsVerify && !isVerifyPage) {
    // In hobby, allow but could redirect to verify — currently just pass through with header
    // return NextResponse.redirect(new URL("/auth/verify", req.nextUrl));
  }

  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
