"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, User, UserIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { MobileNavContext } from "./mobile-nav";
import { useConfirm } from "../providers/confirm-provider";
import { useAuthModal } from "@/hooks/use-auth-modal";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const authModal = useAuthModal();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const confirm = useConfirm();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = pathname === "/" && !isScrolled;

  const headerClass =
    pathname === "/"
      ? isScrolled
        ? "fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md shadow-sm transition-[background-color,box-shadow] duration-300 pr-[var(--removed-body-scroll-bar-size,0px)]"
        : "fixed top-0 left-0 right-0 z-50 w-full bg-transparent transition-[background-color,box-shadow] duration-300 pr-[var(--removed-body-scroll-bar-size,0px)]"
      : "sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md shadow-sm pr-[var(--removed-body-scroll-bar-size,0px)]";

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
    }
  };

  return (
    <header className={headerClass} suppressHydrationWarning>
      <div className="container mx-auto flex h-16 lg:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative h-12 w-12 lg:hidden shrink-0">
          <Image
            src="/logo.png"
            alt="Dashboard"
            fill
            className="object-contain object-left"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </Link>

        <div className="flex lg:hidden items-center gap-1 sm:gap-2 shrink-0">
          <MobileMenuButton
            isTransparent={isTransparent}
            ariaLabel="Open Menu"
          />
        </div>

        <div className="hidden lg:flex items-center">
          <Link
            href="/"
            className="relative h-18 w-18 hover:opacity-80 transition-opacity"
            draggable={false}
          >
            <Image
              src="/logo.png"
              alt="Dashboard"
              fill
              className="object-contain object-left"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              draggable={false}
            />
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {/* <div className="flex items-center gap-2">
            {mounted && theme === 'dark' ? (
              <Moon
                className={`h-5 w-5 ${isTransparent ? 'text-gray-900' : 'text-muted-foreground'}`}
              />
            ) : (
              <Sun
                className={`h-5 w-5 ${isTransparent ? 'text-gray-900' : 'text-orange-500'}`}
              />
            )}
            <Switch
              checked={mounted && theme === 'dark'}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
          </div> */}

          <div className="h-8 w-px bg-border" />

          {isLoading ? (
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full animate-pulse ${
                  isTransparent ? "bg-gray-300/50" : "bg-muted"
                }`}
              />
              <div className="flex flex-col gap-1">
                <div
                  className={`h-3 w-16 rounded animate-pulse ${
                    isTransparent ? "bg-gray-300/50" : "bg-muted"
                  }`}
                />
                <div
                  className={`h-2 w-12 rounded animate-pulse ${
                    isTransparent ? "bg-gray-300/40" : "bg-muted/70"
                  }`}
                />
              </div>
            </div>
          ) : isAuthenticated && user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 px-3 hover:bg-transparent ${isTransparent ? "text-white hover:text-primary" : ""}`}
                >
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage
                      src={user.picture || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-primary">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="text-foreground focus:text-primary cursor-pointer"
                  onClick={() => router.push("/profile/profile")}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant={"outline"}
                className="bg-primary text-white hover:text-white hover:bg-primary/90 transition-all px-6 h-9"
                onClick={() => authModal.open("login")}
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileMenuButton({
  isTransparent,
  ariaLabel,
}: {
  isTransparent: boolean;
  ariaLabel: string;
}) {
  const context = useContext(MobileNavContext);

  if (!context) return null;

  return (
    <button
      onClick={context.toggle}
      className={`p-2 rounded-full transition-colors ${
        isTransparent
          ? "text-white hover:bg-white/10"
          : "text-foreground hover:bg-muted"
      } shrink-0`}
      aria-label={ariaLabel}
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
