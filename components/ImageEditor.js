import React, { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { getOptimalDimensions } from '../lib/imageUtils';
import Image from 'next/image';

const ImageEditor = forwardRef(({ image, isDrawing }, ref) => {
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 375 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (imageRef.current) {
        const { width, height } = imageRef.current.getBoundingClientRect();
        console.log('Canvas size updated:', { width, height });
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useImperativeHandle(ref, () => ({
    clearMask: () => {
      console.log('Clearing mask');
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
        console.log("ImageEditor: Mask cleared");
      }
    },
    getStrokes: async () => {
      console.log('Getting strokes');
      if (canvasRef.current) {
        const strokes = await canvasRef.current.exportPaths();
        console.log('Strokes exported:', { strokeCount: strokes.length });
        console.log("ImageEditor: Exporting strokes", { strokeCount: strokes.length, canvasSize });
        return { strokes, canvasSize };
      }
      return { strokes: [], canvasSize };
    }
  }));
  return (
    <div className="relative w-full" style={{ paddingBottom: '75%' }}>
      <img
        ref={imageRef}
        src={image.image}
        alt="Editable"
        className="absolute top-0 left-0 w-full h-full object-contain"
      />
      <ReactSketchCanvas
        ref={canvasRef}
        width={`${canvasSize.width}px`}
        height={`${canvasSize.height}px`}
        strokeWidth={40 * (canvasSize.width / 600)}
        strokeColor="white"
        canvasColor={isDrawing ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)"}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: isDrawing ? 'auto' : 'none',
        }}
      />
    </div>
  );
});

export default ImageEditor;
