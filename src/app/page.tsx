"use client";

import { useEffect, useMemo, useState } from "react";

import { MarkerInfoCard } from "@/app/_components/marker-info-card";
import { ActivityLogBar } from "@/app/_components/dashboard/activity-log-bar";
import { BuildingSelector } from "@/app/_components/dashboard/building-selector";
import {
  BUILDINGS,
  INITIAL_EVENT_LOGS,
  INITIAL_MARKERS,
  INITIAL_POWER_LOAD_HISTORY,
  type BuildingId,
  type RoomFilterId,
} from "@/app/_components/dashboard/dashboard-config";
import { EnergyMonitoringCard } from "@/app/_components/dashboard/energy-monitoring-card";
import { RoomDirectoryPanel } from "@/app/_components/dashboard/room-directory-panel";
import { buildSparklinePoints, createRealtimeTick } from "@/app/_components/dashboard/dashboard-utils";
import { WeatherSummaryCard } from "@/app/_components/weather-summary-card";
import { SystemClock } from "@/components/layout/system-clock";
import SceneViewer from "@/components/three/scene-viewer";
import { cn } from "@/lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingId>("gedung-sb");
  const [activeFilter, setActiveFilter] = useState<RoomFilterId>("ALL");
  const [powerLoadHistory, setPowerLoadHistory] = useState<number[]>(
    INITIAL_POWER_LOAD_HISTORY,
  );
  const [eventLogs, setEventLogs] = useState<string[]>(INITIAL_EVENT_LOGS);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const { currentLoad, log } = createRealtimeTick();

      setPowerLoadHistory((previousHistory) => [
        ...previousHistory.slice(1),
        currentLoad,
      ]);
      setEventLogs((previousLogs) => [log, ...previousLogs.slice(0, 15)]);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const filteredMarkers = useMemo(() => {
    return INITIAL_MARKERS.filter((marker) => {
      const matchesSearch = marker.label
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

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
  }, [activeFilter, searchQuery]);

  const currentPower = powerLoadHistory[powerLoadHistory.length - 1];
  const activeBuildingLabel =
    BUILDINGS.find((building) => building.id === selectedBuilding)?.label ??
    "Gedung SB";
  const chartPoints = useMemo(
    () => buildSparklinePoints(powerLoadHistory),
    [powerLoadHistory],
  );

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId((currentRoomId) =>
      currentRoomId === roomId ? null : roomId,
    );
  };

  const handleBuildingChange = (buildingId: BuildingId) => {
    setSelectedBuilding(buildingId);
    setSelectedRoomId(null);
  };

  return (
    <main className="relative mt-16 h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-950 lg:mt-20 lg:h-[calc(100vh-80px)]">
      <div className="tech-grid-overlay pointer-events-none absolute inset-0 z-10 opacity-30" />
      <div className="tech-scanline pointer-events-none absolute inset-0 z-10 opacity-10" />

      <div className="absolute inset-0 z-0 bg-slate-950">
        <SceneViewer
          modelUrl="/models/polines-test.glb"
          markers={INITIAL_MARKERS}
          selectedRoomId={selectedRoomId}
          onMarkerClick={(marker) => setSelectedRoomId(marker.id)}
        />
      </div>

      <div className="absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 lg:block">
        <BuildingSelector
          selectedBuilding={selectedBuilding}
          onSelect={handleBuildingChange}
        />
      </div>

      <div className="pointer-events-auto absolute left-4 top-4 z-20 flex max-h-[85%] flex-col gap-4 overflow-hidden">
        <div className="hidden lg:grid lg:grid-cols-[20rem_max-content] lg:gap-4">
          <div className="w-80">
            <WeatherSummaryCard />
          </div>
          <div>
            <SystemClock className="w-fit" />
          </div>
        </div>

        <RoomDirectoryPanel
          markers={filteredMarkers}
          selectedRoomId={selectedRoomId}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          onFilterChange={setActiveFilter}
          onRoomSelect={handleRoomSelect}
        />
      </div>

      <div
        className={cn(
          "pointer-events-auto absolute right-4 top-4 z-20 flex flex-col gap-4 transition-all duration-300",
          selectedRoomId ? "w-[380px]" : "w-80",
        )}
      >
        <EnergyMonitoringCard
          buildingLabel={activeBuildingLabel}
          currentPower={currentPower}
          chartPoints={chartPoints}
        />

        {selectedRoomId ? (
          <div className="tech-card flex h-[calc(100vh-380px)] flex-col overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/90 p-0 shadow-[0_0_30px_rgba(6,182,212,0.25)] backdrop-blur-xl animate-in slide-in-from-right duration-350">
            <MarkerInfoCard
              id={selectedRoomId}
              title={
                INITIAL_MARKERS.find((marker) => marker.id === selectedRoomId)
                  ?.label ?? "Asset Room"
              }
              onClose={() => setSelectedRoomId(null)}
              className="h-full w-full border-none bg-transparent shadow-none"
            />
          </div>
        ) : null}
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-4 right-4 z-20">
        <ActivityLogBar latestLog={eventLogs[0]} />
      </div>
    </main>
  );
}
