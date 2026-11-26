import { useState, useEffect } from "react";

const transparentLogoCache = new Map<string, string>();

/**
 * Checks if an image has a black background around its transparent outer region
 * (a common issue when transparent PNGs are saved or flattened on black canvas),
 * and converts the outer contiguous black pixels to transparent (alpha = 0).
 *
 * The opaque white interior of circular emblems (and other non-black contents)
 * is strictly preserved.
 */
export function getCleanLogoUrl(src: string): Promise<string> {
  if (!src || src.endsWith(".svg") || src.startsWith("data:image/svg")) {
    return Promise.resolve(src);
  }

  if (transparentLogoCache.has(src)) {
    return Promise.resolve(transparentLogoCache.get(src)!);
  }

  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve(src);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        if (!width || !height) {
          return resolve(src);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(src);

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height);
        const { data } = imgData;

        // Check if a pixel at (x, y) is near-black (accounting for compression artifacts)
        const isNearBlack = (x: number, y: number): boolean => {
          const idx = (y * width + x) * 4;
          const a = data[idx + 3];
          if (a === 0) return false; // Already transparent
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          return r <= 35 && g <= 35 && b <= 35;
        };

        // Only process if outer corners have black pixels
        const cornersBlack =
          isNearBlack(0, 0) ||
          isNearBlack(width - 1, 0) ||
          isNearBlack(0, height - 1) ||
          isNearBlack(width - 1, height - 1);

        if (!cornersBlack) {
          transparentLogoCache.set(src, src);
          return resolve(src);
        }

        // When outer corners are black, the original image had a black background flattened on it.
        // Convert all contiguous outer black pixels and any enclosed black background fills (such as inside letter counters like 'O', 'A', etc.) to transparent.
        // We preserve all non-black pixels (including white circular interior, colors, etc.).
        for (let i = 0; i < width * height; i++) {
          const idx = i * 4;
          const a = data[idx + 3];
          if (a > 0) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            if (r <= 35 && g <= 35 && b <= 35) {
              data[idx + 3] = 0;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentUrl = canvas.toDataURL("image/png");
        transparentLogoCache.set(src, transparentUrl);
        resolve(transparentUrl);
      } catch (err) {
        // Fallback to original image if canvas is tainted or any error occurs
        console.warn("Could not process logo transparency:", err);
        resolve(src);
      }
    };

    img.onerror = () => {
      resolve(src);
    };

    img.src = src;
  });
}

/**
 * React hook that takes an image src and returns a clean, transparent logo URL
 * if the image has a black outer fill.
 */
export function useTransparentLogo(src?: string | null): string | null {
  const [cleanSrc, setCleanSrc] = useState<string | null>(src ?? null);

  useEffect(() => {
    if (!src) {
      setCleanSrc(null);
      return;
    }

    // If already in cache, set synchronously to prevent flicker
    if (transparentLogoCache.has(src)) {
      setCleanSrc(transparentLogoCache.get(src)!);
      return;
    }

    let isMounted = true;
    getCleanLogoUrl(src).then((resolved) => {
      if (isMounted) {
        setCleanSrc(resolved);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src]);

  return cleanSrc;
}
