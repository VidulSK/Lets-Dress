export function getImageDominantColor(imageFile: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('#808080');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const colorMap: { [key: string]: number } = {};
        
        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Skip very light or very dark pixels
          const brightness = (r + g + b) / 3;
          if (brightness < 30 || brightness > 225) continue;
          
          // Round to nearest 32 to group similar colors
          const roundedR = Math.round(r / 32) * 32;
          const roundedG = Math.round(g / 32) * 32;
          const roundedB = Math.round(b / 32) * 32;
          
          const key = `${roundedR},${roundedG},${roundedB}`;
          colorMap[key] = (colorMap[key] || 0) + 1;
        }

        // Find most common color
        let maxCount = 0;
        let dominantColor = '128,128,128';
        
        for (const [color, count] of Object.entries(colorMap)) {
          if (count > maxCount) {
            maxCount = count;
            dominantColor = color;
          }
        }

        const [r, g, b] = dominantColor.split(',').map(Number);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        resolve(hex);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  });
}

// Named color definitions — 12 named colors with RGB reference points
const NAMED_COLORS: { name: string; r: number; g: number; b: number }[] = [
  { name: 'white',      r: 255, g: 255, b: 255 },
  { name: 'pink',       r: 255, g: 182, b: 193 },
  { name: 'red',        r: 200, g:  30, b:  30 },
  { name: 'orange',     r: 230, g: 120, b:  20 },
  { name: 'beige',      r: 230, g: 210, b: 185 },
  { name: 'yellow',     r: 240, g: 220, b:  30 },
  { name: 'green',      r:  50, g: 160, b:  50 },
  { name: 'light blue', r: 130, g: 195, b: 235 },
  { name: 'dark blue',  r:  25, g:  50, b: 160 },
  { name: 'purple',     r: 140, g:  50, b: 200 },
  { name: 'brown',      r: 130, g:  75, b:  40 },
  { name: 'gray',       r: 150, g: 150, b: 150 },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
}

export function getClosestColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  let minDist = Infinity;
  let closest = 'gray';
  for (const nc of NAMED_COLORS) {
    const dist = Math.sqrt(
      (r - nc.r) ** 2 + (g - nc.g) ** 2 + (b - nc.b) ** 2
    );
    if (dist < minDist) {
      minDist = dist;
      closest = nc.name;
    }
  }
  return closest;
}
