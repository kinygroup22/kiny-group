// middleware.ts (in root directory)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If user is authenticated and tries to access login/register, redirect based on role
    if (token && (path === "/login" || path === "/register")) {
      const role = token.role as string;
      
      if (role === "admin" || role === "editor" || role === "contributor") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Protect dashboard routes - require admin, editor, or contributor role
    if (path.startsWith("/dashboard")) {
      const role = token?.role as string;
      
      if (!role || (role !== "admin" && role !== "editor" && role !== "contributor")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes - no authentication required
        if (
          path === "/" ||
          path.startsWith("/blog") ||
          path.startsWith("/brands") ||
          path === "/about" ||
          path === "/contact" ||
          path === "/login" ||
          path === "/register" ||
          path === "/forgot-password" ||
          path.startsWith("/api/auth")
        ) {
          return true;
        }

        // Protected routes - require authentication
        if (path.startsWith("/dashboard") || path.startsWith("/profile")) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};