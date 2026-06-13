"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useQueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  OrbitControls,
  useGLTF,
  Html,
  Environment,
  ContactShadows,
  AdaptiveDpr,
  Bvh,
} from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  RotateCcw,
  RotateCw,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LecturerRoomIcon } from "@/components/icons/lecturer-room-icon";
import { ClassRoomIcon } from "@/components/icons/class-room-icon";
import { useCachedModelUrl } from "@/components/three/use-cached-model-url";
import { useScheduleListQuery } from "@/hooks/api/digital-twin/use-schedule";
import { MapboxSync } from "./mapbox-sync";

export interface Marker {
  id: string;
  position: [number, number, number];
  label: string;
  description?: string;
  type?: "dosen" | "class";
  floor?: number;
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
    <Bvh firstHitOnly>
      <primitive
        object={scene}
        scale={[1, 1, 1]} // Skala dikembalikan ke 1 karena sekarang skalanya diatur di pembungkus (Center) agar marker ikut menyesuaikan
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          const { x, y, z } = e.point;
          onDebugClick([x, y, z]);
        }}
      />
    </Bvh>
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
  debugMode,
}: {
  selectedRoomId: string | null;
  markers: Marker[];
  isTransitioning: boolean;
  setIsTransitioning: (val: boolean) => void;
  shouldReset: boolean;
  onResetComplete: () => void;
  debugMode?: boolean;
}) {
  const defaultCam = useRef(new THREE.Vector3(1.59, 0.53, 1.57));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));

  const { camera } = useThree();

  useEffect(() => {
    if (!debugMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") {
        console.log(
          `Posisi Kamera Saat Ini: [${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}]`,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, debugMode]);

  useFrame((state) => {
    const controls = state.controls as unknown as OrbitControlsImpl;
    if (!controls) return;

    const activeMarker = markers.find((m) => m.id === selectedRoomId);

    if (activeMarker && isTransitioning) {
      const [rawX, rawY, rawZ] = activeMarker.position;

      // Konversi posisi marker ke skala dunia baru (0.09) beserta offset ketinggiannya
      const tx = rawX * 0.09;
      const ty = rawY * 0.09 + 0.1;
      const tz = rawZ * 0.09;

      // Memisahkan logika kamera untuk 2 kelompok gedung berdasarkan koordinat X
      let targetCamX, targetCamY, targetCamZ;

      if (rawX < 9) {
        // Kelompok Marker 1 (X = 7.4): Settingan yang baru (menghadap dari luar)
        targetCamX = tx - 0.3;
        targetCamY = ty + 0.02; // Diturunkan agar tidak nyangkut kanopi
        targetCamZ = tz + (tz > 0 ? 0.3 : -0.3); // Otomatis balik arah jika Z minus
      } else {
        // Kelompok Marker sisanya (X = 10.19): Settingan yang lama
        targetCamX = tx + (tx > 0 ? 0.3 : -0.3);
        targetCamY = ty + 0.02; // Diturunkan agar sejajar dengan pintu
        targetCamZ = tz + (tz > 0 ? 0.3 : -0.3); // Otomatis balik arah jika Z minus
      }

      const currentCam = state.camera.position;
      const currentTarget = controls.target;

      // Update dynamic defaultTarget to lock onto the room
      defaultTarget.current.set(tx, ty, tz);

      // Update dynamic defaultCam to simply zoom out from the room
      const dir = new THREE.Vector3(
        targetCamX - tx,
        targetCamY - ty,
        targetCamZ - tz,
      ).normalize();
      const zoomOutDistance = 2.3;
      defaultCam.current.set(
        tx + dir.x * zoomOutDistance,
        Math.max(0.53, ty + dir.y * zoomOutDistance), // keep a minimum height
        tz + dir.z * zoomOutDistance,
      );

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
      distanceFactor={1} // Dikecilkan dari 10 menjadi 1 karena seluruh ukuran 3D kita di-scale menjadi 0.09
      center
      zIndexRange={[10, 0]}
    >
      <div
        onPointerDown={(e) => {
          e.stopPropagation();
          // Eksekusi logic klik langsung di onPointerDown agar tidak "ketahan" / dibatalkan
          // oleh OrbitControls jika mouse/jari sedikit bergeser
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
        onPointerUp={(e) => e.stopPropagation()}
        className={cn(
          "relative group/marker cursor-pointer flex items-center justify-center w-8 h-8 transition-opacity duration-300",
          isHidden
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto",
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
            "absolute left-9 top-1/2 -translate-y-1/2 transition-all duration-300 bg-slate-950/95 backdrop-blur-md text-[9px] py-1.5 px-2.5 rounded-md border whitespace-nowrap pointer-events-auto shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
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

function LoadingOverlay({
  progress,
  isParsing,
}: {
  progress?: number;
  isParsing?: boolean;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(50);

  useEffect(() => {
    if (isParsing) {
      // Simulate parsing progress from 50% to 95%
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        // Ease out fake progress over ~3 seconds
        const p = 50 + (1 - Math.exp(-elapsed / 1000)) * 45;
        setAnimatedProgress(Math.min(p, 99));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isParsing]);

  const displayProgress = isParsing ? animatedProgress : (progress ?? 0);

  return (
    <Html center>
      <div className="flex h-screen w-screen items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-[15px] font-medium text-zinc-200">
            Loading 3D model
          </h2>
          <div className="w-56 h-[3px] bg-zinc-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-75 ease-linear"
              style={{ width: `${displayProgress}%` }}
            />
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
  buildingBadgePosition?: [number, number, number];
  isNight?: boolean;
}

export default function SceneViewer({
  modelUrl,
  markers = [],
  selectedRoomId = null,
  onMarkerClick,
  buildingName,
  buildingBadgePosition,
  isNight = false,
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
  const [showModel, setShowModel] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const { resolvedUrl, isPreparing, downloadProgress } =
    useCachedModelUrl(modelUrl);

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

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const continuousActionRef = useRef<((delta: number) => void) | null>(null);
  const continuousFrameRef = useRef<number | null>(null);

  const startContinuousAction = (action: (delta: number) => void) => {
    if (manualAnimFrameRef.current !== null) {
      window.cancelAnimationFrame(manualAnimFrameRef.current);
      manualAnimFrameRef.current = null;
    }
    
    continuousActionRef.current = action;
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      if (!continuousActionRef.current) return;
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      
      continuousActionRef.current(delta);
      continuousFrameRef.current = window.requestAnimationFrame(loop);
    };
    
    continuousFrameRef.current = window.requestAnimationFrame(loop);
  };

  const stopContinuousAction = () => {
    continuousActionRef.current = null;
    if (continuousFrameRef.current !== null) {
      window.cancelAnimationFrame(continuousFrameRef.current);
      continuousFrameRef.current = null;
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    clickAction: () => void,
    continuousAction: (delta: number) => void
  ) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    clickAction();
    holdTimeoutRef.current = setTimeout(() => {
      startContinuousAction(continuousAction);
    }, 400); // Wait 400ms before starting continuous movement
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    stopContinuousAction();
  };

  const handlePointerCancel = () => stopContinuousAction();
  const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();

  const manualAnimFrameRef = useRef<number | null>(null);

  const animateCameraTo = (
    targetPos: THREE.Vector3,
    targetLookAt: THREE.Vector3,
    durationMs = 300
  ) => {
    if (!controlsRef.current) return;
    
    if (manualAnimFrameRef.current !== null) {
      window.cancelAnimationFrame(manualAnimFrameRef.current);
    }

    const camera = controlsRef.current.object;
    const startPos = camera.position.clone();
    const startLookAt = controlsRef.current.target.clone();
    
    const startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPos, targetPos, ease);
      controlsRef.current!.target.lerpVectors(startLookAt, targetLookAt, ease);
      controlsRef.current!.update();
      
      if (progress < 1) {
        manualAnimFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        manualAnimFrameRef.current = null;
      }
    };
    
    manualAnimFrameRef.current = window.requestAnimationFrame(animate);
  };

  const handleZoomIn = () => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const dir = camera.position.clone().sub(target);
    const targetPos = target.clone().add(dir.multiplyScalar(0.85)); // Bergerak 15% lebih dekat
    animateCameraTo(targetPos, target.clone());
  };

  const handleZoomOut = () => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const dir = camera.position.clone().sub(target);
    const targetPos = target.clone().add(dir.multiplyScalar(1.15)); // Bergerak 15% lebih jauh
    animateCameraTo(targetPos, target.clone());
  };

  const handleRotateLeft = () => {
    if (!controlsRef.current) return;
    const angle = 10 * (Math.PI / 180); // 10 derajat
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const x = camera.position.x - target.x;
    const z = camera.position.z - target.z;
    
    const targetPos = camera.position.clone();
    targetPos.x = target.x + x * Math.cos(angle) + z * Math.sin(angle);
    targetPos.z = target.z - x * Math.sin(angle) + z * Math.cos(angle);
    
    animateCameraTo(targetPos, target.clone());
  };

  const handleRotateRight = () => {
    if (!controlsRef.current) return;
    const angle = -10 * (Math.PI / 180); // 10 derajat
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const x = camera.position.x - target.x;
    const z = camera.position.z - target.z;
    
    const targetPos = camera.position.clone();
    targetPos.x = target.x + x * Math.cos(angle) + z * Math.sin(angle);
    targetPos.z = target.z - x * Math.sin(angle) + z * Math.cos(angle);
    
    animateCameraTo(targetPos, target.clone());
  };

  const handlePan = (dx: number, dz: number) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    // Mapbox compass: -Z is North, +Z is South, +X is East, -X is West.
    const panSpeed = 0.1; // 10 meter per klik
    const moveX = dx * panSpeed;
    const moveZ = dz * panSpeed;
    
    const targetPos = camera.position.clone();
    targetPos.x += moveX;
    targetPos.z += moveZ;
    
    const targetLookAt = target.clone();
    targetLookAt.x += moveX;
    targetLookAt.z += moveZ;
    
    animateCameraTo(targetPos, targetLookAt);
  };

  const handleTilt = (angleDiff: number) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    
    spherical.phi += angleDiff;
    
    const minPolarAngle = controlsRef.current.minPolarAngle;
    const maxPolarAngle = controlsRef.current.maxPolarAngle;
    spherical.phi = Math.max(minPolarAngle, Math.min(maxPolarAngle, spherical.phi));
    
    const targetOffset = new THREE.Vector3().setFromSpherical(spherical);
    const targetPos = target.clone().add(targetOffset);
    
    animateCameraTo(targetPos, target.clone());
  };

  const handleContinuousZoom = (delta: number, direction: 1 | -1) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const dir = camera.position.clone().sub(target);
    const moveFactor = 1 + (direction * 0.5 * delta); // 50% per second
    camera.position.copy(target).add(dir.multiplyScalar(moveFactor));
    controlsRef.current.update();
  };

  const handleContinuousRotate = (delta: number, direction: 1 | -1) => {
    if (!controlsRef.current) return;
    const speed = 40 * (Math.PI / 180); 
    const angle = direction * speed * delta;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const x = camera.position.x - target.x;
    const z = camera.position.z - target.z;
    camera.position.x = target.x + x * Math.cos(angle) + z * Math.sin(angle);
    camera.position.z = target.z - x * Math.sin(angle) + z * Math.cos(angle);
    controlsRef.current.update();
  };

  const handleContinuousPan = (delta: number, dx: number, dz: number) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const speed = 40; 
    const moveX = dx * speed * delta;
    const moveZ = dz * speed * delta;
    
    camera.position.x += moveX;
    camera.position.z += moveZ;
    target.x += moveX;
    target.z += moveZ;
    controlsRef.current.update();
  };

  const handleContinuousTilt = (delta: number, direction: 1 | -1) => {
    if (!controlsRef.current) return;
    const speed = 40 * (Math.PI / 180);
    const angleDiff = direction * speed * delta;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    
    spherical.phi += angleDiff;
    const minPolarAngle = controlsRef.current.minPolarAngle;
    const maxPolarAngle = controlsRef.current.maxPolarAngle;
    spherical.phi = Math.max(minPolarAngle, Math.min(maxPolarAngle, spherical.phi));
    
    const targetOffset = new THREE.Vector3().setFromSpherical(spherical);
    camera.position.copy(target).add(targetOffset);
    controlsRef.current.update();
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
        dpr={[1, 1]} // Diturunkan dari [1, 2] menjadi 1 untuk membatasi pemrosesan piksel pada layar resolusi tinggi (Retina) agar GPU tidak kewalahan
        performance={{ min: 0.5 }} // Mengizinkan Three.js mengorbankan sedikit kualitas untuk mempertahankan FPS
        camera={{ position: [1.59, 0.53, 1.57], fov: 36.87 }} // Disamakan dengan FOV bawaan Mapbox (36.87 derajat)
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance", // Memaksa browser menggunakan GPU diskrit (Nvidia/AMD) bukan GPU bawaan prosesor
        }}
      >
        <MapboxSync baseLng={110.4344775953449} baseLat={-7.054295872291664} />
        <QueryClientProvider client={queryClient}>
          {isPreparing && <LoadingOverlay progress={downloadProgress * 0.5} />}
          <Suspense fallback={<LoadingOverlay isParsing />}>
            <CameraController
              selectedRoomId={selectedRoomId}
              markers={markers}
              isTransitioning={isTransitioning}
              setIsTransitioning={setIsTransitioning}
              shouldReset={shouldReset}
              onResetComplete={() => setShouldReset(false)}
              debugMode={debugMode}
            />
            {isNight ? (
              <>
                <ambientLight intensity={2} color="#8fbcd4" />
                <directionalLight
                  position={[10, 20, 10]}
                  intensity={1}
                  color="#b1d4e0"
                  castShadow
                  shadow-mapSize={[512, 512]}
                />
              </>
            ) : (
              <>
                <Environment preset="city" />
                <ambientLight intensity={0.5} />
                <directionalLight
                  position={[10, 20, 10]}
                  intensity={1}
                  castShadow
                  shadow-mapSize={[512, 512]}
                />
              </>
            )}

            <group position={[0, 0.08, 0]} scale={[0.09, 0.09, 0.09]}>
              {!isPreparing && showModel && (
                <Model url={resolvedUrl} onDebugClick={handleDebugClick} />
              )}

              {/* Building Name Badge */}
              {buildingName && !isPreparing && (
                <Html
                  position={buildingBadgePosition || [8.5, 3, 0]}
                  center
                  zIndexRange={[100, 0]}
                >
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
            </group>
            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.7}
              blur={2}
              scale={50}
              resolution={512}
              frames={1} // Penting! Memanggang (bake) bayangan sekali saja, menghemat buanyak performa FPS
            />
            <AdaptiveDpr pixelated />
          </Suspense>
        </QueryClientProvider>
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping={true} // Menyalakan efek rem/kelembaman agar gerakan tidak kaku
          dampingFactor={0.05} // Seberapa mulus efek remnya (semakin kecil = semakin mulus/licin)
          zoomSpeed={0.8} // Sedikit memperlambat kecepatan zoom agar transisi lebih terkontrol
          enablePan={true} // Diaktifkan agar pengguna bisa menggeser peta
          screenSpacePanning={false} // Panning vertikal akan menggeser ke depan/belakang (sumbu Z), bukan ke atas/bawah (sumbu Y)
          minPolarAngle={0}
          maxPolarAngle={85 * (Math.PI / 180)} // Dibatasi maksimal 85 derajat agar sama persis dengan batas pitch maksimal Mapbox
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
        </button>

        {showMarkerTool && (
          <>
            <button
              onClick={() => setShowModel(!showModel)}
              className={`flex items-center justify-center gap-2 px-3 py-2 backdrop-blur-md border text-[10px] font-semibold rounded-lg transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)] ${
                !showModel
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
                  : "bg-slate-950/60 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${!showModel ? "bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"}`}
              />
              {showModel ? "3D Model: Visible" : "3D Model: Hidden"}
            </button>
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
          </>
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

      {/* Expandable Camera Controls Column */}
      <div
        className={cn(
          "absolute z-30 flex flex-col items-end gap-3 transition-all duration-300",
          selectedRoomId
            ? "pointer-events-none opacity-0 translate-y-12"
            : "pointer-events-auto opacity-100 translate-y-0",
          "right-4 bottom-[140px] max-lg:bottom-[160px]",
        )}
      >
        <div
          className={cn(
            "flex origin-bottom-right transition-all duration-300 ease-out",
            isControlsOpen
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-75 opacity-0 translate-y-4 pointer-events-none",
          )}
        >
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-2 rounded-2xl backdrop-blur-md border border-cyan-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-cyan-500/60 transition-colors">
            {/* Zoom Controls */}
            <button
              onPointerDown={(e) => handlePointerDown(e, handleZoomIn, (d) => handleContinuousZoom(d, -1))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Zoom In"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onPointerDown={(e) => handlePointerDown(e, handleZoomOut, (d) => handleContinuousZoom(d, 1))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Zoom Out"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Rotate Controls */}
            <button
              onPointerDown={(e) => handlePointerDown(e, handleRotateLeft, (d) => handleContinuousRotate(d, 1))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Rotate Left"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-900/30 text-cyan-400 hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onPointerDown={(e) => handlePointerDown(e, handleRotateRight, (d) => handleContinuousRotate(d, -1))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Rotate Right"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-900/30 text-cyan-400 hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Tilt Controls */}
            <button
              onPointerDown={(e) => handlePointerDown(e, () => handleTilt(-10 * (Math.PI / 180)), (d) => handleContinuousTilt(d, -1))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Tilt Down"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onPointerDown={(e) => handlePointerDown(e, () => handleTilt(10 * (Math.PI / 180)), (d) => handleContinuousTilt(d, 1))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Tilt Up"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Pan Vertical */}
            <button
              onPointerDown={(e) => handlePointerDown(e, () => handlePan(0, -1), (d) => handleContinuousPan(d, 0, -1))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Pan North"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onPointerDown={(e) => handlePointerDown(e, () => handlePan(0, 1), (d) => handleContinuousPan(d, 0, 1))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Pan South"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Pan Horizontal */}
            <button
              onPointerDown={(e) => handlePointerDown(e, () => handlePan(-1, 0), (d) => handleContinuousPan(d, -1, 0))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Pan West"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onPointerDown={(e) => handlePointerDown(e, () => handlePan(1, 0), (d) => handleContinuousPan(d, 1, 0))}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={handleContextMenu}
              title="Pan East"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-white hover:bg-cyan-500/30 active:scale-95 transition-all select-none"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300 active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)]",
            isControlsOpen
              ? "bg-cyan-900/40 border-cyan-500/40 text-cyan-300"
              : "bg-slate-950/60 border-cyan-500/20 text-cyan-400 hover:bg-slate-900/60 hover:border-cyan-500/40",
          )}
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
