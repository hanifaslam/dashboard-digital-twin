"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { MarkerInfoCard } from "@/app/_components/marker-info-card";
import { ActivityLogBar } from "@/app/_components/dashboard/activity-log-bar";
import { BuildingSelector } from "@/app/_components/dashboard/building-selector";
import { FloorSelector } from "@/app/_components/dashboard/floor-selector";
import { ModelSelector } from "@/app/_components/dashboard/model-selector";
import {
  BUILDING_MARKERS,
  BUILDING_LABEL_POSITIONS,
  INITIAL_MARKERS,
  type RoomFilterId,
} from "@/app/_components/dashboard/dashboard-config";
import { EnergyMonitoringCard } from "@/app/_components/dashboard/energy-monitoring-card";
import { RoomDirectoryPanel } from "@/app/_components/dashboard/room-directory-panel";
import { LiveCctvPanel } from "@/app/_components/dashboard/live-cctv-panel";
import { buildSparklinePoints } from "@/app/_components/dashboard/dashboard-utils";
import { WeatherSummaryCard } from "@/app/_components/weather-summary-card";
import {
  useDashboardBuildingsQuery,
  useEnergyMonitoringSummaryQuery,
  useLiveActivityLogQuery,
} from "@/hooks/api/use-dashboard";
import { useDashboardRealtime } from "@/hooks/api/socket/use-dashboard-realtime";
import { useLiveEnergyChart } from "@/hooks/api/socket/use-live-energy-chart";
import MapboxScene from "@/components/three/mapbox-scene";
import { cn } from "@/lib/utils";
import { useChatbot } from "@/hooks/use-chatbot";

const DEFAULT_SCENE_BUILDING_ID = "cmnb91ftx000fmsbcgrg8qav7";

export default function Home() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>(
    "/models/polines-final.glb",
  );
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<RoomFilterId>("ALL");
  const { setActiveContext, setIsHidden, isOpen: isChatbotOpen } = useChatbot();

  useEffect(() => {
    setIsHidden(false);
  }, [setIsHidden]);

  const { data: buildings = [], isLoading: isBuildingsLoading } =
    useDashboardBuildingsQuery();
  const activeBuildingId = useMemo(() => {
    if (
      selectedBuildingId &&
      buildings.some((building) => building.id === selectedBuildingId)
    ) {
      return selectedBuildingId;
    }

    if (
      buildings.some((building) => building.id === DEFAULT_SCENE_BUILDING_ID)
    ) {
      return DEFAULT_SCENE_BUILDING_ID;
    }

    return buildings[0]?.id ?? null;
  }, [buildings, selectedBuildingId]);
  const { data: energySummary, isLoading: isEnergySummaryLoading } =
    useEnergyMonitoringSummaryQuery(activeBuildingId);
  const { data: activityLogs = [] } = useLiveActivityLogQuery(20);

  useDashboardRealtime({
    buildingId: activeBuildingId,
    activityLimit: 20,
  });

  const activeMarkers = useMemo(() => {
    if (!activeBuildingId) return INITIAL_MARKERS;
    return BUILDING_MARKERS[activeBuildingId] || [];
  }, [activeBuildingId]);

  const filteredMarkers = useMemo(() => {
    return activeMarkers.filter((marker) => {
      const matchesSearch = marker.label
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (marker.floor !== activeFloor) {
        return false;
      }

      if (activeFilter === "DOSEN") {
        return marker.type === "dosen";
      }

      if (activeFilter === "CLASS") {
        return marker.type === "class";
      }

      return true;
    });
  }, [activeFilter, searchQuery, activeFloor, activeMarkers]);

  const roomIds = useMemo(
    () => activeMarkers.map((m) => m.id),
    [activeMarkers],
  );
  const liveEnergyPoints = useLiveEnergyChart(roomIds);

  const chartPoints = useMemo(
    () =>
      buildSparklinePoints(liveEnergyPoints.map((item) => item.total_power)),
    [liveEnergyPoints],
  );

  const liveTrendWindowSeconds = useMemo(() => {
    if (liveEnergyPoints.length < 2) return null;
    const first = new Date(liveEnergyPoints[0].timestamp).getTime();
    const last = new Date(
      liveEnergyPoints[liveEnergyPoints.length - 1].timestamp,
    ).getTime();
    return Math.round((last - first) / 1000);
  }, [liveEnergyPoints]);
  const activeBuilding = useMemo(
    () =>
      buildings.find((building) => building.id === activeBuildingId) ?? null,
    [activeBuildingId, buildings],
  );

  useEffect(() => {
    setActiveContext(activeBuildingId, selectedRoomId);
  }, [activeBuildingId, selectedRoomId, setActiveContext]);

  useEffect(() => {
    return () => {
      setActiveContext(null, null);
    };
  }, [setActiveContext]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId((currentRoomId) =>
      currentRoomId === roomId ? null : roomId,
    );
  };

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedRoomId(null);
  };

  const latestTimestamp =
    liveEnergyPoints.length > 0
      ? liveEnergyPoints[liveEnergyPoints.length - 1].timestamp
      : energySummary?.last_updated_at;

  const lastUpdatedLabel = latestTimestamp
    ? new Date(latestTimestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <main className="relative mt-16 h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-950 lg:mt-20 lg:h-[calc(100vh-80px)]">
      <div className="tech-grid-overlay pointer-events-none absolute inset-0 z-10 opacity-30" />
      <div className="tech-scanline pointer-events-none absolute inset-0 z-10 opacity-10" />

      <div className="absolute inset-0 z-0 bg-slate-950">
        <MapboxScene
          modelUrl={activeModel}
          markers={filteredMarkers}
          selectedRoomId={selectedRoomId}
          onMarkerClick={(marker) => setSelectedRoomId(marker.id)}
          buildingName={activeBuilding?.name}
          buildingBadgePosition={
            activeBuildingId
              ? BUILDING_LABEL_POSITIONS[activeBuildingId]
              : undefined
          }
        />
      </div>

      <div className="absolute left-4 right-16 top-4 z-20 flex flex-col lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:flex-row gap-2">
        <div className="w-full lg:w-auto">
          <BuildingSelector
            buildings={buildings}
            selectedBuilding={activeBuildingId}
            onSelect={handleBuildingChange}
          />
        </div>
        <div className="flex gap-2">
          {process.env.NEXT_PUBLIC_ENABLE_MARKER_TOOL === "true" && (
            <ModelSelector
              activeModel={activeModel}
              onModelChange={setActiveModel}
            />
          )}
          <FloorSelector
            floors={[1, 2]}
            activeFloor={activeFloor}
            onSelect={setActiveFloor}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-20 left-4 lg:top-4 max-lg:top-auto max-lg:max-h-[45vh] z-20 flex flex-col gap-4 overflow-hidden max-lg:right-4">
        <div className="hidden lg:block w-80 shrink-0 pointer-events-auto">
          <WeatherSummaryCard />
        </div>

        <div className="hidden lg:block w-80 shrink-0 pointer-events-auto">
          <LiveCctvPanel />
        </div>

        <div className="pointer-events-auto max-lg:w-full lg:w-80 max-lg:mt-auto flex-1 min-h-0 flex-col hidden lg:flex">
          <RoomDirectoryPanel
            buildingLabel={
              activeBuilding?.name ??
              (isBuildingsLoading
                ? "Loading building..."
                : "No building selected")
            }
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
      </div>

      <div
        className={cn(
          "pointer-events-none absolute right-4 lg:top-4 top-36 z-20 flex flex-col gap-4 transition-[width] duration-300 max-lg:left-4 max-lg:bottom-auto lg:bottom-20",
          selectedRoomId ? "lg:w-[380px] w-auto" : "lg:w-80 w-auto",
        )}
      >
        <AnimatePresence mode="wait">
          {!selectedRoomId && (
            <motion.div
              key="energy-card"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="pointer-events-auto max-lg:w-full lg:w-80 self-end shrink-0 hidden lg:block"
            >
              <EnergyMonitoringCard
                buildingLabel={
                  energySummary?.building_name ??
                  activeBuilding?.name ??
                  (isBuildingsLoading
                    ? "Loading building..."
                    : "No building selected")
                }
                currentPowerLabel={energySummary?.current_active_demand_label}
                currentPowerWatts={energySummary?.current_active_demand_watts}
                changePercent={energySummary?.change_percent_vs_average}
                chartPoints={chartPoints}
                trendWindowSeconds={
                  liveTrendWindowSeconds ?? energySummary?.trend_window_seconds
                }
                lastUpdatedAt={lastUpdatedLabel}
                isLoading={
                  isEnergySummaryLoading ||
                  (isBuildingsLoading && !activeBuildingId)
                }
                hideChart={isChatbotOpen}
              />
            </motion.div>
          )}

          {selectedRoomId && (
            <motion.div
              key="marker-card"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="pointer-events-auto tech-card flex max-lg:h-[45vh] lg:h-full w-full flex-col overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/90 p-0 shadow-lg backdrop-blur-xl"
            >
              <MarkerInfoCard
                id={selectedRoomId}
                title={
                  activeMarkers.find((marker) => marker.id === selectedRoomId)
                    ?.label ?? "Asset Room"
                }
                onClose={() => setSelectedRoomId(null)}
                className="h-full w-full border-none bg-transparent shadow-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-4 lg:right-4 max-lg:right-20 z-20 hidden lg:block">
        <ActivityLogBar latestLog={activityLogs[0] ?? null} />
      </div>
    </main>
  );
}
