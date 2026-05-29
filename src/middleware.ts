import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Garde de routes au niveau edge (défense en profondeur).
// Vérifie uniquement la PRÉSENCE du token : l'autorisation réelle (rôle,
// validité de signature) reste assurée côté API. Sans token → redirection
// vers /login en conservant la destination voulue.
const PROTECTED_PREFIXES = ["/admin", "/proprietaire"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/proprietaire/:path*"],
};
