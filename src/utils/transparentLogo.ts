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

        // Flood-fill from outer edges to clear contiguous black background pixels
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        // Seed flood-fill from horizontal borders
        for (let x = 0; x < width; x++) {
          if (isNearBlack(x, 0)) {
            const idx = x;
            visited[idx] = 1;
            queue.push(idx);
          }
          if (isNearBlack(x, height - 1)) {
            const idx = (height - 1) * width + x;
            visited[idx] = 1;
            queue.push(idx);
          }
        }

        // Seed flood-fill from vertical borders
        for (let y = 1; y < height - 1; y++) {
          if (isNearBlack(0, y)) {
            const idx = y * width;
            visited[idx] = 1;
            queue.push(idx);
          }
          if (isNearBlack(width - 1, y)) {
            const idx = y * width + (width - 1);
            visited[idx] = 1;
            queue.push(idx);
          }
        }

        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          const cx = curr % width;
          const cy = (curr / width) | 0;

          // Set alpha to 0 (fully transparent)
          data[curr * 4 + 3] = 0;

          const neighbors = [
            cx > 0 ? curr - 1 : -1,
            cx < width - 1 ? curr + 1 : -1,
            cy > 0 ? curr - width : -1,
            cy < height - 1 ? curr + width : -1,
          ];

          for (let i = 0; i < 4; i++) {
            const n = neighbors[i];
            if (n !== -1 && !visited[n]) {
              const nx = n % width;
              const ny = (n / width) | 0;
              if (isNearBlack(nx, ny)) {
                visited[n] = 1;
                queue.push(n);
              }
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
