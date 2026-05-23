"use client";

import { Activity, Layers, Search, X } from "lucide-react";
import type { ChangeEvent } from "react";

import type { Marker } from "@/components/three/scene-viewer";
import { cn } from "@/lib/utils";
import type { RoomFilterId } from "./dashboard-config";
import { ROOM_FILTERS } from "./dashboard-config";
import { PanelShell } from "./panel-shell";

interface RoomDirectoryPanelProps {
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
  markers,
  selectedRoomId,
  searchQuery,
  activeFilter,
  onSearchChange,
  onClearSearch,
  onFilterChange,
  onRoomSelect,
}: RoomDirectoryPanelProps) {
  return (
    <PanelShell title="Room Directory" icon={Activity} className="w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyan-400/50" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onSearchChange(event.target.value)
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

      <div className="grid grid-cols-3 gap-1">
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

      <div className="flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-1">
        {markers.length ? (
          markers.map((marker) => {
            const isActive = selectedRoomId === marker.id;

            return (
              <button
                key={marker.id}
                onClick={() => onRoomSelect(marker.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-2.5 text-left transition-all duration-300",
                  isActive
                    ? "border-cyan-400 bg-cyan-500/15 text-white shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                    : "border-cyan-500/10 bg-slate-900/40 text-white/85 hover:border-cyan-500/30 hover:bg-slate-900/80",
                )}
              >
                <div className="flex items-center gap-2">
                  <Layers
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive
                        ? "animate-pulse text-cyan-400"
                        : "text-cyan-500/60",
                    )}
                  />
                  <span className="text-[11px] font-semibold">
                    {marker.label}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-8 text-center text-[10px] text-cyan-500/30">
            No assets detected
          </div>
        )}
      </div>
    </PanelShell>
  );
}
