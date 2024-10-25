const ALLOWED_DIMENSIONS = [64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024];

const logImageDimensions = (stage, width, height) => {
  console.log(`imageUtils: ${stage} - width: ${width}, height: ${height}`);
};

export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    console.log('imageUtils: Loading image from source:', src); // Log the image source
    img.onload = () => {
      console.log('imageUtils: Original dimensions - width:', img.width, 'height:', img.height);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (error) => {
      console.error('imageUtils: Error loading image', error);
      reject(new Error(`Failed to load image from source: ${src}`));
    };
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

export const prepareImage = async (imageUrl) => {
  console.log('imageUtils: Preparing image for URL:', imageUrl);

  try {
    const { width, height } = await getImageDimensions(imageUrl);
    console.log('imageUtils: Retrieved dimensions - width:', width, 'height:', height);

    const optimalDimensions = getOptimalDimensions(width, height);
    console.log('imageUtils: Optimal dimensions calculated:', optimalDimensions);

    if (isNaN(optimalDimensions.width) || isNaN(optimalDimensions.height)) {
      console.error('imageUtils: Invalid optimal dimensions', optimalDimensions);
      throw new Error('Invalid optimal dimensions');
    }

    return {
      dataUrl: imageUrl,
      width: optimalDimensions.width,
      height: optimalDimensions.height
    };
  } catch (error) {
    console.error('imageUtils: Error preparing image', error);
    throw error;
  }
};

export const drawMaskOnImage = async (maskData, targetWidth, targetHeight, isMask = false) => {
  if (!maskData) {
    console.log('No mask data provided');
    return { dataUrl: null, width: targetWidth, height: targetHeight };
  }
};
