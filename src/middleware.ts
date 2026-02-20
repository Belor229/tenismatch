import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes qui nécessitent une authentification
const protectedRoutes = [
  "/profile",
  "/ads/create",
  "/messages",
  "/calendar",
];

// Routes d'authentification (rediriger vers /profile si déjà connecté)
const authRoutes = [
  "/auth/login",
  "/auth/signup",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Vérifier si c'est une route d'authentification
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Récupérer le cookie de session
  const sessionCookie = request.cookies.get("tenismatch_session");
  const isAuthenticated = !!sessionCookie?.value;

  // Si route protégée et non authentifié, rediriger vers login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si route d'authentification et déjà connecté, rediriger vers profile
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|img).*)",
  ],
};

