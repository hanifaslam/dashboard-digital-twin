import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { globalMapboxInstance } from "./mapbox-scene";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function MapboxSync({
  baseLng,
  baseLat,
}: {
  baseLng: number;
  baseLat: number;
}) {
  const { camera, gl } = useThree();

  // Kalibrasi skala: 1 unit di Three.js = X meter di dunia nyata.
  // Angka 71 ini didapat agar distance=10 sinkron dengan zoom=17.
  // Bisa diperbesar/diperkecil jika pergerakan peta masih kurang pas.
  const MODEL_SCALE_METERS = 50;

  // Kalibrasi putaran: Jika arah gedung 3D tidak sejajar dengan peta Mapbox,
  // ubah angka ini (dalam derajat, misal 15, -20, 90, dsb).
  const BEARING_OFFSET = -89;

  const metersToLat = 1 / 111111;
  const metersToLng = 1 / (111111 * Math.cos((baseLat * Math.PI) / 180));

  const lastUpdate = useRef({ lng: 0, lat: 0, zoom: 0, pitch: 0, bearing: 0 });

  useFrame((state) => {
    const map = globalMapboxInstance;
    if (!map) return;
    const controls = state.controls as unknown as OrbitControlsImpl;
    if (!controls) return;

    const target = controls.target;
    const camPos = state.camera.position;

    // 1. Center (Dikalikan skala agar pan/geser map terasa)
    // Rotasi vektor target berdasarkan BEARING_OFFSET agar arah geser 3D sinkron dengan rotasi peta
    const theta = (BEARING_OFFSET * Math.PI) / 180;
    const rotatedX = target.x * Math.cos(theta) - target.z * Math.sin(theta);
    const rotatedZ = target.x * Math.sin(theta) + target.z * Math.cos(theta);

    const lng = baseLng + rotatedX * MODEL_SCALE_METERS * metersToLng;
    const lat = baseLat - rotatedZ * MODEL_SCALE_METERS * metersToLat;

    // 2. Zoom
    const distance = camPos.distanceTo(target);
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const screenHeight = gl.domElement.clientHeight;

    const visibleHeightAtTarget =
      2 * distance * Math.tan((fov / 2) * (Math.PI / 180)) * MODEL_SCALE_METERS;
    const pixelsPerMeter = screenHeight / visibleHeightAtTarget;

    const metersPerPixel = 1 / pixelsPerMeter;
    const equatorCircumference = 40075016;
    const zoomScale =
      (equatorCircumference * Math.cos((lat * Math.PI) / 180)) /
      (512 * metersPerPixel);
    const zoom = Math.log2(zoomScale);

    // 3. Pitch
    const vY = camPos.y - target.y;
    const dH = Math.sqrt(
      Math.pow(camPos.x - target.x, 2) + Math.pow(camPos.z - target.z, 2),
    );
    const angleFromHorizontal = Math.atan2(vY, dH) * (180 / Math.PI);
    const pitch = Math.max(0, Math.min(85, 90 - angleFromHorizontal));

    // 4. Bearing (Ditambah kalibrasi putaran)
    const dx = target.x - camPos.x;
    const dz = target.z - camPos.z;
    const bearing = Math.atan2(dx, -dz) * (180 / Math.PI) + BEARING_OFFSET;

    // Hanya panggil update Mapbox jika kamera benar-benar bergerak
    // Ini menghemat CPU hingga 90% saat kita sekadar diam / hovering kursor
    const prev = lastUpdate.current;
    if (
      Math.abs(prev.lng - lng) < 0.000001 &&
      Math.abs(prev.lat - lat) < 0.000001 &&
      Math.abs(prev.zoom - zoom) < 0.001 &&
      Math.abs(prev.pitch - pitch) < 0.1 &&
      Math.abs(prev.bearing - bearing) < 0.1
    ) {
      return;
    }

    lastUpdate.current = { lng, lat, zoom, pitch, bearing };

    // Update Mapbox instantly without React re-renders
    map.jumpTo({
      center: [lng, lat],
      zoom,
      pitch,
      bearing,
    });
  });

  return null;
}
