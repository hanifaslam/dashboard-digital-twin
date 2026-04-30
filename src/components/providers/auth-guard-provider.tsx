"use client";

import { AuthContext, useAuthValue } from "@/hooks/use-auth";
import { authEvents } from "@/lib/auth-event";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const LOGIN_PATH = "/auth/login";
const CHANGE_PASSWORD_PATH = "/auth/change-password";
const DASHBOARD_PATH = "/dashboard";

// Path yang tidak memerlukan login
const PUBLIC_PATHS = [
  "/",
  LOGIN_PATH,
  CHANGE_PASSWORD_PATH,
  "/register",
  "/forgot-password",
];

export function AuthGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuthValue();

  const { isLoading, isAuthenticated } = auth;
  const isPublicRoute = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    // Listen for 401 errors from axios
    const unsubscribe = authEvents.onUnauthorized(() => {
      router.replace(LOGIN_PATH);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Tunggu sampai loading selesai
    if (isLoading) return;

    // Jika belum login dan mencoba akses private route
    if (!isAuthenticated && !isPublicRoute) {
      router.replace(LOGIN_PATH);
      return;
    }

    // Jika sudah login dan mencoba akses login page
    if (isAuthenticated && pathname === LOGIN_PATH) {
      router.replace(DASHBOARD_PATH);
      return;
    }
  }, [isLoading, isAuthenticated, isPublicRoute, pathname, router]);

  // Tampilan loading atau blank saat transisi route
  const shouldShowLoading = !isPublicRoute && isLoading;

  if (shouldShowLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
