"use client";

import type { Marker } from "@/components/three/scene-viewer";

export const ROOM_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "DOSEN", label: "Lecturer Room" },
  { id: "CLASS", label: "Class Room" },
] as const;

export const BUILDING_MARKERS: Record<string, Marker[]> = {
  // 1) Gedung Utama (Default)
  cmnb91ftx000fmsbcgrg8qav7: [
    {
      id: "cmoa65k7h0000xcbcu6nbkt9o",
      position: [7.4, -1.5, 3.5],
      label: "Ruang Dosen IK",
      type: "dosen",
      floor: 1,
    },
    {
      id: "cmpxepjbc0c5n01oc9doa8k66",
      position: [7.4, -1.5, 2.5],
      label: "SB 104",
      type: "class",
      floor: 1,
    },
    {
      id: "cmpxepjc80c5p01ocf5m09zfo",
      position: [7.4, -1.5, 1.5],
      label: "SB 105",
      type: "class",
      floor: 1,
    },
    {
      id: "cmpxepjco0c5q01oc69rr8voj",
      position: [7.4, -1.5, 0.5],
      label: "SB 106",
      type: "class",
      floor: 1,
    },
    {
      id: "cmpxf95ao0c8b01ocaml97khx",
      position: [7.4, -1.5, -2.5],
      label: "SB 107",
      type: "dosen",
      floor: 1,
    },
    {
      id: "cmnb91gab000tmsbc9vp9itjb",
      position: [7.4, -1.5, -3.5],
      label: "SB 109",
      type: "class",
      floor: 1,
    },
    {
      id: "cmnbrqec6000201o4myc9jdk3",
      position: [10, -1.4, 4],
      label: "Ruang Dosen TRK",
      type: "dosen",
      floor: 1,
    },
    {
      id: "cmpxepjaw0c5m01ocm4xw715n",
      position: [10, -1.4, 2.5],
      label: "SB 103",
      type: "class",
      floor: 1,
    },
    {
      id: "cmpxepjaa0c5l01ocm3genwbt",
      position: [10, -1.4, 1.5],
      label: "SB 102",
      type: "class",
      floor: 1,
    },
    {
      id: "cmpxepjbs0c5o01octel83tjn",
      position: [10, -1.4, 0.5],
      label: "SB 101",
      type: "class",
      floor: 1,
    },
    {
      id: "cmnb91gc1000umsbcjergywno",
      position: [10.19, -1.4, -3.5],
      label: "SB 108",
      type: "class",
      floor: 1,
    },
    {
      id: "cmoa65k7h0000xcbcu6nbkss",
      position: [7.4, -0.5, 3.5],
      label: "SB 204",
      type: "class",
      floor: 2,
    },
    {
      id: "cmoa65k7h0000xcbcu6nbkxx",
      position: [7.4, -0.5, 1.5],
      label: "SB 205",
      type: "class",
      floor: 2,
    },
    {
      id: "cmoa65k7h0000xcbcu6nbkll",
      position: [7.4, -0.5, 0.3],
      label: "SB 206",
      type: "class",
      floor: 2,
    },
    {
      id: "cmoa65k7h0000xcbcu6nbkgg",
      position: [7.4, -0.5, -1],
      label: "SB 207",
      type: "class",
      floor: 2,
    },
    {
      id: "cmoa65k7h0000xcbcu6nbkpp",
      position: [7.4, -0.5, -3],
      label: "SB 208",
      type: "dosen",
      floor: 2,
    },
    {
      id: "cmnbrqec6000201o4myc9jd93",
      position: [10, -0.5, 3.5],
      label: "SB 203",
      type: "class",
      floor: 2,
    },
    {
      id: "cmoa65k7h0000xcbcu6nbkx2",
      position: [10, -0.5, 1.5],
      label: "SB 202",
      type: "class",
      floor: 2,
    },
    {
      id: "cmoa65k7h0000xcbcu6nbkx3",
      position: [10, -0.5, 0.3],
      label: "SB 201",
      type: "class",
      floor: 2,
    },
    {
      id: "cmoa65k7h0000xcbcu6nbk22",
      position: [10, -0.5, -2.7],
      label: "R. Kajur EL",
      type: "dosen",
      floor: 2,
    },
  ],
  // 2) Gedung Sekolah A (Ganti key ini dengan ID asli dari Gedung Sekolah A)
  cmnb91ft9000emsbc48naesz7: [
    {
      id: "cmnbrqec6000201o4myc9jdk31212",
      position: [-2, -1, 3.5], // Koordinat yang benar-benar berbeda
      label: "SA 101",
      type: "class",
      floor: 1,
    },
    {
      id: "cmnbrqec6000201o4myc9jdk3",
      position: [-2, -1, 2.5],
      label: "SA 102",
      type: "class",
      floor: 1,
    },
    // Tambahkan marker lainnya khusus untuk Gedung Sekolah A di sini...
  ],
};

// Fallback jika masih ada yang menggunakan INITIAL_MARKERS langsung
export const INITIAL_MARKERS = BUILDING_MARKERS["cmnb91ftx000fmsbcgrg8qav7"];

export const BUILDING_LABEL_POSITIONS: Record<
  string,
  [number, number, number]
> = {
  // Gedung Utama (Default)
  cmnb91ftx000fmsbcgrg8qav7: [8.5, 3, 0],
  // Gedung Sekolah A
  cmnb91ft9000emsbc48naesz7: [-0.5, 3.3, 0],
};

export type RoomFilterId = (typeof ROOM_FILTERS)[number]["id"];
