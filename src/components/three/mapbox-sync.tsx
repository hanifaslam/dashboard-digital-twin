import { useFrame, useThree } from "@react-three/fiber";
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

  useFrame((state) => {
    const map = globalMapboxInstance;
    if (!map) return;
    const controls = state.controls as unknown as OrbitControlsImpl;
    if (!controls) return;

    const target = controls.target;
    const camPos = state.camera.position;

    // 1. Center (Dikalikan skala agar pan/geser map terasa)
    const lng = baseLng + target.x * MODEL_SCALE_METERS * metersToLng;
    const lat = baseLat - target.z * MODEL_SCALE_METERS * metersToLat;

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
