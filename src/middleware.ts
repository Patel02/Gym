import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const adminRoutes = ["/admin"];
const protectedRoutes = ["/dashboard"];

export default auth((request) => {
  const { nextUrl } = request;
  const isLoggedIn = Boolean(request.auth);
  const role = request.auth?.user?.role;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    return NextResponse.next();
  }

  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = `${pathname}${nextUrl.search}`;
    const signInUrl = new URL("/login", nextUrl);
    signInUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};