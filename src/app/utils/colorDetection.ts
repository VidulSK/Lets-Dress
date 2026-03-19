type ColorRule = {
  color: string;
  ranges: { r: [number, number], g: [number, number], b: [number, number] };
  logic: (r: number, g: number, b: number, max: number, min: number) => boolean;
};

const COLOR_RULES: ColorRule[] = [
  {
    color: "black",
    ranges: { r: [0, 45], g: [0, 45], b: [0, 45] },
    logic: (r, g, b, max, min) => (max - min) < 15
  },
  {
    color: "red",
    ranges: { r: [150, 255], g: [0, 75], b: [0, 75] },
    logic: (r, g, b, max, min) => r > (g + 100) && r > (b + 100)
  },
  {
    color: "orange",
    ranges: { r: [200, 255], g: [100, 180], b: [0, 80] },
    logic: (r, g, b, max, min) => r > g && g > b
  },
  {
    color: "brown",
    ranges: { r: [80, 160], g: [40, 110], b: [0, 60] },
    logic: (r, g, b, max, min) => r > g && g > b && r < 180
  },
  {
    color: "yellow",
    ranges: { r: [200, 255], g: [200, 255], b: [0, 100] },
    logic: (r, g, b, max, min) => Math.abs(r - g) < 40 && b < (r - 100)
  },
  {
    color: "green",
    ranges: { r: [0, 130], g: [130, 255], b: [0, 130] },
    logic: (r, g, b, max, min) => g > (r + 30) && g > (b + 30)
  },
  {
    color: "light blue",
    ranges: { r: [100, 180], g: [180, 230], b: [220, 255] },
    logic: (r, g, b, max, min) => b >= g && g > r && (r + g + b) > 500
  },
  {
    color: "dark blue",
    ranges: { r: [0, 70], g: [0, 100], b: [120, 255] },
    logic: (r, g, b, max, min) => b > (r + 50) && b > (g + 30)
  },
  {
    color: "purple",
    ranges: { r: [100, 190], g: [0, 100], b: [120, 255] },
    logic: (r, g, b, max, min) => g < r && g < b
  },
  {
    color: "pink",
    ranges: { r: [200, 255], g: [100, 190], b: [150, 230] },
    logic: (r, g, b, max, min) => r > b && b > g
  },
  {
    color: "beige",
    ranges: { r: [220, 255], g: [200, 240], b: [170, 220] },
    logic: (r, g, b, max, min) => r > g && g > b && (r - b) < 60
  }
];

export function getImageDominantColor(imageFile: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('#808080'); return; }

        const MAX_DIM = 200;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const colorCounts: Record<string, { count: number, r: number, g: number, b: number }> = {};
        COLOR_RULES.forEach(rule => colorCounts[rule.color] = { count: 0, r: 0, g: 0, b: 0 });

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);

          for (const rule of COLOR_RULES) {
            if (r >= rule.ranges.r[0] && r <= rule.ranges.r[1] &&
              g >= rule.ranges.g[0] && g <= rule.ranges.g[1] &&
              b >= rule.ranges.b[0] && b <= rule.ranges.b[1]) {
              if (rule.logic(r, g, b, max, min)) {
                colorCounts[rule.color].count++;
                colorCounts[rule.color].r += r;
                colorCounts[rule.color].g += g;
                colorCounts[rule.color].b += b;
                break;
              }
            }
          }
        }

        let bestColor = '';
        let maxCount = 0;
        for (const rule of COLOR_RULES) {
          if (colorCounts[rule.color].count > maxCount) {
            maxCount = colorCounts[rule.color].count;
            bestColor = rule.color;
          }
        }

        if (maxCount > 0) {
          const avgR = Math.round(colorCounts[bestColor].r / maxCount);
          const avgG = Math.round(colorCounts[bestColor].g / maxCount);
          const avgB = Math.round(colorCounts[bestColor].b / maxCount);
          resolve(`#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`);
          return;
        }

        resolve('#808080');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  });
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
}

export function getClosestColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  for (const rule of COLOR_RULES) {
    if (r >= rule.ranges.r[0] && r <= rule.ranges.r[1] &&
      g >= rule.ranges.g[0] && g <= rule.ranges.g[1] &&
      b >= rule.ranges.b[0] && b <= rule.ranges.b[1]) {
      if (rule.logic(r, g, b, max, min)) {
        return rule.color;
      }
    }
  }

  return 'gray';
}
