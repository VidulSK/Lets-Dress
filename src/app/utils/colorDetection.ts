type ColorRule = {
  color: string;
  anchor: { r: number; g: number; b: number }; // Added anchor for Tier 2 fallback
  ranges: { r: [number, number], g: [number, number], b: [number, number] };
  logic: (r: number, g: number, b: number, max: number, min: number) => boolean;
};

const COLOR_RULES: ColorRule[] = [
  {
    color: "white",
    anchor: { r: 255, g: 255, b: 255 },
    ranges: { r: [210, 255], g: [210, 255], b: [210, 255] },
    logic: (r, g, b, max, min) => min > 220 && (max - min) < 20
  },
  {
    color: "grey",
    anchor: { r: 128, g: 128, b: 128 },
    ranges: { r: [40, 220], g: [40, 220], b: [40, 220] },
    logic: (r, g, b, max, min) => (max - min) < 25 && max >= 40 && max <= 220
  },
  {
    color: "black",
    anchor: { r: 0, g: 0, b: 0 },
    ranges: { r: [0, 60], g: [0, 60], b: [0, 60] },
    logic: (r, g, b, max, min) => max < 45 || (max < 60 && (max - min) < 15)
  },
  {
    color: "red",
    anchor: { r: 255, g: 0, b: 0 },
    ranges: { r: [100, 255], g: [0, 100], b: [0, 100] },
    logic: (r, g, b, max, min) => r === max && g < (r * 0.6) && b < (r * 0.6)
  },
  {
    color: "orange",
    anchor: { r: 255, g: 165, b: 0 },
    ranges: { r: [150, 255], g: [70, 180], b: [0, 80] },
    logic: (r, g, b, max, min) => r === max && g > (r * 0.4) && g < (r * 0.8) && b < (g * 0.8)
  },
  {
    color: "brown",
    anchor: { r: 139, g: 69, b: 19 },
    ranges: { r: [60, 180], g: [30, 120], b: [0, 80] },
    logic: (r, g, b, max, min) => r === max && max <= 180 && g > (r * 0.3) && g < (r * 0.8) && b < g
  },
  {
    color: "coral",
    anchor: { r: 255, g: 127, b: 80 },
    ranges: { r: [200, 255], g: [80, 170], b: [40, 120] },
    logic: (r, g, b, max, min) => r === max && g > (r * 0.35) && g < (r * 0.75) && b > (g * 0.3)
  },
  {
    color: "gold",
    anchor: { r: 255, g: 215, b: 0 },
    ranges: { r: [200, 255], g: [180, 235], b: [0, 100] },
    logic: (r, g, b, max, min) => r === max && g > (r * 0.7) && b < (g * 0.5)
  },
  {
    color: "cyan",
    anchor: { r: 0, g: 255, b: 255 },
    ranges: { r: [0, 120], g: [150, 255], b: [150, 255] },
    logic: (r, g, b, max, min) => g === max && b === max && r < (g * 0.5)
  },
  {
    color: "teal",
    anchor: { r: 0, g: 128, b: 128 },
    ranges: { r: [0, 100], g: [80, 180], b: [80, 180] },
    logic: (r, g, b, max, min) => g === max && b === max && r < (g * 0.4) && (max - min) > 20
  },
  {
    color: "navy",
    anchor: { r: 0, g: 0, b: 128 },
    ranges: { r: [0, 70], g: [0, 80], b: [90, 170] },
    logic: (r, g, b, max, min) => b === max && b > 90 && max - min > 40
  },
  {
    color: "magenta",
    anchor: { r: 255, g: 0, b: 255 },
    ranges: { r: [150, 255], g: [0, 105], b: [150, 255] },
    logic: (r, g, b, max, min) => r === max && b === max && g < (r * 0.4)
  },
  {
    color: "lavender",
    anchor: { r: 230, g: 230, b: 250 },
    ranges: { r: [180, 255], g: [180, 255], b: [210, 255] },
    logic: (r, g, b, max, min) => b === max && r > 160 && g > 160 && (max - min) < 70
  },
  {
    color: "yellow",
    anchor: { r: 255, g: 255, b: 0 },
    ranges: { r: [180, 255], g: [180, 255], b: [0, 120] },
    logic: (r, g, b, max, min) => r > 150 && g > 150 && Math.abs(r - g) < (max * 0.2) && b < (min * 0.6)
  },
  {
    color: "green",
    anchor: { r: 0, g: 128, b: 0 },
    ranges: { r: [0, 180], g: [80, 255], b: [0, 180] },
    logic: (r, g, b, max, min) => g === max && r < (g * 0.8) && b < (g * 0.9)
  },
  {
    color: "light blue",
    anchor: { r: 173, g: 216, b: 230 },
    ranges: { r: [80, 200], g: [150, 240], b: [200, 255] },
    logic: (r, g, b, max, min) => max > 150 && b === max && g > r && (b - r) > 40
  },
  {
    color: "dark blue",
    anchor: { r: 0, g: 0, b: 139 },
    ranges: { r: [0, 100], g: [0, 120], b: [80, 255] },
    logic: (r, g, b, max, min) => b === max && r < (b * 0.7) && g < (b * 0.8) && (max - min) > 20
  },
  {
    color: "purple",
    anchor: { r: 128, g: 0, b: 128 },
    ranges: { r: [80, 220], g: [0, 120], b: [100, 255] },
    logic: (r, g, b, max, min) => (r === max || b === max) && r > g && b > g && Math.abs(r - b) < (max * 0.4)
  },
  {
    color: "pink",
    anchor: { r: 255, g: 192, b: 203 },
    ranges: { r: [180, 255], g: [80, 200], b: [120, 240] },
    logic: (r, g, b, max, min) => r === max && min > 80 && b > (g * 0.9) && b < r && (r - g) > 30
  },
  {
    color: "beige",
    anchor: { r: 245, g: 245, b: 220 },
    ranges: { r: [200, 255], g: [180, 240], b: [140, 220] },
    logic: (r, g, b, max, min) => max > 200 && min > 130 && r >= g && g >= b && (r - b) < 70
  }
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Gracefully handle short hex codes (e.g., #FFF)
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 }; // Default to grey if parsing fails
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    h = Math.round((h * 60 + 360) % 360);
  }

  return { h, s, l };
}

function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

export function getClosestColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // --- TIER 1: Strict Range & Logic Match ---
  for (const rule of COLOR_RULES) {
    if (r >= rule.ranges.r[0] && r <= rule.ranges.r[1] &&
      g >= rule.ranges.g[0] && g <= rule.ranges.g[1] &&
      b >= rule.ranges.b[0] && b <= rule.ranges.b[1]) {

      // If it's inside the bounding box, check the strict logic
      if (rule.logic(r, g, b, max, min)) {
        return rule.color;
      }
    }
  }

  // --- TIER 2: Mathematical Fallback (Euclidean Distance) ---
  const isNeutral = (max - min) < 25;

  const distanceResults = COLOR_RULES.map(rule => ({
    color: rule.color,
    distance: Math.hypot(r - rule.anchor.r, g - rule.anchor.g, b - rule.anchor.b)
  })).sort((a, b) => a.distance - b.distance);

  if (!isNeutral && distanceResults[0]?.color === "grey") {
    const targetHsl = rgbToHsl(r, g, b);

    // Use HSL hue distance for non-neutral colors to avoid gray fallback.
    const hoist = COLOR_RULES
      .filter(rule => rule.color !== "grey")
      .map(rule => ({
        color: rule.color,
        hueDistance: hueDistance(targetHsl.h, rgbToHsl(rule.anchor.r, rule.anchor.g, rule.anchor.b).h),
        distance: Math.hypot(r - rule.anchor.r, g - rule.anchor.g, b - rule.anchor.b)
      }))
      .sort((a, b) => a.hueDistance - b.hueDistance || a.distance - b.distance);

    if (hoist[0]) {
      return hoist[0].color;
    }

    return distanceResults[1]?.color ?? distanceResults[0]?.color ?? "Undetected";
  }

  return distanceResults[0]?.color ?? "Undetected";
}