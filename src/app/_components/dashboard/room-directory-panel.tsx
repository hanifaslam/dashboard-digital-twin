"use client";

import { Activity, Search, X } from "lucide-react";
import { type ChangeEvent, useEffect } from "react";

import type { Marker } from "@/components/three/scene-viewer";
import { cn } from "@/lib/utils";
import { type RoomFilterId, ROOM_FILTERS } from "./dashboard-config";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface RoomDirectoryPanelProps {
  buildingLabel: string;
  markers: Marker[];
  selectedRoomId: string | null;
  searchQuery: string;
  activeFilter: RoomFilterId;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onFilterChange: (value: RoomFilterId) => void;
  onRoomSelect: (roomId: string) => void;
}

export function RoomDirectoryPanel({
  buildingLabel,
  markers,
  selectedRoomId,
  searchQuery,
  activeFilter,
  onSearchChange,
  onClearSearch,
  onFilterChange,
  onRoomSelect,
}: RoomDirectoryPanelProps) {
  useEffect(() => {
    if (selectedRoomId) {
      const element = document.getElementById(`room-button-${selectedRoomId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedRoomId]);

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "tech-card w-80 rounded-xl border border-cyan-500/20 bg-slate-950/75 p-4 backdrop-blur-lg flex flex-col overflow-hidden transition-all duration-500 ease-in-out",
        isExpanded ? "flex-1 min-h-0" : "flex-none",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-cyan-500/20 transition-all duration-500",
          isExpanded ? "border-b pb-2" : "pb-0",
        )}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              Room Directory
            </span>
            <span className="text-[10px] text-white/50">{buildingLabel}</span>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/50 hover:text-white transition-colors shrink-0"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              !isExpanded && "rotate-180",
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          isExpanded
            ? "grid-rows-[1fr] opacity-100 flex-1 mt-4 min-h-0"
            : "grid-rows-[0fr] opacity-0 flex-none mt-0 pointer-events-none",
        )}
      >
        <div className="overflow-hidden flex flex-col min-h-0 gap-4">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyan-400/50" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onSearchChange(e.target.value)
              }
              className="w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/35 transition-colors focus:border-cyan-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/50 hover:text-cyan-400"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-1 shrink-0">
            {ROOM_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  "rounded py-1 text-[10px] font-semibold transition-all",
                  activeFilter === filter.id
                    ? "border border-cyan-400 bg-cyan-500/20 text-white shadow-[inset_0_0_8px_rgba(6,182,212,0.2)]"
                    : "border border-cyan-500/10 bg-slate-900/40 text-white/60 hover:text-white",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar -mr-3 pr-3">
            <div className="flex flex-col gap-2">
              {markers.length ? (
                markers.map((marker) => {
                  const isActive = selectedRoomId === marker.id;

                  return (
                    <button
                      key={marker.id}
                      id={`room-button-${marker.id}`}
                      onClick={() => onRoomSelect(marker.id)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-2.5 text-left transition-all duration-300",
                        isActive
                          ? "border-cyan-400 bg-cyan-500/15 text-white shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                          : "border-cyan-500/10 bg-slate-900/40 text-white/85 hover:border-cyan-500/30 hover:bg-slate-900/80",
                      )}
                    >
                      <span className="text-[11px] font-semibold">
                        {marker.label}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[10px] text-cyan-500/30">
                  No assets detected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
