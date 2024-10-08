const ALLOWED_DIMENSIONS = [64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024];

export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = src;
  });
};

export const getOptimalDimensions = (width, height) => {
  const aspectRatio = width / height;

  // Find the closest allowed width
  let optimalWidth = ALLOWED_DIMENSIONS.reduce((prev, curr) =>
    Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
  );

  // Calculate the corresponding height
  let optimalHeight = Math.round(optimalWidth / aspectRatio);

  // Ensure height is not greater than 1024
  if (optimalHeight > 1024) {
    optimalHeight = 1024;
    optimalWidth = Math.round(optimalHeight * aspectRatio);
    // Find the closest allowed width again
    optimalWidth = ALLOWED_DIMENSIONS.reduce((prev, curr) =>
      Math.abs(curr - optimalWidth) < Math.abs(prev - optimalWidth) ? curr : prev
    );
  }

  // Ensure dimensions are divisible by 8
  optimalWidth = Math.round(optimalWidth / 8) * 8;
  optimalHeight = Math.round(optimalHeight / 8) * 8;

  console.log("Optimal dimensions:", { width: optimalWidth, height: optimalHeight });
  return { width: optimalWidth, height: optimalHeight };
};

export const drawMaskOnImage = async (maskData, targetWidth, targetHeight, isMask = false) => {
  if (!maskData) {
    console.log('No mask data provided');
    return { dataUrl: null, width: targetWidth, height: targetHeight };
  }

  console.log('Drawing mask:', { targetWidth, targetHeight, isMask });

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (isMask) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, targetWidth, targetHeight);

      if (isMask) {
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          const color = avg > 128 ? 255 : 0;
          imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = color;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      const dataUrl = canvas.toDataURL('image/png');
      console.log('Mask drawn:', { width: targetWidth, height: targetHeight });
      resolve({ dataUrl, width: targetWidth, height: targetHeight });
    };
    img.onerror = () => {
      console.error('Error loading mask image');
      resolve({ dataUrl: null, width: targetWidth, height: targetHeight });
    };
    img.src = maskData;
  });
};

export const createMaskFromStrokes = (strokes, canvasSize, targetWidth, targetHeight) => {
  console.log("createMaskFromStrokes:", {
    canvasSize,
    targetDimensions: { width: targetWidth, height: targetHeight },
    strokeCount: strokes.length
  });

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  ctx.strokeStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const scaleX = targetWidth / canvasSize.width;
  const scaleY = targetHeight / canvasSize.height;
  console.log("Scaling factors:", { scaleX, scaleY });

  strokes.forEach((stroke, index) => {
    ctx.beginPath();
    ctx.lineWidth = Math.max(1, Math.round(stroke.strokeWidth * scaleX));

    if (stroke.paths && stroke.paths.length > 0) {
      console.log(`Stroke ${index}: ${stroke.paths.length} points, lineWidth: ${ctx.lineWidth}`);
      const startPoint = stroke.paths[0];
      ctx.moveTo(startPoint.x * scaleX, startPoint.y * scaleY);
      stroke.paths.forEach((point) => {
        ctx.lineTo(point.x * scaleX, point.y * scaleY);
      });
      ctx.stroke();
    }
  });

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const whitePixels = imageData.data.filter((_, i) => i % 4 === 0 && imageData.data[i] === 255).length;
  console.log(`Mask created: ${whitePixels} white pixels`);

  return canvas.toDataURL('image/png');
};

// Update prepareImage function if needed
export const prepareImage = async (imageData) => {
  const { width: originalWidth, height: originalHeight } = await getImageDimensions(imageData);
  const { width, height } = getOptimalDimensions(originalWidth, originalHeight);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, width, height);
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        width,
        height
      });
    };
    img.src = imageData;
  });
};