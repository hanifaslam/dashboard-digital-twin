"use client";

import SceneViewer, { Marker } from "@/components/three/scene-viewer";
import { useState } from "react";

export default function Home() {
  // Contoh daftar marker (Silakan sesuaikan koordinat [x, y, z] dengan model kamu)
  const [markers] = useState<Marker[]>([
    {
      id: "cmoa65k7h0000xcbcu6nbkt9o",
      position: [1.19, -1.5, -4.25],
      label: "Ruang Dosen IK",
    },
    {
      id: "cmnb91gab000tmsbc9vp9itjb",
      position: [1.19, -1.5, 3.24],
      label: "Room 1.1",
    },
  ]);

  const handleMarkerClick = () => {
    // Toast dihapus karena sudah digantikan oleh Info Card di samping marker
  };

  return (
    <main className="relative w-full h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] overflow-hidden bg-gray-500 mt-16 lg:mt-20">
      {/* 3D Scene Viewer dengan Markers */}
      <div className="absolute inset-0 z-0">
        <SceneViewer
          modelUrl="/models/polines-test.glb"
          markers={markers}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </main>
  );
}
