const ALLOWED_HEIGHTS = [1024, 960, 896, 832, 768, 704, 640, 576, 512, 448, 384, 320, 256, 192, 128, 64];
const TARGET_RESOLUTION = 1024 * 1024;

export function getOptimalDimensions(originalWidth, originalHeight) {
  const aspectRatio = originalWidth / originalHeight;
  const originalResolution = originalWidth * originalHeight;
  const shouldUpscale = originalResolution < TARGET_RESOLUTION;

  let bestDimensions = null;
  let bestScaleFactor = shouldUpscale ? 0 : Infinity;

  for (const allowedHeight of ALLOWED_HEIGHTS) {
    const calculatedWidth = Math.round((allowedHeight * aspectRatio) / 8) * 8;
    
    if (calculatedWidth <= 1024) {
      const scaleFactor = allowedHeight / originalHeight;

      if ((shouldUpscale && scaleFactor > bestScaleFactor) ||
          (!shouldUpscale && scaleFactor < bestScaleFactor && scaleFactor >= 1)) {
        bestScaleFactor = scaleFactor;
        bestDimensions = { width: calculatedWidth, height: allowedHeight };
      }
    }
  }

  if (!bestDimensions) {
    bestDimensions = { width: 1024, height: Math.round(1024 / aspectRatio) };
  }

  console.log("Original dimensions:", { width: originalWidth, height: originalHeight, aspectRatio });
  console.log("Optimal dimensions:", bestDimensions);

  return bestDimensions;
}

export function prepareImage(imageData) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log("Original image dimensions:", { width: img.width, height: img.height });
      const { width: optimalWidth, height: optimalHeight } = getOptimalDimensions(img.width, img.height);

      const canvas = document.createElement('canvas');
      canvas.width = optimalWidth;
      canvas.height = optimalHeight;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, optimalWidth, optimalHeight);

      const dataUrl = canvas.toDataURL('image/png');
      console.log("Prepared image dimensions:", { width: optimalWidth, height: optimalHeight });
      console.log("Prepared image data URL length:", dataUrl.length);
      resolve({ dataUrl, width: optimalWidth, height: optimalHeight });
    };
    img.onerror = (error) => {
      console.error("Error loading image:", error);
      reject(error);
    };
    img.src = imageData;
  });
}

export function getImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = src;
  });
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}