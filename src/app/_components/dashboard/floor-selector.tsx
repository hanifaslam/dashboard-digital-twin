"use client";

import { Layers, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FloorSelectorProps {
  floors: number[];
  activeFloor: number;
  onSelect: (floor: number) => void;
}

export function FloorSelector({
  floors,
  activeFloor,
  onSelect,
}: FloorSelectorProps) {
  const activeLabel = `Lantai ${activeFloor}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-11 items-center gap-2 rounded-xl border border-cyan-500/20 bg-slate-950/75 px-4 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(0,0,0,0.25)] backdrop-blur-lg transition-all hover:border-cyan-500/40 hover:bg-slate-900/80">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span>{activeLabel}</span>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="min-w-[130px] border border-cyan-500/20 bg-slate-950/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <DropdownMenuRadioGroup
          value={activeFloor.toString()}
          onValueChange={(val) => onSelect(parseInt(val))}
        >
          {floors.map((floor) => (
            <DropdownMenuRadioItem
              key={floor}
              value={floor.toString()}
              className="cursor-pointer text-sm focus:bg-cyan-500/10 focus:text-cyan-300"
            >
              Lantai {floor}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
