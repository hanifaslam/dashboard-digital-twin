"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { useQueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrbitControls, Stage, useGLTF, Html } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { LecturerRoomIcon } from "@/components/icons/lecturer-room-icon";
import { ClassRoomIcon } from "@/components/icons/class-room-icon";
import { useCachedModelUrl } from "@/components/three/use-cached-model-url";
import { useScheduleListQuery } from "@/hooks/api/digital-twin/use-schedule";

export interface Marker {
  id: string;
  position: [number, number, number];
  label: string;
  description?: string;
  type?: "dosen" | "class";
}

interface ModelProps {
  url: string;
}

function Model({
  url,
  onDebugClick,
}: ModelProps & { onDebugClick: (point: [number, number, number]) => void }) {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const { x, y, z } = e.point;
        onDebugClick([x, y, z]);
      }}
    />
  );
}

// Camera controller component running inside Canvas to interpolate position & target
// Camera controller component running inside Canvas to interpolate position & target
function CameraController({
  selectedRoomId,
  markers,
  isTransitioning,
  setIsTransitioning,
  shouldReset,
  onResetComplete,
}: {
  selectedRoomId: string | null;
  markers: Marker[];
  isTransitioning: boolean;
  setIsTransitioning: (val: boolean) => void;
  shouldReset: boolean;
  onResetComplete: () => void;
}) {
  const defaultCam = useRef(new THREE.Vector3(10, 0, 0));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const controls = state.controls as unknown as OrbitControlsImpl;
    if (!controls) return;

    const activeMarker = markers.find((m) => m.id === selectedRoomId);

    if (activeMarker && isTransitioning) {
      const [tx, ty, tz] = activeMarker.position;

      // Compute target camera position relative to room (zoom in close)
      // Menyesuaikan posisi kamera dari depan atau belakang berdasarkan posisi X
      const targetCamX = tx + (tx > 0 ? 3.0 : -3.0);
      const targetCamY = ty + 2.0;
      const targetCamZ = tz + 3.0;

      const currentCam = state.camera.position;
      const currentTarget = controls.target;

      const distToTarget = currentTarget.distanceTo(
        new THREE.Vector3(tx, ty, tz),
      );
      const distToCam = currentCam.distanceTo(
        new THREE.Vector3(targetCamX, targetCamY, targetCamZ),
      );

      if (distToTarget > 0.05 || distToCam > 0.05) {
        // Smoothly interpolate camera target (orbit focus point) to room coordinate
        controls.target.x = THREE.MathUtils.lerp(controls.target.x, tx, 0.08);
        controls.target.y = THREE.MathUtils.lerp(controls.target.y, ty, 0.08);
        controls.target.z = THREE.MathUtils.lerp(controls.target.z, tz, 0.08);

        // Set new values on state.camera.position
        state.camera.position.set(
          THREE.MathUtils.lerp(state.camera.position.x, targetCamX, 0.06),
          THREE.MathUtils.lerp(state.camera.position.y, targetCamY, 0.06),
          THREE.MathUtils.lerp(state.camera.position.z, targetCamZ, 0.06),
        );

        controls.update();
      } else {
        // Perfect smooth landing achieved! Complete transition without any hard snaps
        setIsTransitioning(false);
      }
    } else if (shouldReset) {
      const distToDefaultCam = state.camera.position.distanceTo(
        defaultCam.current,
      );
      const distToDefaultTarget = controls.target.distanceTo(
        defaultTarget.current,
      );

      if (distToDefaultCam > 0.05 || distToDefaultTarget > 0.05) {
        controls.target.x = THREE.MathUtils.lerp(
          controls.target.x,
          defaultTarget.current.x,
          0.08,
        );
        controls.target.y = THREE.MathUtils.lerp(
          controls.target.y,
          defaultTarget.current.y,
          0.08,
        );
        controls.target.z = THREE.MathUtils.lerp(
          controls.target.z,
          defaultTarget.current.z,
          0.08,
        );

        state.camera.position.set(
          THREE.MathUtils.lerp(
            state.camera.position.x,
            defaultCam.current.x,
            0.06,
          ),
          THREE.MathUtils.lerp(
            state.camera.position.y,
            defaultCam.current.y,
            0.06,
          ),
          THREE.MathUtils.lerp(
            state.camera.position.z,
            defaultCam.current.z,
            0.06,
          ),
        );

        controls.update();
      } else {
        // Perfect smooth return landing complete! Complete reset without any hard snaps
        onResetComplete();
      }
    }
  });

  return null;
}

function MarkerBadge({
  marker,
  isActive,
  isHidden,
  onMarkerClick,
}: {
  marker: Marker;
  isActive: boolean;
  isHidden?: boolean;
  onMarkerClick?: (marker: Marker) => void;
}) {
  const { data: schedules } = useScheduleListQuery(marker.id);
  const isOccupied = schedules?.some((s) => s.is_online);

  // Dynamically pick icon
  const isDosen =
    marker.type === "dosen" || marker.label.toLowerCase().includes("dosen");
  const IconComponent = isDosen ? LecturerRoomIcon : ClassRoomIcon;

  return (
    <Html
      position={marker.position}
      distanceFactor={10}
      center
      zIndexRange={[10, 0]}
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (isActive) {
            onMarkerClick?.({
              id: "",
              label: "",
              position: [0, 0, 0],
            });
          } else {
            onMarkerClick?.(marker);
          }
        }}
        className={cn(
          "relative group/marker cursor-pointer flex items-center justify-center w-8 h-8 transition-opacity duration-300",
          isHidden ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        )}
      >
        {/* Efek Ping */}
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-20",
            isOccupied ? "bg-red-500" : "bg-cyan-400",
            isActive ? "scale-125" : "scale-100",
          )}
        />

        {/* Holographic Circular Icon Badge */}
        <div
          className={cn(
            "relative w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-md",
            isActive
              ? isOccupied
                ? "bg-red-500 border-red-400 text-slate-950 shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-110"
                : "bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-110"
              : isOccupied
                ? "bg-slate-950/85 border-red-500/50 text-red-400 hover:border-red-400 hover:text-white hover:shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                : "bg-slate-950/85 border-cyan-500/30 text-cyan-400 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_8px_rgba(6,182,212,0.3)]",
          )}
        >
          <IconComponent className="h-3.5 w-3.5 transition-transform duration-300" />
        </div>

        {/* Label Tooltip (Selalu muncul) */}
        <div
          className={cn(
            "absolute left-9 top-1/2 -translate-y-1/2 transition-all duration-300 bg-slate-950/95 backdrop-blur-md text-[9px] py-1.5 px-2.5 rounded-md border whitespace-nowrap pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
            isActive
              ? isOccupied
                ? "opacity-100 translate-x-0 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.25)] font-bold"
                : "opacity-100 translate-x-0 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)] font-bold"
              : isOccupied
                ? "opacity-100 translate-x-0 text-red-400 border-red-500/50 group-hover/marker:text-white group-hover/marker:border-red-400"
                : "opacity-100 translate-x-0 text-cyan-400 border-cyan-500/30 group-hover/marker:text-white group-hover/marker:border-cyan-400",
          )}
        >
          <div className="flex items-center gap-1.5">
            {isActive && (
              <span
                className={cn(
                  "w-1 h-1 rounded-full animate-pulse shrink-0",
                  isOccupied ? "bg-red-400" : "bg-cyan-400",
                )}
              />
            )}
            <span>{marker.label}</span>
          </div>

          {/* Hover Status Info (Bawah, Absolute) */}
          {isOccupied && (
            <div className="absolute left-0 top-[100%] mt-1 overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover/marker:max-h-[20px] group-hover/marker:opacity-100">
              <span className="px-1.5 py-1 rounded text-[7.5px] bg-slate-950/95 backdrop-blur-md text-red-400 border border-red-500/30 font-bold block w-fit whitespace-nowrap shadow-md">
                Currently in use
              </span>
            </div>
          )}
        </div>
      </div>
    </Html>
  );
}

function LoadingOverlay() {
  return (
    <Html center>
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950/55">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />

          <div className="flex flex-col items-center gap-1">
            <h2 className="text-sm font-bold text-white">
              Initializing Digital Twin
            </h2>
            <p className="text-xs font-medium text-white/55">
              Loading Assets...
            </p>
          </div>
        </div>
      </div>
    </Html>
  );
}

interface SceneViewerProps {
  modelUrl: string;
  markers?: Marker[];
  selectedRoomId?: string | null;
  onMarkerClick?: (marker: Marker) => void;
  buildingName?: string | null;
}

export default function SceneViewer({
  modelUrl,
  markers = [],
  selectedRoomId = null,
  onMarkerClick,
  buildingName,
}: SceneViewerProps) {
  const showMarkerTool =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_MARKER_TOOL === "true";
  const queryClient = useQueryClient();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [previewPos, setPreviewPos] = useState<[number, number, number] | null>(
    null,
  );
  const [debugMode, setDebugMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const { resolvedUrl, isPreparing } = useCachedModelUrl(modelUrl);

  // Derive activeMarkerId directly from selectedRoomId prop to avoid hook warn triggers
  const activeMarkerId = selectedRoomId || null;

  // Smoothly reset camera to starting point when deselecting room
  const prevRoomIdRef = useRef<string | null>(null);
  useEffect(() => {
    let frameId: number | null = null;

    if (selectedRoomId) {
      frameId = window.requestAnimationFrame(() => {
        setShouldReset(false); // Stop any ongoing reset immediately!
        setIsTransitioning(true); // Start zoom transition immediately!
      });
    } else if (prevRoomIdRef.current && !selectedRoomId) {
      frameId = window.requestAnimationFrame(() => {
        setShouldReset(true);
      });
    }

    prevRoomIdRef.current = selectedRoomId;

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [selectedRoomId]);

  const handleReset = () => {
    setShouldReset(true);
  };

  const handleDebugClick = (point: [number, number, number]) => {
    if (!debugMode) return;
    setPreviewPos(point);
    console.log(
      `Koordinat Klik: [${point[0].toFixed(2)}, ${point[1].toFixed(2)}, ${point[2].toFixed(2)}]`,
    );
  };

  return (
    <div className="w-full h-full relative group">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        camera={{ position: [10, 0, 0], fov: 45 }}
      >
        <QueryClientProvider client={queryClient}>
          {isPreparing && <LoadingOverlay />}
          <Suspense fallback={<LoadingOverlay />}>
            <CameraController
              selectedRoomId={selectedRoomId}
              markers={markers}
              isTransitioning={isTransitioning}
              setIsTransitioning={setIsTransitioning}
              shouldReset={shouldReset}
              onResetComplete={() => setShouldReset(false)}
            />
            <Stage
              environment="city"
              intensity={0.5}
              shadows={{ type: "contact", opacity: 0.7, blur: 2 }}
              adjustCamera={false}
            >
              {!isPreparing && (
                <Model url={resolvedUrl} onDebugClick={handleDebugClick} />
              )}

              {/* Building Name Badge */}
              {buildingName && !isPreparing && (
                <Html position={[0, 3.5, -0.5]} center zIndexRange={[100, 0]}>
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <div className="px-5 py-2.5 bg-slate-950/80 backdrop-blur-md border border-cyan-500/50 rounded-xl relative">
                      <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70" />
                      </div>
                      <h3 className="text-white font-semmibold text-xs whitespace-nowrap relative z-10">
                        {buildingName}
                      </h3>
                    </div>
                  </div>
                </Html>
              )}

              {/* Preview Marker (Hanya muncul jika debugMode aktif) */}
              {debugMode && previewPos && (
                <Html position={previewPos} center>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-xl animate-bounce shadow-red-500/50" />
                    <div className="bg-red-600 border border-red-500 text-white text-[8px] px-1.5 py-0.5 rounded shadow-lg">
                      NEW_POINT
                    </div>
                  </div>
                </Html>
              )}

              {markers.map((marker) => {
                const isActive = activeMarkerId === marker.id;
                const isHidden = !!activeMarkerId && !isActive;
                return (
                  <MarkerBadge
                    key={marker.id}
                    marker={marker}
                    isActive={isActive}
                    isHidden={isHidden}
                    onMarkerClick={onMarkerClick}
                  />
                );
              })}
            </Stage>
          </Suspense>
        </QueryClientProvider>
        <OrbitControls
          ref={controlsRef}
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.75}
          onStart={() => {
            // User manually interacted with the canvas! Instantly cancel active flights
            setIsTransitioning(false);
            setShouldReset(false);
          }}
        />
      </Canvas>

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute top-4 right-4 z-20 flex flex-row gap-2 pointer-events-auto",
          selectedRoomId ? "lg:right-[411px]" : "lg:right-[351px]",
        )}
      >
        <button
          onClick={handleReset}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-950/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-cyan-500/40 hover:bg-white/5"
        >
          <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
          Reset View
        </button>

        {showMarkerTool && (
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`flex items-center justify-center gap-2 px-3 py-2 backdrop-blur-md border text-[10px] font-semibold rounded-lg transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)] ${
              debugMode
                ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                : "bg-slate-950/60 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${debugMode ? "bg-red-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"}`}
            />
            {debugMode ? "Marker Tool: On" : "Marker Tool: Off"}
          </button>
        )}
      </div>

      <div className="absolute bottom-4 left-4 text-[9px] text-cyan-400/60 pointer-events-none bg-slate-950/40 border border-cyan-500/10 px-3 py-1.5 rounded-md backdrop-blur-sm flex items-center gap-2 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
        <span>System Rendering: 3D View</span>
        <span className="text-cyan-500/20">|</span>
        <span>Markers: {markers.length}</span>
        {debugMode && (
          <>
            <span className="text-cyan-500/20">|</span>
            <span className="text-red-400 animate-pulse font-semibold">
              Debug Active
            </span>
          </>
        )}
      </div>
    </div>
  );
}
