"use client";

export function buildSparklinePoints(history: number[]) {
  if (history.length < 2) {
    return "";
  }

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
