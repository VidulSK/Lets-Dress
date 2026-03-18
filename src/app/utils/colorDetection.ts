export function getImageDominantColor(imageFile: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('#808080'); return; }

        // Scale down for performance while keeping decent coverage
        const MAX_DIM = 200;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Accumulate weighted HSL buckets
        // Key = hue-bucket (0-35) + sat-bucket (0-2) + light-bucket (0-2)
        const buckets: Map<string, { weightedCount: number; rSum: number; gSum: number; bSum: number }> = new Map();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue; // skip transparent

          const { h, s, l } = rgbToHsl(r, g, b);

          // Skip near-white backgrounds (high lightness + low saturation)
          if (l > 0.92 && s < 0.15) continue;
          // Skip very dark near-black
          if (l < 0.05) continue;

          // Weight: saturated, mid-lightness colours carry more signal
          const weight = (0.3 + s * 0.7) * (1 - Math.abs(l - 0.45) * 1.2);
          if (weight <= 0) continue;

          // Bucket hue in 10° steps, saturation in 3 tiers, lightness in 3 tiers
          const hBucket = Math.round(h / 10) % 36;
          const sBucket = s < 0.2 ? 0 : s < 0.55 ? 1 : 2;
          const lBucket = l < 0.3 ? 0 : l < 0.65 ? 1 : 2;
          const key = `${hBucket}_${sBucket}_${lBucket}`;

          const bucket = buckets.get(key) ?? { weightedCount: 0, rSum: 0, gSum: 0, bSum: 0 };
          bucket.weightedCount += weight;
          bucket.rSum += r * weight;
          bucket.gSum += g * weight;
          bucket.bSum += b * weight;
          buckets.set(key, bucket);
        }

        // Find the heaviest bucket
        let best = { weightedCount: 0, rSum: 128, gSum: 128, bSum: 128 };
        for (const b of buckets.values()) {
          if (b.weightedCount > best.weightedCount) best = b;
        }

        const r = Math.round(best.rSum / best.weightedCount);
        const g = Math.round(best.gSum / best.weightedCount);
        const b2 = Math.round(best.bSum / best.weightedCount);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
        resolve(hex);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  });
}

// ── RGB → HSL conversion ──────────────────────────────────────────────────────
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s, l };
}

// ── Named colour reference points (multiple anchors per family) ──────────────
// Each entry maps a colour name to HSL ranges it occupies.
const NAMED_COLORS: { name: string; r: number; g: number; b: number }[] = [
  // Pink family
  { name: 'pink', r: 255, g: 182, b: 193 },
  { name: 'pink', r: 255, g: 150, b: 170 },
  { name: 'pink', r: 220, g: 140, b: 160 },
  // Red family
  { name: 'red',  r: 210, g:  30, b:  30 },
  { name: 'red',  r: 180, g:  20, b:  20 },
  { name: 'red',  r: 200, g:  50, b:  50 },
  // Orange family
  { name: 'orange', r: 235, g: 120, b:  20 },
  { name: 'orange', r: 250, g: 150, b:  50 },
  { name: 'orange', r: 220, g: 100, b:  10 },
  // Beige / cream
  { name: 'beige', r: 235, g: 215, b: 185 },
  { name: 'beige', r: 220, g: 200, b: 165 },
  { name: 'beige', r: 245, g: 225, b: 195 },
  // Yellow
  { name: 'yellow', r: 245, g: 225, b:  30 },
  { name: 'yellow', r: 255, g: 240, b:  60 },
  { name: 'yellow', r: 230, g: 210, b:  20 },
  // Green family
  { name: 'green', r:  50, g: 160, b:  50 },
  { name: 'green', r:  80, g: 180, b:  80 },
  { name: 'green', r:  30, g: 120, b:  30 },
  { name: 'green', r: 100, g: 170, b:  60 },   // olive-ish
  // Light blue / sky blue
  { name: 'light blue', r: 130, g: 195, b: 235 },
  { name: 'light blue', r: 160, g: 210, b: 245 },
  { name: 'light blue', r: 110, g: 175, b: 220 },
  // Dark blue / navy
  { name: 'dark blue', r:  25, g:  50, b: 160 },
  { name: 'dark blue', r:  10, g:  30, b: 120 },
  { name: 'dark blue', r:  20, g:  40, b: 100 },   // navy
  { name: 'dark blue', r:  40, g:  70, b: 180 },
  // Purple
  { name: 'purple', r: 140, g:  50, b: 200 },
  { name: 'purple', r: 110, g:  40, b: 170 },
  { name: 'purple', r: 160, g:  80, b: 220 },
  { name: 'purple', r: 100, g:  30, b: 140 },
  // Brown
  { name: 'brown', r: 130, g:  75, b:  40 },
  { name: 'brown', r: 100, g:  55, b:  25 },
  { name: 'brown', r: 160, g: 100, b:  60 },
  { name: 'brown', r:  80, g:  50, b:  30 },
  // Gray
  { name: 'gray', r: 150, g: 150, b: 150 },
  { name: 'gray', r: 120, g: 120, b: 120 },
  { name: 'gray', r: 180, g: 180, b: 180 },
  // White (kept for edge cases)
  { name: 'white', r: 240, g: 240, b: 240 },
  { name: 'white', r: 255, g: 255, b: 255 },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
}

// Perceptual colour distance using weighted Euclidean in RGB
function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  // Weighted to approximate human perception (red ~0.3, green ~0.59, blue ~0.11)
  return Math.sqrt(
    2 * (r1 - r2) ** 2 +
    4 * (g1 - g2) ** 2 +
    3 * (b1 - b2) ** 2  // slightly boost blue to help dark-blue vs purple
  );
}

export function getClosestColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);

  // Special-case: very low saturation → gray or white
  const { s, l } = rgbToHsl(r, g, b);
  if (s < 0.12) {
    return l > 0.80 ? 'white' : 'gray';
  }

  let minDist = Infinity;
  let closest = 'gray';
  for (const nc of NAMED_COLORS) {
    const dist = colorDist(r, g, b, nc.r, nc.g, nc.b);
    if (dist < minDist) {
      minDist = dist;
      closest = nc.name;
    }
  }
  return closest;
}
