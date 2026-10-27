import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const superAdminRoutes = ["/super-admin"];
const adminRoutes = ["/admin"];
const protectedRoutes = ["/dashboard"];
const refereeRoutes = ["/referee/dashboard"];

export default auth((request) => {
  const { nextUrl } = request;
  const isLoggedIn = Boolean(request.auth);
  const role = request.auth?.user?.role;
  const pathname = nextUrl.pathname;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isRefereeAuthRoute =
    pathname === "/referee/login" || pathname === "/referee/register";

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Send authenticated users away from login and registration pages.
  if (isAuthRoute && isLoggedIn) {
    if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin", nextUrl));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
    if (role === "REFEREE") return NextResponse.redirect(new URL("/referee/dashboard", nextUrl));
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // If a logged-in referee hits /referee/login or /referee/register → their dashboard
  if (isRefereeAuthRoute && isLoggedIn && role === "REFEREE") {
    return NextResponse.redirect(new URL("/referee/dashboard", nextUrl));
  }

  // SUPER_ADMIN route guard — strictly exclusive to SUPER_ADMIN only
  const isSuperAdminRoute = superAdminRoutes.some((route) => pathname.startsWith(route));
  if (isSuperAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = `${pathname}${nextUrl.search}`;
      const signInUrl = new URL("/login", nextUrl);
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(signInUrl);
    }
    if (role !== "SUPER_ADMIN") {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Admin route guard — accessible to ADMIN and SUPER_ADMIN
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") return NextResponse.redirect(new URL("/dashboard", nextUrl));
    return NextResponse.next();
  }

  // Referee dashboard guard — must be logged in AND have REFEREE, ADMIN, or SUPER_ADMIN role
  const isRefereeRoute = refereeRoutes.some((route) => pathname.startsWith(route));
  if (isRefereeRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/referee/login", nextUrl));
    }
    if (role !== "REFEREE" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      // Athletes who accidentally try to visit referee dashboard → their dashboard
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Standard protected routes (athlete dashboard)
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute) {
    if (!isLoggedIn) {
      const callbackUrl = `${pathname}${nextUrl.search}`;
      const signInUrl = new URL("/login", nextUrl);
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(signInUrl);
    }
    if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin", nextUrl));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};