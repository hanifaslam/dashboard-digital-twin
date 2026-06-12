"use client";

import { useEffect, useState } from "react";

const MODEL_CACHE_NAME = "digital-twin-model-cache-v1";
const resolvedModelUrlCache = new Map<string, string>();
const pendingModelUrlCache = new Map<string, Promise<string>>();
const progressListeners = new Map<string, Set<(progress: number) => void>>();

interface UseCachedModelUrlResult {
  isPreparing: boolean;
  resolvedUrl: string;
  downloadProgress: number;
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

  const notifyProgress = (progress: number) => {
    const listeners = progressListeners.get(sourceUrl);
    if (listeners) {
      listeners.forEach((listener) => listener(progress));
    }
  };

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

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      // If server doesn't send content-length, assume 5MB for progress purposes
      const estimatedTotal = total > 0 ? total : 5 * 1024 * 1024;

      if (response.body) {
        const reader = response.body.getReader();
        const chunks = [];
        let loaded = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          notifyProgress(Math.min((loaded / estimatedTotal) * 100, 99));
        }

        const blob = new Blob(chunks, {
          type: response.headers.get("content-type") || "application/octet-stream",
        });

        const cacheResponse = new Response(blob, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });

        await cache.put(sourceUrl, cacheResponse);

        const objectUrl = URL.createObjectURL(blob);
        resolvedModelUrlCache.set(sourceUrl, objectUrl);
        return objectUrl;
      } else {
        await cache.put(sourceUrl, response.clone());
      }
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
    progressListeners.delete(sourceUrl);
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
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const handleProgress = (progress: number) => {
      if (isMounted) {
        setDownloadProgress(progress);
      }
    };

    let listeners = progressListeners.get(sourceUrl);
    if (!listeners) {
      listeners = new Set();
      progressListeners.set(sourceUrl, listeners);
    }
    listeners.add(handleProgress);

    const prepareModel = async () => {
      const existingResolvedUrl = resolvedModelUrlCache.get(sourceUrl);

      if (existingResolvedUrl) {
        if (isMounted) {
          setResolvedUrl(existingResolvedUrl);
          setIsPreparing(false);
          setDownloadProgress(100);
        }
        return;
      }

      if (isMounted) {
        setResolvedUrl(sourceUrl);
        setIsPreparing(true);
        setDownloadProgress(0);
      }

      try {
        const nextResolvedUrl = await buildCachedModelUrl(sourceUrl);

        if (isMounted) {
          setResolvedUrl(nextResolvedUrl);
          setDownloadProgress(100);
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
      const currentListeners = progressListeners.get(sourceUrl);
      if (currentListeners) {
        currentListeners.delete(handleProgress);
        if (currentListeners.size === 0) {
          progressListeners.delete(sourceUrl);
        }
      }
    };
  }, [sourceUrl]);

  return {
    isPreparing,
    resolvedUrl,
    downloadProgress,
  };
}
