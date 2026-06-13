"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Map, { MapProvider, useMap } from "react-map-gl/mapbox";
import SceneViewer from "./scene-viewer";
import { useEffect, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { MapStyleSelector, MapStyleId, MAP_STYLES } from "./map-style-selector";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export let globalMapboxInstance: MapboxMap | null = null;

function Mapbox3DBuildings() {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;
    const mbMap = map.getMap() as MapboxMap;
    globalMapboxInstance = mbMap;

    mbMap.on("style.load", () => {
      if (mbMap.getLayer("3d-buildings")) {
        return; // Mencegah error duplikat layer saat React hot-reload
      }

      // Insert the layer beneath any symbol layer.
      const layers = mbMap.getStyle()?.layers;
      let labelLayerId;
      if (layers) {
        for (let i = 0; i < layers.length; i++) {
          if (
            layers[i].type === "symbol" &&
            (layers[i] as { layout?: { "text-field"?: unknown } }).layout?.[
              "text-field"
            ]
          ) {
            labelLayerId = layers[i].id;
            break;
          }
        }
      }

      /* 
      Fitur gedung 3D bawaan Mapbox dimatikan sementara agar tidak bertabrakan dengan gedung Digital Twin 
      mbMap.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId,
      );
      */
    });
  }, [map]);

  return null;
}

export default function MapboxScene(
  props: React.ComponentProps<typeof SceneViewer>,
) {
  const [selectedStyleId, setSelectedStyleId] = useState<MapStyleId>("auto");
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12",
  );
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    // Mengecek apakah waktu saat ini adalah malam hari (18:00 - 05:59)
    const updateMapStyle = () => {
      const hour = new Date().getHours();
      const night = hour >= 18 || hour < 6;
      setIsNight(night);

      if (selectedStyleId === "auto") {
        setMapStyle(
          night
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/streets-v12",
        );
      } else {
        const style = MAP_STYLES.find((s) => s.id === selectedStyleId);
        if (style) {
          setMapStyle(style.url);
          // Sinkronisasi isNight agar pencahayaan ThreeJS ikut menyesuaikan tema peta
          if (style.id === "dark" || style.id === "satellite") {
            setIsNight(true);
          } else if (
            style.id === "light" ||
            style.id === "streets" ||
            style.id === "outdoors"
          ) {
            setIsNight(false);
          }
        }
      }
    };

    updateMapStyle();
    // Update setiap 1 menit untuk cek perubahan siang/malam
    const interval = setInterval(updateMapStyle, 60000);
    return () => clearInterval(interval);
  }, [selectedStyleId]);

  return (
    <MapProvider>
      <div className="relative w-full h-full bg-slate-900">
        <style>{`
          .mapboxgl-ctrl-logo {
            display: none !important;
          }
        `}</style>
        <Map
          id="main-map"
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: 110.43436293386422,
            latitude: -7.052528631105904,
            zoom: 17,
            pitch: 45,
            bearing: 0,
          }}
          mapStyle={mapStyle}
          interactive={false}
          attributionControl={false}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Mapbox3DBuildings />
        </Map>

        {/* Overlay ThreeJS on top */}
        <div className="absolute inset-0 pointer-events-auto z-10">
          <SceneViewer
            {...props}
            isNight={isNight}
            currentStyleId={selectedStyleId}
            onStyleSelect={setSelectedStyleId}
          />
        </div>
      </div>
    </MapProvider>
  );
}
