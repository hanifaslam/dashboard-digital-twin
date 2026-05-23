"use client";

import { cn } from "@/lib/utils";
import { User, Monitor, Calendar, X } from "lucide-react";
import { useRoomShowQuery } from "@/hooks/api/digital-twin/use-room";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LecturerTab } from "./lecturer-tab";
import { DeviceTab } from "./device-tab";
import { ScheduleTab } from "./schedule-tab";
import React, { useState } from "react";
import { useAuthQuery } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

interface MarkerInfoCardProps {
  id: string;
  title: string;
  onClose: () => void;
  className?: string;
}

function MarkerInfoCardInternal({ id, title, onClose, className }: MarkerInfoCardProps) {
  const { data: room, isLoading: isLoadingRoom } = useRoomShowQuery(id);
  const [activeTab, setActiveTab] = useState("lecturer");
  const { data: user } = useAuthQuery();

  const hasDeviceControlAccess = user?.access?.some(
    (a) => a.code === "device_control",
  );
  const isLecturerRoom = room?.name?.toLowerCase().includes("dosen");

  const tabs = [
    { id: "lecturer", label: "Lecturer", icon: User },
    ...(hasDeviceControlAccess ? [{ id: "device", label: "Device", icon: Monitor }] : []),
    ...(!isLecturerRoom ? [{ id: "schedule", label: "Schedule", icon: Calendar }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "w-[420px] max-h-[85vh] glass-panel rounded-xl flex flex-col overflow-hidden relative",
        className
      )}
    >
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/30 via-cyan-400 to-cyan-500/30" />
      
      {/* Header */}
      <div className="flex flex-row items-start justify-between p-5 pb-4 border-b border-white/10 relative">
        <div className="flex flex-col z-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground glow-text">
            {isLoadingRoom ? (
              <Skeleton className="h-7 w-40 bg-white/10" />
            ) : (
              room?.name || title
            )}
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground/80 text-[11px] font-medium mt-1">
            {isLoadingRoom ? (
              <Skeleton className="h-4 w-56 bg-white/10" />
            ) : (
              <>
                <span className="text-foreground/90">{room?.floor || "Lantai -"}</span>
                <span className="text-foreground/40">•</span>
                <span className="text-foreground/90">{room?.building || "Gedung -"}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-foreground/70 hover:text-foreground transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Glow ambient effect behind header */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Tab Switcher */}
        <div className="w-full px-5 pt-3 pb-1 border-b border-white/5">
          <div className="flex gap-2 relative">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex-1 px-3 py-2 text-xs font-semibold transition-colors duration-200 flex items-center justify-center gap-2 rounded-md outline-none",
                    isActive ? "text-cyan-400 font-bold" : "text-white/50 hover:text-white/80"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-cyan-500/15 rounded-md border border-cyan-500/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full outline-none"
            >
              {activeTab === "lecturer" && <div className="h-full p-5 overflow-hidden"><LecturerTab roomId={id} /></div>}
              {activeTab === "device" && hasDeviceControlAccess && <div className="h-full p-5 overflow-hidden"><DeviceTab roomId={id} /></div>}
              {activeTab === "schedule" && !isLecturerRoom && <div className="h-full p-5 overflow-hidden"><ScheduleTab roomId={id} /></div>}
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
