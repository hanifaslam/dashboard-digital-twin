"use client";

import React, { useMemo } from "react";
import { Maximize2, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import CCTVPlayer from "@/components/common/CCTVPlayer";
import { useCCTVStreamsQuery } from "@/hooks/api/digital-twin/use-device";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface CctvCardProps {
  id: string;
  title: string;
  buildingName?: string;
  onClose: () => void;
  className?: string;
}

export function CctvCard({
  title,
  buildingName,
  onClose,
  className,
}: CctvCardProps) {
  const { data: cctvStreams = [], isLoading } = useCCTVStreamsQuery();

  const activeStream = useMemo(() => {
    if (cctvStreams.length === 0) return null;
    return (
      cctvStreams.find(
        (s) =>
          s.name.toLowerCase() === title.toLowerCase() ||
          s.room_name?.toLowerCase() === title.toLowerCase(),
      ) || cctvStreams[0]
    );
  }, [cctvStreams, title]);

  const streamKey = activeStream?.stream_url ?? "";
  const locationLabel = activeStream?.name ?? title ?? "CCTV Stream";
  const buildingLabel =
    buildingName ?? activeStream?.room_name ?? "Gedung Utama";

  return (
    <div
      className={cn(
        "glass-panel relative flex h-auto w-full flex-col overflow-hidden rounded-xl bg-slate-950/90 text-white",
        className,
      )}
    >
      {/* Header */}
      <div className="relative flex items-start justify-between border-b border-white/10 p-5 pb-4">
        <div className="z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-bold tracking-tight text-white">
              {isLoading ? "Loading CCTV..." : locationLabel}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>{buildingLabel}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="z-10 rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-5 overflow-y-auto custom-scrollbar">
        {/* Video Stream Container */}
        <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-cyan-500/20 bg-slate-900 shadow-lg">
          {streamKey ? (
            <CCTVPlayer
              key={`cctv-card-${streamKey}`}
              streamKey={streamKey}
              className="absolute inset-0 h-full w-full object-cover"
              controls={false}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-xs text-white/50">
              <Video className="h-8 w-8 text-cyan-500/40" />
              <span>No active stream feed</span>
            </div>
          )}

          {streamKey && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="absolute right-2 top-2 z-10 flex items-center justify-center rounded bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/80">
                  <Maximize2 className="h-3 w-3" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-5xl w-[95vw] border-0 bg-transparent p-0 shadow-none [&>button]:z-50 [&>button]:text-white [&>button]:bg-black/60 [&>button]:hover:bg-black/80 [&>button]:top-4 [&>button]:right-4 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:backdrop-blur-sm">
                <DialogTitle className="sr-only">
                  Live CCTV {locationLabel}
                </DialogTitle>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-black shadow-2xl">
                  <CCTVPlayer
                    key={`modal-${streamKey}`}
                    streamKey={streamKey}
                    className="absolute inset-0 h-full w-full object-cover"
                    controls={true}
                  />
                  <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md border border-white/10">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span>{locationLabel}</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
