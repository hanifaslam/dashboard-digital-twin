"use client";

import { Monitor } from "lucide-react";

export function DeviceTab() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center mb-3 flex-none">
        <span className="text-sm font-semibold text-foreground">
          Devices in Room
        </span>
      </div>

      <div className="h-[30vh] w-full flex flex-col items-center justify-center text-center">
        <Monitor className="h-10 w-10 text-muted-foreground/40 mb-4" />
        <p className="text-xs text-muted-foreground">No devices in this room</p>
      </div>
    </div>
  );
}
