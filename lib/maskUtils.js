export const clearMask = (canvasRef) => {
    console.log('maskUtils: Clearing mask');
    if (canvasRef.current) {
        canvasRef.current.clearCanvas();
        console.log("maskUtils: Mask cleared successfully");
    } else {
        console.warn("maskUtils: Unable to clear mask, canvas reference not available");
    }
};

export const getStrokes = async (canvasRef) => {
    console.log('maskUtils: Getting strokes');
    if (canvasRef.current) {
        const strokes = await canvasRef.current.exportPaths();
        console.log('maskUtils: Strokes exported', { strokeCount: strokes.length });
        if (strokes.length === 0) {
            console.log('maskUtils: No strokes found');
            return null;
        }
        return strokes;
    }
    console.warn('maskUtils: Unable to get strokes, canvas reference not available');
    return null;
};

export const exportMask = (canvasRef) => {
    console.log('maskUtils: Exporting mask');
    if (canvasRef.current) {
        const maskDataUrl = canvasRef.current.exportImage('png');
        console.log('maskUtils: Mask exported successfully', { dataUrlLength: maskDataUrl.length });
        return maskDataUrl;
    }
    console.warn('maskUtils: Unable to export mask, canvas reference not available');
    return null;
};

export const drawMaskOnImage = async (maskData, targetWidth, targetHeight, isMask = false) => {
    if (!maskData) {
        console.warn('maskUtils: No mask data provided for drawing');
        return { dataUrl: null, width: targetWidth, height: targetHeight };
    }

    console.log('maskUtils: Drawing mask', { targetWidth, targetHeight, isMask });

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
            console.log('maskUtils: Mask drawn successfully', { width: targetWidth, height: targetHeight });
            resolve({ dataUrl, width: targetWidth, height: targetHeight });
        };
        img.onerror = () => {
            console.error('maskUtils: Error loading image for mask drawing');
            resolve({ dataUrl: null, width: targetWidth, height: targetHeight });
        };
        img.src = maskData;
    });
};

export const createMaskFromStrokes = (strokes, canvasSize, targetWidth, targetHeight) => {
    console.log("maskUtils: Creating mask from strokes", {
        canvasSize,
        targetDimensions: { width: targetWidth, height: targetHeight },
        strokeCount: strokes.length
    });

    if (!strokes || strokes.length === 0) {
        console.log("maskUtils: No strokes provided, returning null mask");
        return null;
    }

    const scaleX = targetWidth / canvasSize.width;
    const scaleY = targetHeight / canvasSize.height;
    console.log("maskUtils: Scaling factors", { scaleX, scaleY });

    if (isNaN(scaleX) || isNaN(scaleY)) {
        console.error('maskUtils: Invalid scaling factors', { scaleX, scaleY });
        throw new Error('Invalid scaling factors');
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach((stroke, index) => {
        ctx.beginPath();
        ctx.lineWidth = Math.max(1, Math.round(stroke.strokeWidth * scaleX));

        if (stroke.paths && stroke.paths.length > 0) {
            console.log(`maskUtils: Processing stroke ${index}`, { pointCount: stroke.paths.length, lineWidth: ctx.lineWidth });
            const startPoint = stroke.paths[0];
            ctx.moveTo(startPoint.x * scaleX, startPoint.y * scaleY);
            stroke.paths.forEach((point) => {
                ctx.lineTo(point.x * scaleX, point.y * scaleY);
            });
            ctx.stroke();
        } else {
            console.warn(`maskUtils: Skipping stroke ${index}, no paths found`);
        }
    });

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const whitePixels = imageData.data.filter((_, i) => i % 4 === 0 && imageData.data[i] === 255).length;
    console.log(`maskUtils: Mask created`, { whitePixels, totalPixels: targetWidth * targetHeight });

    const maskDataUrl = canvas.toDataURL('image/png');
    console.log(`maskUtils: Mask data URL created, length: ${maskDataUrl.length}`);
    return maskDataUrl;
};
