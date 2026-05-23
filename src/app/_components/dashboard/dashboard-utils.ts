"use client";

import { LIVE_LOG_TEMPLATES } from "./dashboard-config";

export function buildSparklinePoints(history: number[]) {
  const width = 300;
  const height = 80;
  const maxVal = Math.max(...history, 280);
  const minVal = Math.min(...history, 120);
  const range = Math.max(maxVal - minVal, 1);

  return history
    .map((value, index) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - ((value - minVal) / range) * (height - 10) - 5;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function createRealtimeTick() {
  const currentLoad = Math.floor(160 + Math.random() * 90);
  const template =
    LIVE_LOG_TEMPLATES[Math.floor(Math.random() * LIVE_LOG_TEMPLATES.length)];
  const timeString = new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });

  return {
    currentLoad,
    log: `[${timeString}] ${template(currentLoad)}`,
  };
}
