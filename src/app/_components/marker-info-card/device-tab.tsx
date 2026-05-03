"use client";

import { Monitor } from "lucide-react";

export function DeviceTab() {
  return (
    <div className="mt-0 w-full">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-muted/30 p-5 rounded-full mb-5">
          <Monitor className="h-10 w-10 text-muted-foreground/20" />
        </div>
        <p className="text-base text-muted-foreground font-semibold">
          No available devices
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2 max-w-[250px] leading-relaxed">
          Sistem monitoring perangkat sedang dalam pengembangan tahap awal
        </p>
      </div>
    </div>
  );
}
