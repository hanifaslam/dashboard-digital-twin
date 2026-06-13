"use client";

import { useState, useRef, useEffect } from "react";
import {
  Layers,
  Map as MapIcon,
  Moon,
  Sun,
  Mountain,
  Globe2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const MAP_STYLES = [
  {
    id: "auto",
    label: "Auto (Time)",
    icon: Clock,
    url: "auto",
  },
  {
    id: "streets",
    label: "Streets",
    icon: MapIcon,
    url: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "satellite",
    label: "Satellite",
    icon: Globe2,
    url: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  {
    id: "outdoors",
    label: "Terrain",
    icon: Mountain,
    url: "mapbox://styles/mapbox/outdoors-v12",
  },
  {
    id: "light",
    label: "Light",
    icon: Sun,
    url: "mapbox://styles/mapbox/light-v11",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    url: "mapbox://styles/mapbox/dark-v11",
  },
] as const;

export type MapStyleId = (typeof MAP_STYLES)[number]["id"];

interface MapStyleSelectorProps {
  currentStyleId: MapStyleId;
  onStyleSelect: (id: MapStyleId) => void;
}

export function MapStyleSelector({
  currentStyleId,
  onStyleSelect,
}: MapStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300 active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)]",
          isOpen
            ? "bg-cyan-900/40 border-cyan-500/40 text-cyan-300"
            : "bg-slate-950/60 border-cyan-500/20 text-cyan-400 hover:bg-slate-900/60 hover:border-cyan-500/40",
        )}
        title="Map Style"
      >
        <Layers className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 bottom-14 w-max grid grid-cols-2 gap-1.5 rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md origin-bottom-right"
          >
            {MAP_STYLES.map((style) => {
              const Icon = style.icon;
              const isActive = currentStyleId === style.id;

              return (
                <button
                  key={style.id}
                  onClick={() => {
                    onStyleSelect(style.id);
                    setIsOpen(false);
                  }}
                  title={style.label}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all select-none",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]"
                      : "bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 border border-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-cyan-400" : "text-white/80",
                    )}
                  />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
