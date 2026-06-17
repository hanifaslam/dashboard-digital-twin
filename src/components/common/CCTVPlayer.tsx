"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Video } from "lucide-react";

type CCTVPlayerProps = {
  streamKey: string;
  className?: string;
  controls?: boolean;
};

export default function CCTVPlayer({ streamKey, className, controls = true }: CCTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_CCTV_BASE_URL;

  const [isOffline, setIsOffline] = useState(!baseUrl);
  const [prevStreamKey, setPrevStreamKey] = useState(streamKey);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const retryCountRef = useRef(0);

  if (streamKey !== prevStreamKey) {
    setPrevStreamKey(streamKey);
    setIsOffline(!baseUrl);
  }

  useEffect(() => {
    let isSubscribed = true;
    const video = videoRef.current;
    if (!video || !baseUrl) return;

    const url = `${baseUrl}/${streamKey}/index.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDuration: 2,
        liveMaxLatencyDuration: 8,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
         retryCountRef.current = 0;
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("HLS fatal error:", data);
          if (isSubscribed) setIsOffline(true);
          
          if (retryCountRef.current < 5) {
            setTimeout(() => {
              if (isSubscribed) {
                retryCountRef.current += 1;
                setIsOffline(false);
                setRetryTrigger(r => r + 1);
              }
            }, 5000);
          }
        }
      });

      return () => {
        isSubscribed = false;
        hls.destroy();
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;

      const handleLoadedData = () => {
        retryCountRef.current = 0;
      };

      const handleError = () => {
        if (isSubscribed) setIsOffline(true);
        if (retryCountRef.current < 5) {
          setTimeout(() => {
            if (isSubscribed) {
              retryCountRef.current += 1;
              setIsOffline(false);
              setRetryTrigger(r => r + 1);
            }
          }, 5000);
        }
      };
      video.addEventListener("error", handleError);
      video.addEventListener("loadeddata", handleLoadedData);

      return () => {
        isSubscribed = false;
        video.removeEventListener("error", handleError);
        video.removeEventListener("loadeddata", handleLoadedData);
      };
    }
  }, [streamKey, baseUrl, retryTrigger]);

  return (
    <div
      className={
        className ??
        "aspect-video w-full rounded-xl bg-black relative overflow-hidden"
      }
    >
      <video
        ref={videoRef}
        controls={controls}
        autoPlay
        muted
        playsInline
        className={`h-full w-full object-cover ${isOffline ? "hidden" : "block"}`}
      />

      {isOffline && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80 z-10">
          <Video className="mb-2 h-6 w-6 text-cyan-500/50" />
          <span className="text-xs text-cyan-500/50">Camera offline</span>
        </div>
      )}
    </div>
  );
}
