"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { MarkerInfoCard } from "@/app/_components/marker-info-card";
import { ActivityLogBar } from "@/app/_components/dashboard/activity-log-bar";
import { BuildingSelector } from "@/app/_components/dashboard/building-selector";
import { ModelSelector } from "@/app/_components/dashboard/model-selector";
import {
  INITIAL_MARKERS,
  type RoomFilterId,
} from "@/app/_components/dashboard/dashboard-config";
import { EnergyMonitoringCard } from "@/app/_components/dashboard/energy-monitoring-card";
import { RoomDirectoryPanel } from "@/app/_components/dashboard/room-directory-panel";
import { buildSparklinePoints } from "@/app/_components/dashboard/dashboard-utils";
import { WeatherSummaryCard } from "@/app/_components/weather-summary-card";
import { SystemClock } from "@/components/layout/system-clock";
import {
  useDashboardBuildingsQuery,
  useEnergyMonitoringSummaryQuery,
  useLiveActivityLogQuery,
} from "@/hooks/api/use-dashboard";
import { useDashboardRealtime } from "@/hooks/api/socket/use-dashboard-realtime";
import SceneViewer from "@/components/three/scene-viewer";
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
    "/models/polines-test.glb",
  );
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

      if (activeFilter === "CLASS") {
        return (
          marker.label.toLowerCase().includes("room") ||
          marker.label.toLowerCase().includes("lab") ||
          marker.label.toLowerCase().includes("sb")
        );
      }

      return true;
    });
  }, [activeFilter, searchQuery]);

  const chartPoints = useMemo(
    () =>
      buildSparklinePoints(
        energySummary?.trend.map((item) => item.total_power) ?? [],
      ),
    [energySummary?.trend],
  );
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

  const lastUpdatedLabel = energySummary?.last_updated_at
    ? new Date(energySummary.last_updated_at).toLocaleTimeString("en-US", {
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
        <SceneViewer
          modelUrl={activeModel}
          markers={INITIAL_MARKERS}
          selectedRoomId={selectedRoomId}
          onMarkerClick={(marker) => setSelectedRoomId(marker.id)}
          buildingName={activeBuilding?.name}
        />
      </div>

      <div className="absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 lg:flex lg:flex-row lg:gap-2">
        <BuildingSelector
          buildings={buildings}
          selectedBuilding={activeBuildingId}
          onSelect={handleBuildingChange}
        />
        <ModelSelector
          activeModel={activeModel}
          onModelChange={setActiveModel}
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
          "pointer-events-auto absolute right-4 top-4 z-20 flex flex-col gap-4 transition-[width] duration-300",
          selectedRoomId ? "w-[380px]" : "w-80",
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
              className="w-80 self-end shrink-0"
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
                trendWindowSeconds={energySummary?.trend_window_seconds}
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
              className="tech-card flex h-[calc(100vh-120px)] w-full flex-col overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/90 p-0 shadow-lg backdrop-blur-xl"
            >
              <MarkerInfoCard
                id={selectedRoomId}
                title={
                  INITIAL_MARKERS.find((marker) => marker.id === selectedRoomId)
                    ?.label ?? "Asset Room"
                }
                onClose={() => setSelectedRoomId(null)}
                className="h-full w-full border-none bg-transparent shadow-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-4 right-4 z-20">
        <ActivityLogBar latestLog={activityLogs[0] ?? null} />
      </div>
    </main>
  );
}
