"use client";

import { Building2, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BuildingId } from "./dashboard-config";
import { BUILDINGS } from "./dashboard-config";

interface BuildingSelectorProps {
  selectedBuilding: BuildingId;
  onSelect: (buildingId: BuildingId) => void;
}

export function BuildingSelector({
  selectedBuilding,
  onSelect,
}: BuildingSelectorProps) {
  const activeBuildingLabel =
    BUILDINGS.find((building) => building.id === selectedBuilding)?.label ??
    "Gedung SB";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-11 items-center gap-2 rounded-xl border border-cyan-500/20 bg-slate-950/75 px-4 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(0,0,0,0.25)] backdrop-blur-lg transition-all hover:border-cyan-500/40 hover:bg-slate-900/80">
          <Building2 className="h-4 w-4 text-cyan-400" />
          <span>{activeBuildingLabel}</span>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-48 border border-cyan-500/20 bg-slate-950/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <DropdownMenuRadioGroup
          value={selectedBuilding}
          onValueChange={(value) => onSelect(value as BuildingId)}
        >
          {BUILDINGS.map((building) => (
            <DropdownMenuRadioItem
              key={building.id}
              value={building.id}
              className="cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-300"
            >
              {building.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
