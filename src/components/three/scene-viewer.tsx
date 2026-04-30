"use client";

import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, Html } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { MarkerInfoCard } from "./marker-info-card";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Marker {
  id: string;
  position: [number, number, number];
  label: string;
  description?: string;
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

function LoadingOverlay() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-black/20 backdrop-blur-md">
        <div className="relative flex flex-col items-center gap-4">
          {/* Spinner Animasi */}
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />

          <div className="flex flex-col items-center">
            <h2 className="text-white font-bold animate-pulse text-sm">
              Initializing Digital Twin
            </h2>
            <p className="text-zinc-400 text-xs mt-1">Loading Assets...</p>
          </div>
        </div>
      </div>
    </Html>
  );
}

interface SceneViewerProps {
  modelUrl: string;
  markers?: Marker[];
  onMarkerClick?: (marker: Marker) => void;
}

export default function SceneViewer({
  modelUrl,
  markers = [],
  onMarkerClick,
}: SceneViewerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [previewPos, setPreviewPos] = useState<[number, number, number] | null>(
    null,
  );
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
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
        <Suspense fallback={<LoadingOverlay />}>
          <Stage
            environment="city"
            intensity={0.5}
            shadows={{ type: "contact", opacity: 0.7, blur: 2 }}
            adjustCamera={false}
          >
            <Model url={modelUrl} onDebugClick={handleDebugClick} />

            {/* Preview Marker (Hanya muncul jika debugMode aktif) */}
            {debugMode && previewPos && (
              <Html position={previewPos} center>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-xl animate-bounce" />
                  <div className="bg-red-600 text-white text-[8px] px-1 rounded font-mono">
                    NEW POINT
                  </div>
                </div>
              </Html>
            )}

            {markers.map((marker) => (
              <Html
                key={marker.id}
                position={marker.position}
                distanceFactor={10}
                center
                zIndexRange={[10, 0]}
              >
                <Popover
                  open={activeMarkerId === marker.id}
                  onOpenChange={(open) =>
                    setActiveMarkerId(open ? marker.id : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <div
                      className="relative group/marker cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkerClick?.(marker);
                      }}
                    >
                      {/* Efek Ping */}
                      <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />

                      {/* Titik Marker */}
                      <div
                        className={cn(
                          "relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all hover:scale-125",
                          activeMarkerId === marker.id
                            ? "bg-white scale-125 shadow-blue-500/50"
                            : "bg-blue-600 shadow-black/20",
                        )}
                      />

                      {/* Label Tooltip (Hanya muncul jika tidak sedang aktif & hover) */}
                      {activeMarkerId !== marker.id && (
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/marker:opacity-100 transition-opacity bg-black/80 backdrop-blur-md text-white text-[10px] py-1 px-2 rounded border border-white/20 whitespace-nowrap pointer-events-none">
                          {marker.label}
                        </div>
                      )}
                    </div>
                  </PopoverTrigger>

                  <PopoverContent
                    side="right"
                    align="end"
                    sideOffset={15}
                    className="p-0 w-auto bg-transparent border-none shadow-none"
                  >
                    <MarkerInfoCard
                      title={marker.label}
                      description={marker.description}
                      onClose={() => setActiveMarkerId(null)}
                    />
                  </PopoverContent>
                </Popover>
              </Html>
            ))}
          </Stage>
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.75}
        />
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-colors active:scale-95 shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          RESET VIEW
        </button>

        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`flex items-center justify-center gap-2 px-3 py-2 backdrop-blur-md border border-white/10 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg ${
            debugMode
              ? "bg-red-600/80 hover:bg-red-600"
              : "bg-black/50 hover:bg-white/10"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${debugMode ? "bg-white animate-pulse" : "bg-zinc-500"}`}
          />
          {debugMode ? "MARKER TOOL: ON" : "MARKER TOOL: OFF"}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground uppercase tracking-widest pointer-events-none bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
        3D Preview Mode • {markers.length} Markers Active{" "}
        {debugMode && "• DEBUG ACTIVE"}
      </div>
    </div>
  );
}
