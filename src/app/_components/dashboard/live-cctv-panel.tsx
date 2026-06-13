"use client";

import { Video, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LiveCctvPanel() {
  const [location, setLocation] = useState("tugu-teknik");
  const [currentTime, setCurrentTime] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toISOString().replace("T", " ").substring(0, 19),
      );
    };

    const timeout = setTimeout(updateTime, 0);
    const interval = setInterval(updateTime, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const getLocationLabel = (loc: string) => {
    switch (loc) {
      case "lorong-sa":
        return "Lorong SA";
      case "lorong-sb":
        return "Lorong SB";
      default:
        return "Lorong SB";
    }
  };

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
              <button className="flex h-7 w-[130px] items-center justify-between gap-2 rounded-lg border border-cyan-500/20 bg-transparent px-2.5 text-xs text-white transition-all hover:border-cyan-500/40 hover:bg-slate-900/50">
                <span className="truncate">{getLocationLabel(location)}</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-white/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[130px] border border-cyan-500/20 bg-slate-950/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <DropdownMenuRadioGroup
                value={location}
                onValueChange={setLocation}
              >
                <DropdownMenuRadioItem
                  value="lorong-sa"
                  className="cursor-pointer text-xs focus:bg-cyan-500/10 focus:text-cyan-300"
                >
                  Lorong SA
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="lorong-sb"
                  className="cursor-pointer text-xs focus:bg-cyan-500/10 focus:text-cyan-300"
                >
                  Lorong SB
                </DropdownMenuRadioItem>
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
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-cyan-500/20 bg-slate-900 mt-1">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80">
                <Video className="mb-2 h-6 w-6 text-cyan-500/50" />
                <span className="text-xs text-cyan-500/50">Camera offline</span>
              </div>

              <div className="absolute left-2 top-2 z-10 flex items-center rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                {currentTime} | {getLocationLabel(location)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
