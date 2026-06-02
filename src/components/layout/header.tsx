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
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Cpu,
  LogOut,
  Menu,
  RefreshCw,
  User,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { MobileNavContext } from "./mobile-nav";
import { useConfirm } from "../providers/confirm-provider";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { cn } from "@/lib/utils";
import { useDeviceLiveSummaryQuery } from "@/hooks/api/use-dashboard";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { dashboardQueryKeys } from "@/hooks/api/use-dashboard";
import type { DeviceLiveSummary } from "@/types/dashboard";

export function Header() {
  const pathname = usePathname();
  const authModal = useAuthModal();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { data: deviceLiveSummary } = useDeviceLiveSummaryQuery();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleDeviceLiveSummary = (payload: DeviceLiveSummary) => {
      queryClient.setQueryData(dashboardQueryKeys.deviceLiveSummary(), payload);
    };

    socket.on("device-live-summary:update", handleDeviceLiveSummary);

    return () => {
      socket.off("device-live-summary:update", handleDeviceLiveSummary);
    };
  }, [queryClient]);

  const isTransparent = pathname === "/" && !isScrolled;

  const headerClass =
    "fixed top-0 left-0 right-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/15 shadow-[0_4px_30px_rgba(0,0,0,0.4),0_0_15px_rgba(6,182,212,0.03)] transition-all duration-300 pr-[var(--removed-body-scroll-bar-size,0px)]";

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
            className="relative h-14 w-14 hover:opacity-80 transition-opacity"
            draggable={false}
          >
            <Image
              src="/logo.png"
              alt="Dashboard"
              fill
              className="object-contain object-left"
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              draggable={false}
            />
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2">
            <SystemStatusPill
              icon={Cpu}
              label="Active Devices"
              value={`${deviceLiveSummary?.active_devices ?? 0}`}
              accentClassName="text-cyan-400"
            />
            <SystemStatusPill
              icon={Wifi}
              label="Latency"
              value={deviceLiveSummary?.latency ?? "-"}
              accentClassName="text-cyan-400"
            />
            <SystemStatusPill
              icon={RefreshCw}
              label="Last Sync"
              value={deviceLiveSummary?.last_sync ?? "-"}
              accentClassName="text-emerald-400"
            />
          </div>

          <div className="hidden xl:block h-8 w-px bg-cyan-500/20" />

          {isLoading ? (
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full animate-pulse ${
                  isTransparent ? "bg-cyan-500/20" : "bg-muted"
                }`}
              />
              <div className="flex flex-col gap-1">
                <div
                  className={`h-3 w-16 rounded animate-pulse ${
                    isTransparent ? "bg-cyan-500/20" : "bg-muted"
                  }`}
                />
                <div
                  className={`h-2 w-12 rounded animate-pulse ${
                    isTransparent ? "bg-cyan-500/10" : "bg-muted/70"
                  }`}
                />
              </div>
            </div>
          ) : isAuthenticated && user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2.5 pl-2.5 pr-4 h-10 hover:bg-cyan-500/10 bg-slate-950/60 backdrop-blur-md rounded-lg text-cyan-400 transition-all duration-300"
                >
                  <Avatar
                    className={cn(
                      "h-8 w-8",
                      !user.profile_picture
                        ? "border border-cyan-500/30"
                        : "border-none after:hidden",
                    )}
                  >
                    <AvatarImage
                      src={user.profile_picture || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-cyan-500/10">
                      <User className="h-4 w-4 text-cyan-400" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-slate-100 hover:text-white transition-colors text-xs">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-cyan-400/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-slate-950/90 backdrop-blur-md border border-cyan-500/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              >
                {/* <DropdownMenuItem
                  className="text-xs hover:bg-cyan-500/10 focus:bg-cyan-500/10 focus:text-cyan-400 cursor-pointer font-medium"
                  onClick={() => router.push("/profile/profile")}
                >
                  <UserIcon className="h-4 w-4 mr-2 text-cyan-400" />
                  Profile
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs font-medium"
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
                className="h-9 border border-cyan-500/20 bg-slate-950/60 px-6 text-xs font-semibold text-white transition-all hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-white"
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

function SystemStatusPill({
  icon: Icon,
  label,
  value,
  accentClassName,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  accentClassName?: string;
}) {
  return (
    <div className="flex h-10 items-center gap-2 rounded-lg border border-cyan-500/15 bg-slate-950/60 px-3 backdrop-blur-md">
      <Icon className={cn("h-3.5 w-3.5", accentClassName)} />
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-medium text-white/55">{label}</span>
        <span className="mt-1 text-[11px] font-semibold text-white">
          {value}
        </span>
      </div>
    </div>
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
