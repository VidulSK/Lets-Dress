import chroma from 'chroma-js';

// ── Dominant colour extraction (used on full-image upload auto-detect) ────────
export function getImageDominantColor(imageFile: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('#1a1a1a'); return; }

        const MAX_DIM = 200;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const buckets: Map<string, { weightedCount: number; rSum: number; gSum: number; bSum: number }> = new Map();
        let darkCount = 0;
        let totalOpaque = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          totalOpaque++;

          // Count black pixels separately
          const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
          if (maxC <= 45 && (maxC - minC) < 15) { darkCount++; continue; }

          // Skip near-white backgrounds
          const lit = (maxC + minC) / 2 / 255;
          const sat = maxC === minC ? 0 : (lit > 0.5
            ? (maxC - minC) / (510 - maxC - minC)
            : (maxC - minC) / (maxC + minC));
          if (lit > 0.92 && sat < 0.15) continue;

          const weight = (0.3 + sat * 0.7) * (1 - Math.abs(lit - 0.45) * 1.2);
          if (weight <= 0) continue;

          // Bucket hue in 10° steps
          const hBucket = (() => {
            if (maxC === minC) return 0;
            let h = 0;
            if (maxC === r) h = ((g - b) / (maxC - minC) + (g < b ? 6 : 0)) / 6;
            else if (maxC === g) h = ((b - r) / (maxC - minC) + 2) / 6;
            else h = ((r - g) / (maxC - minC) + 4) / 6;
            return Math.round(h * 360 / 10) % 36;
          })();
          const sBucket = sat < 0.20 ? 0 : sat < 0.55 ? 1 : 2;
          const lBucket = lit < 0.30 ? 0 : lit < 0.65 ? 1 : 2;
          const key = `${hBucket}_${sBucket}_${lBucket}`;

          const bkt = buckets.get(key) ?? { weightedCount: 0, rSum: 0, gSum: 0, bSum: 0 };
          bkt.weightedCount += weight;
          bkt.rSum += r * weight;
          bkt.gSum += g * weight;
          bkt.bSum += b * weight;
          buckets.set(key, bkt);
        }

        // If >40% of pixels are black-range, classify as black
        if (totalOpaque > 0 && darkCount / totalOpaque > 0.40) {
          resolve('#1a1a1a'); return;
        }

        let best: { weightedCount: number; rSum: number; gSum: number; bSum: number } | null = null;
        for (const bkt of buckets.values()) {
          if (!best || bkt.weightedCount > best.weightedCount) best = bkt;
        }

        if (!best || best.weightedCount === 0) {
          resolve(darkCount > 0 ? '#1a1a1a' : '#808080'); return;
        }

        const w = best.weightedCount;
        const r = Math.round(best.rSum / w);
        const g = Math.round(best.gSum / w);
        const b = Math.round(best.bSum / w);
        resolve(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  });
}

// ── Hex → RGB helper ──────────────────────────────────────────────────────────
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
}

// ── Colour naming — exact RGB range + logic rules ─────────────────────────────
//
// Rules are tested in priority order (most specific first).
// Each rule has:
//   - ranges: inclusive [min, max] for r, g, b
//   - logic: additional boolean condition on top of the ranges
//
// Fallback for unmatched pixels uses HSL lightness/saturation to return
// white / gray as appropriate.
//
export function getClosestColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // ── 1. Black ──────────────────────────────────────────────────────────────
  if (
    r >= 0 && r <= 45 &&
    g >= 0 && g <= 45 &&
    b >= 0 && b <= 45 &&
    (max - min) < 15
  ) return 'black';

  // ── 2. Red ────────────────────────────────────────────────────────────────
  if (
    r >= 150 && r <= 255 &&
    g >= 0   && g <= 75  &&
    b >= 0   && b <= 75  &&
    r > g + 100 && r > b + 100
  ) return 'red';

  // ── 3. Orange ─────────────────────────────────────────────────────────────
  if (
    r >= 200 && r <= 255 &&
    g >= 100 && g <= 180 &&
    b >= 0   && b <= 80  &&
    r > g && g > b
  ) return 'orange';

  // ── 4. Brown ──────────────────────────────────────────────────────────────
  if (
    r >= 80  && r <= 160 &&
    g >= 40  && g <= 110 &&
    b >= 0   && b <= 60  &&
    r > g && g > b && r < 180
  ) return 'brown';

  // ── 5. Yellow ─────────────────────────────────────────────────────────────
  if (
    r >= 200 && r <= 255 &&
    g >= 200 && g <= 255 &&
    b >= 0   && b <= 100 &&
    Math.abs(r - g) < 40 && b < r - 100
  ) return 'yellow';

  // ── 6. Green ──────────────────────────────────────────────────────────────
  if (
    r >= 0   && r <= 130 &&
    g >= 130 && g <= 255 &&
    b >= 0   && b <= 130 &&
    g > r + 30 && g > b + 30
  ) return 'green';

  // ── 7. Light Blue ─────────────────────────────────────────────────────────
  if (
    r >= 100 && r <= 180 &&
    g >= 180 && g <= 230 &&
    b >= 220 && b <= 255 &&
    b >= g && g > r && (r + g + b) > 500
  ) return 'light blue';

  // ── 8. Dark Blue ──────────────────────────────────────────────────────────
  if (
    r >= 0   && r <= 70  &&
    g >= 0   && g <= 100 &&
    b >= 120 && b <= 255 &&
    b > r + 50 && b > g + 30
  ) return 'dark blue';

  // ── 9. Purple ─────────────────────────────────────────────────────────────
  if (
    r >= 100 && r <= 190 &&
    g >= 0   && g <= 100 &&
    b >= 120 && b <= 255 &&
    g < r && g < b
  ) return 'purple';

  // ── 10. Pink ──────────────────────────────────────────────────────────────
  if (
    r >= 200 && r <= 255 &&
    g >= 100 && g <= 190 &&
    b >= 150 && b <= 230 &&
    r > b && b > g
  ) return 'pink';

  // ── 11. Beige ─────────────────────────────────────────────────────────────
  if (
    r >= 220 && r <= 255 &&
    g >= 200 && g <= 240 &&
    b >= 170 && b <= 220 &&
    r > g && g > b && (r - b) < 60
  ) return 'beige';

  // ── Fallback: achromatic ───────────────────────────────────────────────────
  const lit = (max + min) / 510;        // 0..1 lightness
  const sat = max === min ? 0
    : (lit > 0.5 ? (max - min) / (510 - max - min) : (max - min) / (max + min));

  if (lit > 0.85)    return 'white';
  if (sat < 0.12)    return 'gray';

  // Last resort — closest by simple hue
  return 'gray';
}
