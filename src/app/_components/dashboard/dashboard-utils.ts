"use client";

export function buildSparklinePoints(history: number[]) {
  if (history.length < 2) {
    return "";
  }

  const width = 300;
  const height = 80;
  const dataMax = Math.max(...history);
  const dataMin = Math.min(...history);
  
  // Beri jarak dinamis agar grafik tidak mentok atas (tambah 20% margin)
  const maxVal = dataMax === 0 ? 100 : dataMax * 1.2;
  const minVal = Math.min(0, dataMin);
  const range = Math.max(maxVal - minVal, 1);

  return history
    .map((value, index) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - ((value - minVal) / range) * (height - 10) - 5;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
