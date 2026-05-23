"use client";

import type { Marker } from "@/components/three/scene-viewer";

export const BUILDINGS = [
  { id: "gedung-sb", label: "Gedung SB" },
  { id: "gedung-a", label: "Gedung A" },
  { id: "gedung-c", label: "Gedung C" },
] as const;

export const ROOM_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "DOSEN", label: "Lecturer Room" },
  { id: "LAB", label: "Class Room" },
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
    label: "Room 1.1",
    type: "lab",
  },
];

export const INITIAL_POWER_LOAD_HISTORY = [
  180, 195, 172, 210, 245, 230, 205, 215, 240, 225,
];

export const INITIAL_EVENT_LOGS = [
  "SYS: Core Digital Twin engine initialized successfully.",
  "NET: Secured connection to IoT gateway established on port 8443.",
  "DB: Room records & structural coordinates synchronized.",
  "IOT: Direct telemetry stream link optimized, latency 12 ms.",
];

export const LIVE_LOG_TEMPLATES = [
  (currentLoad: number) =>
    `TELEMETRY: Power load updated to ${currentLoad}W - status normal.`,
  () => "SYS: Room 1.1 environment telemetry verified (24.2°C).",
  () => "IOT: Sensor node beacon pinged - response 100% OK.",
  () => "PRESENCE: Lecturer availability map synchronized with DB.",
  () => "SYS: Calibrating active marker coordinate references...",
  () => "NET: MQTT packet exchange confirmed - 0% loss.",
];

export type BuildingId = (typeof BUILDINGS)[number]["id"];
export type RoomFilterId = (typeof ROOM_FILTERS)[number]["id"];
