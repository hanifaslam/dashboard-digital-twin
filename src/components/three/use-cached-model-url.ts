"use client";

import { useEffect, useState } from "react";

const MODEL_CACHE_NAME = "digital-twin-model-cache-v1";

interface UseCachedModelUrlResult {
  isPreparing: boolean;
  resolvedUrl: string;
}

export function useCachedModelUrl(
  sourceUrl: string,
): UseCachedModelUrlResult {
  const [resolvedUrl, setResolvedUrl] = useState(sourceUrl);
  const [isPreparing, setIsPreparing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const cleanupObjectUrl = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    const prepareModel = async () => {
      if (isMounted) {
        setResolvedUrl(sourceUrl);
        setIsPreparing(true);
      }

      if (
        typeof window === "undefined" ||
        typeof caches === "undefined" ||
        !sourceUrl
      ) {
        if (isMounted) {
          setResolvedUrl(sourceUrl);
          setIsPreparing(false);
        }
        return;
      }

      try {
        const cache = await caches.open(MODEL_CACHE_NAME);
        let response = await cache.match(sourceUrl);

        if (!response) {
          response = await fetch(sourceUrl);

          if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.status}`);
          }

          await cache.put(sourceUrl, response.clone());
        }

        const modelBlob = await response.blob();
        objectUrl = URL.createObjectURL(modelBlob);

        if (isMounted) {
          setResolvedUrl(objectUrl);
        }
      } catch (error) {
        console.warn("Failed to prepare cached 3D model, using source URL.", error);

        if (isMounted) {
          setResolvedUrl(sourceUrl);
        }
      } finally {
        if (isMounted) {
          setIsPreparing(false);
        } else {
          cleanupObjectUrl();
        }
      }
    };

    void prepareModel();

    return () => {
      isMounted = false;
      cleanupObjectUrl();
    };
  }, [sourceUrl]);

  return {
    isPreparing,
    resolvedUrl,
  };
}
