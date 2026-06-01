"use client";

import { useEffect, useState } from "react";

const MODEL_CACHE_NAME = "digital-twin-model-cache-v1";
const resolvedModelUrlCache = new Map<string, string>();
const pendingModelUrlCache = new Map<string, Promise<string>>();

interface UseCachedModelUrlResult {
  isPreparing: boolean;
  resolvedUrl: string;
}

async function buildCachedModelUrl(sourceUrl: string): Promise<string> {
  const existingResolvedUrl = resolvedModelUrlCache.get(sourceUrl);

  if (existingResolvedUrl) {
    return existingResolvedUrl;
  }

  const existingPendingUrl = pendingModelUrlCache.get(sourceUrl);

  if (existingPendingUrl) {
    return existingPendingUrl;
  }

  const pendingUrl = (async () => {
    if (
      typeof window === "undefined" ||
      typeof caches === "undefined" ||
      !sourceUrl
    ) {
      return sourceUrl;
    }

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
    const objectUrl = URL.createObjectURL(modelBlob);

    resolvedModelUrlCache.set(sourceUrl, objectUrl);

    return objectUrl;
  })();

  pendingModelUrlCache.set(sourceUrl, pendingUrl);

  try {
    return await pendingUrl;
  } finally {
    pendingModelUrlCache.delete(sourceUrl);
  }
}

export function useCachedModelUrl(
  sourceUrl: string,
): UseCachedModelUrlResult {
  const cachedResolvedUrl = resolvedModelUrlCache.get(sourceUrl);
  const [resolvedUrl, setResolvedUrl] = useState(cachedResolvedUrl ?? sourceUrl);
  const [isPreparing, setIsPreparing] = useState(
    Boolean(sourceUrl) && !cachedResolvedUrl,
  );

  useEffect(() => {
    let isMounted = true;

    const prepareModel = async () => {
      const existingResolvedUrl = resolvedModelUrlCache.get(sourceUrl);

      if (existingResolvedUrl) {
        if (isMounted) {
          setResolvedUrl(existingResolvedUrl);
          setIsPreparing(false);
        }
        return;
      }

      if (isMounted) {
        setResolvedUrl(sourceUrl);
        setIsPreparing(true);
      }

      try {
        const nextResolvedUrl = await buildCachedModelUrl(sourceUrl);

        if (isMounted) {
          setResolvedUrl(nextResolvedUrl);
        }
      } catch (error) {
        console.warn("Failed to prepare cached 3D model, using source URL.", error);

        if (isMounted) {
          setResolvedUrl(sourceUrl);
        }
      } finally {
        if (isMounted) {
          setIsPreparing(false);
        }
      }
    };

    void prepareModel();

    return () => {
      isMounted = false;
    };
  }, [sourceUrl]);

  return {
    isPreparing,
    resolvedUrl,
  };
}
