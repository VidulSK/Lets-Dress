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
