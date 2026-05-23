"use client";

import React, { useState } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Monitor, User, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useRoomShowQuery } from "@/hooks/api/digital-twin/use-room";
import { useAuthQuery } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { DeviceTab } from "./device-tab";
import { LecturerTab } from "./lecturer-tab";
import { ScheduleTab } from "./schedule-tab";

interface MarkerInfoCardProps {
  id: string;
  title: string;
  onClose: () => void;
  className?: string;
}

function MarkerInfoCardInternal({
  id,
  title,
  onClose,
  className,
}: MarkerInfoCardProps) {
  const { data: room, isLoading: isLoadingRoom } = useRoomShowQuery(id);
  const { data: user } = useAuthQuery();
  const [activeTab, setActiveTab] = useState("lecturer");

  const hasDeviceControlAccess = user?.access?.some(
    (access) => access.code === "device_control",
  );
  const isLecturerRoom = room?.name?.toLowerCase().includes("dosen");

  const tabs = [
    { id: "lecturer", label: "Lecturer", icon: User },
    ...(hasDeviceControlAccess
      ? [{ id: "device", label: "Device", icon: Monitor }]
      : []),
    ...(!isLecturerRoom
      ? [{ id: "schedule", label: "Schedule", icon: Calendar }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "glass-panel relative flex max-h-[85vh] w-[420px] flex-col overflow-hidden rounded-xl",
        className,
      )}
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-500/30 via-cyan-400 to-cyan-500/30" />

      <div className="relative flex flex-row items-start justify-between border-b border-white/10 p-5 pb-4">
        <div className="z-10 flex flex-col">
          <h2 className="glow-text text-xl font-bold tracking-tight text-foreground">
            {isLoadingRoom ? (
              <Skeleton className="h-7 w-40 bg-white/10" />
            ) : (
              room?.name || title
            )}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-muted-foreground/80">
            {isLoadingRoom ? (
              <Skeleton className="h-4 w-56 bg-white/10" />
            ) : (
              <>
                <span className="text-foreground/90">
                  {room?.floor || "Lantai -"}
                </span>
                <span className="text-foreground/40">•</span>
                <span className="text-foreground/90">
                  {room?.building || "Gedung -"}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="z-10 rounded-full p-1.5 text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="w-full border-b border-white/5 px-5 pb-1 pt-3">
          <div className="relative flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold outline-none transition-colors duration-200",
                    isActive
                      ? "font-bold text-cyan-400"
                      : "text-white/50 hover:text-white/80",
                  )}
                >
                  {isActive ? (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 rounded-md border border-cyan-500/25 bg-cyan-500/15"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  ) : null}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full outline-none"
            >
              {activeTab === "lecturer" ? (
                <div className="h-full overflow-hidden p-5">
                  <LecturerTab roomId={id} />
                </div>
              ) : null}
              {activeTab === "device" && hasDeviceControlAccess ? (
                <div className="h-full overflow-hidden p-5">
                  <DeviceTab roomId={id} />
                </div>
              ) : null}
              {activeTab === "schedule" && !isLecturerRoom ? (
                <div className="h-full overflow-hidden p-5">
                  <ScheduleTab roomId={id} />
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function MarkerInfoCard(props: MarkerInfoCardProps) {
  const queryClient = useQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MarkerInfoCardInternal {...props} />
    </QueryClientProvider>
  );
}
