"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { socket } from "@/lib/socket";

type EnergyPoint = {
  timestamp: string;
  total_power: number;
};

type SensorDataPayload = {
  room_id: string;
  device_id: string;
  device_name?: string;
  device_type?: string;
  sensor_type?: string;
  power?: number | null;
  timestamp?: string;
};

const MAX_POINTS = 20;

export function useLiveEnergyChart(roomIds: string[]) {
  const [points, setPoints] = useState<EnergyPoint[]>([]);
  const allowedRoomIds = useMemo(() => new Set(roomIds), [roomIds]);
  
  const powerByDeviceRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleSensorData = (payload: SensorDataPayload) => {
      if (payload.sensor_type !== "PZEM") return;
      if (payload.power === null || payload.power === undefined) return;
      if (!allowedRoomIds.has(payload.room_id)) return;

      powerByDeviceRef.current[payload.device_id] = Number(payload.power);

      const totalPower = Object.values(powerByDeviceRef.current).reduce(
        (sum, value) => sum + value,
        0
      );

      setPoints((prev) => {
        const next = [
          ...prev,
          {
            timestamp: payload.timestamp || new Date().toISOString(),
            total_power: totalPower,
          },
        ];

        return next.slice(-MAX_POINTS);
      });
    };

    socket.on("sensor-data", handleSensorData);

    return () => {
      socket.off("sensor-data", handleSensorData);
    };
  }, [allowedRoomIds]);

  return points;
}
