import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminPortalPathToAdmin } from "@/lib/adminPortalSession";
import {
  ADMIN_AUTH_COOKIE,
  isAdminTokenValue,
  isLmsFirebaseToken,
} from "@/lib/authTokens";

const LMS_SESSION_COOKIE = "lms_sid";
const ADMIN_SESSION_COOKIE = "admin_sid";
const LMS_AUTH_COOKIE = "authToken";

function readAdminPortalToken(request: NextRequest): string | undefined {
  const dedicated = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (isAdminTokenValue(dedicated)) return dedicated;

  const legacy = request.cookies.get(LMS_AUTH_COOKIE)?.value;
  if (isAdminTokenValue(legacy)) return legacy;

  return undefined;
}

function readLmsPortalToken(request: NextRequest): string | undefined {
  const token = request.cookies.get(LMS_AUTH_COOKIE)?.value;
  return isLmsFirebaseToken(token) ? token : undefined;
}

function portalToDashboard(pathname: string): string | null {
  const match = pathname.match(/^\/portal\/[^/]+(\/.*)?$/);
  if (!match) return null;
  const suffix = match[1] ?? "";
  if (!suffix || suffix === "/") return "/dashboard";
  return `/dashboard${suffix}`;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lmsSessionCookie = request.cookies.get(LMS_SESSION_COOKIE)?.value;
  const adminSessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const lmsAuthToken = readLmsPortalToken(request);
  const adminAuthToken = readAdminPortalToken(request);

  // --- Obfuscated LMS portal: /portal/{sessionId}/… ---
  const portalSessionMatch = pathname.match(/^\/portal\/([^/]+)/);
  if (portalSessionMatch) {
    const urlSessionId = portalSessionMatch[1];

    if (
      !lmsSessionCookie ||
      lmsSessionCookie !== urlSessionId ||
      !lmsAuthToken
    ) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("reason", "session");
      return NextResponse.redirect(loginUrl);
    }

    const dashboardPath = portalToDashboard(pathname);
    if (dashboardPath) {
      return NextResponse.rewrite(new URL(dashboardPath, request.url));
    }
  }

  // --- Block direct /dashboard access; force obfuscated portal URL ---
  if (pathname.startsWith("/dashboard")) {
    if (!lmsSessionCookie || !lmsAuthToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const portalUrl = new URL(`/portal/${lmsSessionCookie}${pathname.slice("/dashboard".length)}`, request.url);
    return NextResponse.redirect(portalUrl);
  }

  // --- Obfuscated admin portal: /admin-portal/{sessionId}/… ---
  const adminPortalSessionMatch = pathname.match(/^\/admin-portal\/([^/]+)/);
  if (adminPortalSessionMatch) {
    const urlSessionId = adminPortalSessionMatch[1];

    if (
      !adminSessionCookie ||
      adminSessionCookie !== urlSessionId ||
      !adminAuthToken
    ) {
      const loginUrl = new URL("/admin/auth/login", request.url);
      loginUrl.searchParams.set("reason", "session");
      return NextResponse.redirect(loginUrl);
    }

    const adminPath = adminPortalPathToAdmin(pathname);
    if (adminPath) {
      return NextResponse.rewrite(new URL(adminPath, request.url));
    }
  }

  // --- Block direct /admin access (except auth); force obfuscated portal URL ---
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/auth")) {
    if (!adminAuthToken) {
      const url = new URL("/admin/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    if (!adminSessionCookie) {
      const loginUrl = new URL("/admin/auth/login", request.url);
      loginUrl.searchParams.set("reason", "session");
      return NextResponse.redirect(loginUrl);
    }

    const adminPortalUrl = new URL(
      `/admin-portal/${adminSessionCookie}${pathname.slice("/admin".length)}`,
      request.url
    );
    return NextResponse.redirect(adminPortalUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/dashboard/:path*",
    "/admin-portal/:path*",
    "/admin/:path*",
  ],
};
