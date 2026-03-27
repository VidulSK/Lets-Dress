// ── Color Utility: hex ↔ RGB ────────────────────────────────────────────────
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
}

// ── HSL → 13-category label mapper ──────────────────────────────────────────
// Receives perceptually-accurate HSL from The Color API and returns one of:
// white | grey | black | red | orange | brown | yellow | green |
// light blue | dark blue | purple | pink | beige
export function mapHSLToCategory(h: number, s: number, l: number): string {
  // Achromatic colours (near-zero saturation)
  if (s < 10) {
    if (l >= 85) return 'white';
    if (l <= 18) return 'black';
    return 'grey';
  }

  // Very dark → black
  if (l <= 12) return 'black';
  // Very light + low saturation → white
  if (l >= 90 && s < 25) return 'white';

  // --- Chromatic ---
  // Beige: warm hue, very light, low-medium saturation
  if (h >= 25 && h <= 55 && s >= 10 && s <= 45 && l >= 70) return 'beige';

  // Brown: warm-orange hue, medium dark, moderate saturation
  if (h >= 10 && h <= 45 && s >= 20 && s <= 70 && l >= 15 && l <= 50) return 'brown';

  // Red: hue near 0 / near 360
  if ((h >= 345 || h < 15) && s >= 40) return 'red';

  // Orange: hue 15–40, fairly saturated
  if (h >= 15 && h < 40 && s >= 40) return 'orange';

  // Yellow: hue 40–75
  if (h >= 40 && h < 75 && s >= 30) return 'yellow';

  // Green: hue 75–165
  if (h >= 75 && h < 165 && s >= 20) return 'green';

  // Light blue: hue 165–220, lighter
  if (h >= 165 && h < 220 && l >= 45) return 'light blue';

  // Dark blue: hue 165–270, darker
  if (h >= 165 && h < 270 && l < 45) return 'dark blue';

  // Purple: hue 270–320
  if (h >= 270 && h < 320 && s >= 20) return 'purple';

  // Pink: hue 320–345, light/medium
  if (h >= 320 && h < 345 && s >= 20) return 'pink';

  // Fallback: map by dominant channel
  if (l >= 85) return 'white';
  if (l <= 18) return 'black';
  if (s < 20) return 'grey';
  return 'grey';
}

// ── External Color API call ───────────────────────────────────────────────────
// Calls The Color API (free, no key required) to get perceptually accurate
// HSL for the sampled hex, then maps to our 13 categories.
export async function getColorNameFromApi(hex: string): Promise<string> {
  const clean = hex.replace('#', '');
  try {
    const res = await fetch(`https://www.thecolorapi.com/id?hex=${clean}&format=json`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const h = data?.hsl?.h ?? 0;
    const s = data?.hsl?.s ?? 0;
    const l = data?.hsl?.l ?? 50;
    return mapHSLToCategory(h, s, l);
  } catch {
    // Fallback: derive HSL ourselves from the hex
    const { r, g, b } = hexToRgb(hex);
    const rf = r / 255, gf = g / 255, bf = b / 255;
    const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
      else if (max === gf) h = ((bf - rf) / d + 2) / 6;
      else h = ((rf - gf) / d + 4) / 6;
    }
    return mapHSLToCategory(Math.round(h * 360), Math.round(s * 100), Math.round(l * 100));
  }
}