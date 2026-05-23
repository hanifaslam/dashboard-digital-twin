"use client";

import SceneViewer, { Marker } from "@/components/three/scene-viewer";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Activity,
  Zap,
  Layers,
  X,
  FileText,
  Building2,
  ChevronDown,
} from "lucide-react";
import { MarkerInfoCard } from "@/app/_components/marker-info-card";
import { WeatherSummaryCard } from "@/app/_components/weather-summary-card";
import { SystemClock } from "@/components/layout/system-clock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Home() {
  const buildings = [
    { id: "gedung-sb", label: "Gedung SB" },
    { id: "gedung-a", label: "Gedung A" },
    { id: "gedung-c", label: "Gedung C" },
  ] as const;
  const [markers] = useState<Marker[]>([
    {
      id: "cmoa65k7h0000xcbcu6nbkt9o",
      position: [1.19, -1.5, -4.25],
      label: "Ruang Dosen IK",
      type: "dosen",
    },
    {
      id: "cmnb91gab000tmsbc9vp9itjb",
      position: [1.19, -1.5, 3.24],
      label: "Room 1.1",
      type: "lab",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<
    (typeof buildings)[number]["id"]
  >("gedung-sb");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "DOSEN" | "LAB">(
    "ALL",
  );
  const [powerLoadHistory, setPowerLoadHistory] = useState<number[]>([
    180, 195, 172, 210, 245, 230, 205, 215, 240, 225,
  ]);
  const [eventLogs, setEventLogs] = useState<string[]>([
    "SYS: Core Digital Twin engine initialized successfully.",
    "NET: Secured connection to IoT gateway established on port 8443.",
    "DB: Room records & structural coordinates synchronized.",
    "IOT: Direct telemetry stream link optimized, latency 12ms.",
  ]);

  // Simulate realtime power load tick
  useEffect(() => {
    const timer = setInterval(() => {
      const currentLoad = Math.floor(160 + Math.random() * 90);
      setPowerLoadHistory((prev) => [...prev.slice(1), currentLoad]);

      // Simulate live logs appending
      const logTemplates = [
        `TELEMETRY: Power load updated to ${currentLoad}W - status normal.`,
        "SYS: Room 1.1 environment telemetry verified (24.2°C).",
        "IOT: Sensor node beacon pinged - response 100% OK.",
        "PRESENCE: Lecturer availability map synchronized with DB.",
        "SYS: Calibrating active marker coordinate references...",
        "NET: MQTT packet exchange confirmed - 0% loss.",
      ];
      const randomLog =
        logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
      setEventLogs((prev) => [
        `[${timeStr}] ${randomLog}`,
        ...prev.slice(0, 15),
      ]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      const matchesSearch = marker.label
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === "DOSEN") {
        return marker.label.toLowerCase().includes("dosen");
      }
      if (activeFilter === "LAB") {
        return (
          marker.label.toLowerCase().includes("room") ||
          marker.label.toLowerCase().includes("lab")
        );
      }
      return true;
    });
  }, [markers, searchQuery, activeFilter]);

  const currentPower = powerLoadHistory[powerLoadHistory.length - 1];
  const activeBuildingLabel =
    buildings.find((building) => building.id === selectedBuilding)?.label ??
    "Gedung SB";

  // SVG Sparkline Chart calculations
  const chartPoints = useMemo(() => {
    const width = 300;
    const height = 80;
    const maxVal = Math.max(...powerLoadHistory, 280);
    const minVal = Math.min(...powerLoadHistory, 120);
    const range = maxVal - minVal;

    return powerLoadHistory
      .map((val, i) => {
        const x = (i / (powerLoadHistory.length - 1)) * width;
        const y = height - ((val - minVal) / range) * (height - 10) - 5;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [powerLoadHistory]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId === selectedRoomId ? null : roomId);
  };

  return (
    <main className="relative w-full h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] overflow-hidden bg-slate-950 mt-16 lg:mt-20">
      {/* HUD Scanline Grid Background */}
      <div className="absolute inset-0 z-10 pointer-events-none tech-grid-overlay opacity-30" />
      <div className="absolute inset-0 z-10 pointer-events-none tech-scanline opacity-10" />

      {/* 3D Scene Viewer */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <SceneViewer
          modelUrl="/models/polines-test.glb"
          markers={markers}
          selectedRoomId={selectedRoomId}
          onMarkerClick={(marker) => setSelectedRoomId(marker.id)}
        />
      </div>

      <div className="absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 lg:block">
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
              onValueChange={(value) => {
                setSelectedBuilding(
                  value as (typeof buildings)[number]["id"],
                );
                setSelectedRoomId(null);
              }}
            >
              {buildings.map((building) => (
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
      </div>

      {/* LEFT SIDEBAR: Telemetry & Search Panel */}
      <div className="absolute left-4 top-4 z-20 max-h-[85%] flex flex-col gap-4 overflow-hidden pointer-events-auto">
        <div className="hidden lg:grid lg:grid-cols-[20rem_max-content] lg:gap-4">
          <div className="w-80">
            <WeatherSummaryCard />
          </div>
          <div>
            <SystemClock className="w-fit" />
          </div>
        </div>

        <div className="w-80 tech-card rounded-xl p-4 flex flex-col gap-4 bg-slate-950/75 border border-cyan-500/20 backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-white">
                Room Directory
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-400/50" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-cyan-500/20 rounded-lg text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/50 hover:text-cyan-400"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "DOSEN", label: "Lecturer Room" },
                { id: "LAB", label: "Class Room" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "py-1 rounded text-[10px] font-semibold border transition-all",
                  activeFilter === filter.id
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[inset_0_0_8px_rgba(6,182,212,0.2)]"
                    : "bg-slate-900/40 border-cyan-500/10 text-white/60 hover:text-white",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Room List Container */}
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {filteredMarkers.length > 0 ? (
              filteredMarkers.map((marker) => {
                const isActive = selectedRoomId === marker.id;
                return (
                  <button
                    key={marker.id}
                    onClick={() => handleRoomSelect(marker.id)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border text-left transition-all duration-300",
                      isActive
                        ? "bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                        : "bg-slate-900/40 border-cyan-500/10 text-white/85 hover:bg-slate-900/80 hover:border-cyan-500/30",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Layers
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive
                            ? "text-cyan-400 animate-pulse"
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
              <div className="py-8 text-center text-cyan-500/30 text-[10px]">
                No assets detected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Live Power Load Area Sparkline Chart */}
      <div
        className={cn(
          "absolute right-4 top-4 z-20 flex flex-col gap-4 pointer-events-auto transition-all duration-300",
          selectedRoomId ? "w-[380px]" : "w-80",
        )}
      >
        <div className="tech-card rounded-xl p-4 flex flex-col gap-4 bg-slate-950/75 border border-cyan-500/20 backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">
                  Energy Monitoring
                </span>
                <span className="text-[10px] font-medium text-white/45">
                  {activeBuildingLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-white tracking-tight drop-shadow-[0_0_6px_rgba(255,255,255,0.08)]">
                {currentPower}{" "}
                <span className="text-xs text-white/85 font-bold">W</span>
              </span>
              <span className="text-[9px] font-medium text-white/60 mt-0.5">
                Current active demand
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                ▲ +4.2%
              </span>
              <span className="text-[8px] font-medium text-cyan-500/40">
                vs 1h average
              </span>
            </div>
          </div>

          {/* SVG Sparkline Sparking Grid Chart */}
          <div className="relative w-full h-[90px] border border-cyan-500/10 rounded-lg bg-slate-950/40 overflow-hidden flex items-end">
            <div className="absolute inset-0 pointer-events-none bg-size-[10px_10px] bg-image-[linear-gradient(to_right,rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.02)_1px,transparent_1px)]" />
            <svg
              className="w-full h-full"
              viewBox="0 0 300 80"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="oklch(0.72 0.17 195)"
                    stopOpacity="0.45"
                  />
                  <stop
                    offset="100%"
                    stopColor="oklch(0.72 0.17 195)"
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>
              {/* Fill Area */}
              <path
                d={`M 0,80 L ${chartPoints} L 300,80 Z`}
                fill="url(#chartGlow)"
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke="oklch(0.72 0.17 195)"
                strokeWidth="2.5"
                points={chartPoints}
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              />
            </svg>
            <div className="absolute bottom-1 right-2 text-[8px] font-medium text-cyan-500/35">
              Time Window: 40s
            </div>
          </div>
        </div>

        {/* Selected Room Overlay Panel (when a room is selected, display details floating in right HUD!) */}
        {selectedRoomId && (
          <div className="tech-card rounded-xl p-0 overflow-hidden bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl animate-in slide-in-from-right duration-350 shadow-[0_0_30px_rgba(6,182,212,0.25)] h-[calc(100vh-380px)] flex flex-col">
            <MarkerInfoCard
              id={selectedRoomId}
              title={
                markers.find((m) => m.id === selectedRoomId)?.label ||
                "Asset Room"
              }
              onClose={() => setSelectedRoomId(null)}
              className="border-none bg-transparent shadow-none w-full h-full"
            />
          </div>
        )}
      </div>

      {/* BOTTOM WIDGET: Realtime Command Center Log Feeds */}
      <div className="absolute left-4 right-4 bottom-4 z-20 pointer-events-auto">
        <div className="tech-card rounded-xl p-3 bg-slate-950/80 border border-cyan-500/15 backdrop-blur-lg flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0 border-r border-cyan-500/20 pr-4">
            <FileText className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-400">
              Live Activity Log
            </span>
          </div>

          {/* Scrolling Terminal Logs */}
          <div className="flex-1 overflow-hidden h-5 relative">
            <div className="absolute inset-0 flex flex-col gap-1 text-[10px] text-cyan-100/90 leading-tight">
              {eventLogs.slice(0, 1).map((log, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 animate-in slide-in-from-bottom-[8px] duration-300"
                >
                  <span className="text-cyan-400 font-extrabold select-none">
                    ▶
                  </span>
                  <span className="select-all">{log}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-[9px] text-cyan-500/50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>Gateway connected</span>
          </div>
        </div>
      </div>
    </main>
  );
}
