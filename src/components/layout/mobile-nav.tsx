"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useConfirm } from "../providers/confirm-provider";

interface MobileNavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const MobileNavContext = createContext<MobileNavContextValue | null>(
  null,
);

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return context;
}

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function MobileNav() {
  const { open, setOpen } = useMobileNav();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const authModal = useAuthModal();
  const confirm = useConfirm();

  const handleLogout = async () => {
    const result = await confirm({
      title: "Confirm Logout",
      description: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      destructive: true,
    });
    if (result) {
      await logout();
      toast.success("Logged out successfully");
      setOpen(false);
    }
  };

  const handleOpenAuth = (mode: "login" | "register") => {
    setOpen(false);
    authModal.open(mode);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-[300px] bg-background text-foreground border-none p-0 flex flex-col [&>button:first-of-type]:hidden"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <div className="flex flex-col px-6 pt-10 pb-6 border-b border-border/10">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="relative h-8 w-8"
          >
            <Image
              src="/logo.png"
              alt="Dashboard"
              fill
              className="object-contain object-left brightness-0 invert"
              priority
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="flex flex-col px-6 pt-6 pb-4">
            <div className="my-2" />

            {isAuthenticated && user && (
              <div className="flex flex-col">
                <Link
                  href="/profile/profile"
                  onClick={() => setOpen(false)}
                  className="py-3 text-foreground/80 hover:text-foreground transition-colors text-base font-medium"
                >
                  Profile
                </Link>
                <Link
                  href="/profile/booking-history"
                  onClick={() => setOpen(false)}
                  className="py-3 text-foreground/80 hover:text-foreground transition-colors text-base font-medium"
                >
                  Booking History
                </Link>
                <button
                  className="flex items-center justify-between py-3 text-foreground/80 hover:text-foreground transition-colors text-base font-medium text-left w-full"
                  onClick={handleLogout}
                >
                  Logout
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </nav>
        </div>

        <div className="px-6 pb-8 flex flex-col gap-4">
          <div className="border-t border-white/10 my-1" />

          {isLoading ? (
            <div className="h-12 w-full rounded-md animate-pulse bg-white/10" />
          ) : isAuthenticated && user ? (
            <Link
              href="/profile/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 bg-primary/20 hover:bg-primary/30 text-white rounded-lg px-4 py-3 transition-colors shrink-0"
            >
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="font-semibold truncate">{user.name}</span>
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full bg-transparent text-primary border-primary hover:bg-primary/10"
                onClick={() => handleOpenAuth("login")}
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
