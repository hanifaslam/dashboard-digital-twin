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
    position: [1.4, -1.5, -4.5],
    label: "Ruang Dosen IK",
    type: "dosen",
  },
  {
    id: "cmpxepjbc0c5n01oc9doa8k66",
    position: [1.4, -1.5, -3.5],
    label: "SB 104",
    type: "class",
  },
  {
    id: "cmpxepjc80c5p01ocf5m09zfo",
    position: [1.4, -1.5, -2.5],
    label: "SB 105",
    type: "class",
  },
  {
    id: "cmpxepjco0c5q01oc69rr8voj",
    position: [1.4, -1.5, -1.5],
    label: "SB 106",
    type: "class",
  },
  {
    id: "cmpxf95ao0c8b01ocaml97khx",
    position: [1.4, -1.5, 1.25],
    label: "SB 107",
    type: "dosen",
  },
  {
    id: "cmnb91gab000tmsbc9vp9itjb",
    position: [1.4, -1.5, 3.24],
    label: "SB 109",
    type: "class",
  },
  {
    id: "cmnbrqec6000201o4myc9jdk3",
    position: [-1.19, -1.4, -4.25],
    label: "Ruang Dosen TRK",
    type: "dosen",
  },
  {
    id: "cmpxepjaw0c5m01ocm4xw715n",
    position: [-1.19, -1.4, -3.25],
    label: "SB 103",
    type: "class",
  },
  {
    id: "cmpxepjaa0c5l01ocm3genwbt",
    position: [-1.19, -1.4, -2.25],
    label: "SB 102",
    type: "class",
  },
  {
    id: "cmpxepjbs0c5o01octel83tjn",
    position: [-1.19, -1.4, -1.25],
    label: "SB 101",
    type: "class",
  },
  {
    id: "cmnb91gc1000umsbcjergywno",
    position: [-1.19, -1.4, 3.25],
    label: "SB 108",
    type: "class",
  },
];

export type RoomFilterId = (typeof ROOM_FILTERS)[number]["id"];
