type ColorRule = {
  color: string;
  anchor: { r: number; g: number; b: number };
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
    // Fixed: Added max and min to the arguments to match your Type definition
    logic: (r, g, b, max, min) => {
      const isRedDominant = r > g && r > b;
      return isRedDominant && g < (r * 0.35) && b < (r * 0.35);
    }
  },
  {
    color: "orange",
    anchor: { r: 255, g: 165, b: 0 },
    ranges: { r: [150, 255], g: [50, 180], b: [0, 100] },
    // Fixed: Added max and min to the arguments to match your Type definition
    logic: (r, g, b, max, min) => {
      const isRedDominant = r > g && r > b;
      return isRedDominant && g >= (r * 0.35) && g < (r * 0.8) && b < (g * 0.8);
    }
  },
  {
    color: "brown",
    anchor: { r: 139, g: 69, b: 19 },
    ranges: { r: [60, 180], g: [30, 120], b: [0, 80] },
    logic: (r, g, b, max, min) => r === max && max <= 180 && g > (r * 0.3) && g < (r * 0.8) && b < g
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
    // Expanded ranges to meet Dark Blue perfectly
    ranges: { r: [50, 220], g: [100, 255], b: [150, 255] },
    // Logic: Blue is max, brightness is > 180, and it's notably "blue" (b - r > 30)
    logic: (r, g, b, max, min) => b === max && max >= 180 && g > r && (b - r) > 30
  },
  {
    color: "dark blue",
    anchor: { r: 0, g: 0, b: 139 },
    // Expanded ranges to meet Light Blue perfectly
    ranges: { r: [0, 150], g: [0, 180], b: [80, 255] },
    // Logic: Blue is max, brightness is < 180, and it has a minimum saturation (max - min > 20)
    logic: (r, g, b, max, min) => b === max && max < 180 && r < (b * 0.8) && g < (b * 0.9) && (max - min) > 20
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
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
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

      if (rule.logic(r, g, b, max, min)) {
        return rule.color;
      }
    }
  }

  // --- TIER 2: Mathematical Fallback (Euclidean Distance) ---
  let closestColor = "Undetected";
  let minDistance = Infinity;

  for (const rule of COLOR_RULES) {
    const distance = Math.sqrt(
      Math.pow(r - rule.anchor.r, 2) +
      Math.pow(g - rule.anchor.g, 2) +
      Math.pow(b - rule.anchor.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = rule.color;
    }
  }

  return closestColor;
}