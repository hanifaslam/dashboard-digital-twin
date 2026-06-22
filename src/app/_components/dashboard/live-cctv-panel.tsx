"use client";

import { ChevronDown, Maximize2, Loader2 } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import CCTVPlayer from "@/components/common/CCTVPlayer";
import { useCCTVStreamsQuery } from "@/hooks/api/digital-twin/use-device";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

export function LiveCctvPanel() {
  const { data: cctvStreams = [], isLoading } = useCCTVStreamsQuery();
  const [selectedStreamId, setSelectedStreamId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const activeStreamId =
    selectedStreamId || (cctvStreams.length > 0 ? cctvStreams[0].id : "");

  const selectedStream =
    cctvStreams.find((s) => s.id === activeStreamId) || cctvStreams[0];
  const locationLabel = selectedStream?.name ?? "No CCTV";
  const streamKey = selectedStream?.stream_url ?? "";

  return (
    <div
      className={cn(
        "tech-card flex w-80 flex-col rounded-xl border border-cyan-500/20 bg-slate-950/75 p-4 backdrop-blur-lg transition-all duration-300",
        isExpanded ? "gap-3" : "shrink-0",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold ">Live CCTV</span>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-7 w-[130px] items-center justify-between gap-2 rounded-lg border border-cyan-500/20 bg-transparent px-2.5 text-xs text-white transition-all hover:border-cyan-500/40 hover:bg-slate-900/50"
                disabled={isLoading || cctvStreams.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="truncate">{locationLabel}</span>
                )}
                <ChevronDown className="h-3 w-3 shrink-0 text-white/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[130px] border border-cyan-500/20 bg-slate-950/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <DropdownMenuRadioGroup
                value={activeStreamId}
                onValueChange={setSelectedStreamId}
              >
                {cctvStreams.map((stream) => (
                  <DropdownMenuRadioItem
                    key={stream.id}
                    value={stream.id}
                    className="cursor-pointer text-xs focus:bg-cyan-500/10 focus:text-cyan-300"
                  >
                    {stream.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-md p-1 ml-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                !isExpanded && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-cyan-500/20 bg-slate-900 mt-1">
              {streamKey ? (
                <CCTVPlayer
                  key={`preview-${streamKey}`}
                  streamKey={streamKey}
                  className="absolute inset-0 h-full w-full object-cover"
                  controls={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50">
                  No stream available
                </div>
              )}

              {streamKey && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="absolute right-2 top-2 z-10 flex items-center justify-center rounded bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/80">
                      <Maximize2 className="h-3 w-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-5xl w-[95vw] border-0 bg-transparent p-0 shadow-none [&>button]:text-white">
                    <DialogTitle className="sr-only">
                      Live CCTV {locationLabel}
                    </DialogTitle>
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-black shadow-2xl">
                      <CCTVPlayer
                        key={`modal-${streamKey}`}
                        streamKey={streamKey}
                        className="absolute inset-0 h-full w-full object-cover"
                        controls={false}
                      />
                      <div className="absolute left-4 top-10 z-10 flex items-center rounded bg-black/60 px-2 py-1 text-base font-medium text-white backdrop-blur-sm">
                        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        {locationLabel}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
