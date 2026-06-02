"use client";

import type { Marker } from "@/components/three/scene-viewer";

export const ROOM_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "DOSEN", label: "Lecturer Room" },
  { id: "CLASS", label: "Class Room" },
] as const;

export const INITIAL_MARKERS: Marker[] = [
  {
    id: "cmoa65k7h0000xcbcu6nbkt9o",
    position: [1.19, -1.5, -4.25],
    label: "Ruang Dosen IK",
    type: "dosen",
  },
  {
    id: "cmnb91gab000tmsbc9vp9itjb",
    position: [1.19, -1.5, 3.24],
    label: "SB 109",
    type: "class",
  },
];

export type RoomFilterId = (typeof ROOM_FILTERS)[number]["id"];
