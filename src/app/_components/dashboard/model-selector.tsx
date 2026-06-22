"use client";

import { Box, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MODELS = [
  { id: "/models/polines-main.glb", name: "Polines Main Test" },
  { id: "/models/polines-test.glb", name: "Polines Test" },
  { id: "/models/polines-main-fix.glb", name: "Polines Main" },
];

interface ModelSelectorProps {
  activeModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({
  activeModel,
  onModelChange,
}: ModelSelectorProps) {
  const activeModelLabel =
    MODELS.find((m) => m.id === activeModel)?.name ?? "Select model";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-11 items-center gap-2 rounded-xl border border-cyan-500/20 bg-slate-950/75 px-4 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(0,0,0,0.25)] backdrop-blur-lg transition-all hover:border-cyan-500/40 hover:bg-slate-900/80">
          <Box className="h-4 w-4 text-cyan-400" />
          <span>{activeModelLabel}</span>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-48 border border-cyan-500/20 bg-slate-950/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl z-50"
      >
        <DropdownMenuRadioGroup
          value={activeModel}
          onValueChange={onModelChange}
        >
          {MODELS.map((model) => (
            <DropdownMenuRadioItem
              key={model.id}
              value={model.id}
              className="cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-300"
            >
              {model.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
