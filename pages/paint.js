import React, { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import Head from "next/head";
import Link from "next/link";
import ChatInterface from "../components/ChatInterface";
import { prepareImage, getOptimalDimensions, drawMaskOnImage, createMaskFromStrokes } from '../lib/imageUtils';
import { Upload as UploadIcon, Code as CodeIcon } from "lucide-react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const initialChatHistory = [
  { id: '1', type: 'ai', content: 'Hi. Draw an area to edit. What should we change?' },
  { id: '2', type: 'user', image: '/livingroom.png' },
  { id: '3', type: 'user', content: 'Modern bohemian bedroom, bed, throw, side tables, plants, wall decorations' },
  { id: '4', type: 'ai', content: "Here's the edited version based on your prompt:" },
  { id: '5', type: 'ai', image: '/bedroom.png' }
];

export default function Paint() {
  const [windowHeight, setWindowHeight] = useState(0);
  const [chatMessages, setChatMessages] = useState(initialChatHistory);
  const [selectedImage, setSelectedImage] = useState({ original: null, optimized: null, mask: null });
  const [error, setError] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeImageId, setActiveImageId] = useState(null);
  const [hasMask, setHasMask] = useState(false);
  const fileInputRef = useRef(null);
  const imageEditorRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openDebugTab = useCallback((payload) => {
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(`
        <html>
          <head>
            <title>Debug Payload</title>
            <style>
              body { font-family: Arial, sans-serif; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <h1>Debug Payload</h1>
            <h2>Prompt: ${payload.prompt || 'No prompt'}</h2>
            <h3>Input Image:</h3>
            ${payload.input.image ? `<img src="${payload.input.image}" alt="Input Image">` : 'No input image'}
            <h3>Input Mask:</h3>
            ${payload.input.mask ? `<img src="${payload.input.mask}" alt="Input Mask">` : 'No input mask'}
            <h3>Output:</h3>
            ${payload.output ? `<img src="${payload.output}" alt="Output Image">` : 'No output yet'}
            ${payload.error ? `<h3>Error:</h3><p>${payload.error}</p>` : ''}
          </body>
        </html>
      `);
      newTab.document.close();
      console.log("Debug tab opened successfully");
    } else {
      console.error("Failed to open debug tab");
    }
  }, []);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const originalDataUrl = e.target.result;
          const { dataUrl: optimizedImage, width, height } = await prepareImage(originalDataUrl);
          console.log("Image optimized:", { width, height });
          setSelectedImage({ original: originalDataUrl, optimized: optimizedImage, mask: null });
          setHasMask(false);
          setChatMessages(prev => [
            ...prev,
            { id: Date.now().toString(), type: 'user', image: optimizedImage },
            { id: (Date.now() + 1).toString(), type: 'ai', content: `Image uploaded and optimized. Dimensions: ${width}x${height}. You can now create a mask.` }
          ]);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error in handleImageUpload:", error);
        setError(error.message);
      }
    }
  }, []);

  const handleToggleMask = useCallback((imageId) => {
    console.log('Toggling mask for image:', imageId);

    // Find the selected image from chat messages
    const selectedMsg = chatMessages.find(msg => msg.id === imageId);

    if (!isDrawing) {
      // Starting to draw
      setIsDrawing(true);
      setActiveImageId(imageId);

      if (selectedMsg && selectedMsg.image) {
        // Automatically select the image
        setSelectedImage(prev => ({
          ...prev,
          original: selectedMsg.image,
          optimized: null, // We'll optimize it when submitting
          mask: null
        }));
        console.log("Image automatically selected:", selectedMsg.image);
      } else {
        console.error("No image found for id:", imageId);
      }

      if (imageEditorRef.current) {
        imageEditorRef.current.clearMask();
      }
      console.log("Mask drawing started");
    } else {
      // Finished drawing
      console.log("Mask drawing finished");
      // Don't reset isDrawing here, we'll do it in handleSubmit
    }
  }, [isDrawing, imageEditorRef, chatMessages]);

  const handleSubmit = useCallback(async (prompt) => {
    console.log("Paint: Submitting prompt:", prompt);
    console.log("Paint: Selected Image state:", selectedImage);

    try {
      if (!selectedImage.original) {
        throw new Error("No image selected");
      }

      // Optimize the image if it hasn't been optimized yet
      let optimizedImage, width, height;
      if (!selectedImage.optimized) {
        const result = await prepareImage(selectedImage.original);
        optimizedImage = result.dataUrl;
        width = result.width;
        height = result.height;
        console.log("Paint: Image optimized:", { width, height });

        setSelectedImage(prev => ({ ...prev, optimized: optimizedImage }));
      } else {
        optimizedImage = selectedImage.optimized;
        ({ width, height } = await getImageDimensions(optimizedImage));
        console.log("Paint: Using pre-optimized image:", { width, height });
      }

      let optimizedMask = null;
      if (isDrawing && imageEditorRef.current) {
        const { strokes, canvasSize } = await imageEditorRef.current.getStrokes();
        console.log("Paint: Received strokes and canvas size:", { strokeCount: strokes.length, canvasSize });
        if (strokes.length > 0) {
          optimizedMask = createMaskFromStrokes(strokes, canvasSize, width, height);
          console.log("Paint: Mask created");
        }
      }

      // Prepare the payload for the API
      const payload = {
        prompt,
        image: optimizedImage,
        mask: optimizedMask,
        width,
        height
      };

      // Open debug tab
      openDebugTab({
        prompt,
        input: {
          image: optimizedImage,
          mask: optimizedMask,
        },
        output: null,
      });
      console.log("Paint: Debug tab opened with mask:", !!optimizedMask);

      // API call
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      let prediction = await response.json();

      // Poll for the prediction result
      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await sleep(1000);
        const statusResponse = await fetch(`/api/predictions/${prediction.id}`);
        if (!statusResponse.ok) {
          throw new Error(`Failed to check prediction status: ${statusResponse.status} ${statusResponse.statusText}`);
        }
        prediction = await statusResponse.json();
        console.log("Prediction status:", prediction.status);
      }

      if (prediction.status === "succeeded") {
        console.log("Prediction succeeded:", prediction.output);
        setChatMessages(prev => [...prev,
        { type: 'ai', content: "Here's the edited version based on your prompt:" },
        { type: 'ai', image: prediction.output[prediction.output.length - 1] }
        ]);

        // Update debug tab with the result
        openDebugTab({
          prompt,
          input: {
            image: optimizedImage,
            mask: optimizedMask,
          },
          output: prediction.output[prediction.output.length - 1],
        });
      } else {
        throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error("Paint: Error in submission:", error.message);
      setError(error.message);
      setChatMessages(prev => [...prev, { type: 'ai', content: `Error: ${error.message}` }]);
    }
  }, [selectedImage, openDebugTab, isDrawing, imageEditorRef]);

  const handleMaskCreated = useCallback((maskDataUrl) => {
    console.log("Mask created");
    setSelectedImage(prev => ({ ...prev, mask: maskDataUrl }));
    setHasMask(true);
  }, []);

  return (
    <div style={{ height: `${windowHeight}px` }} className="flex flex-col">
      <Head>
        <title>SupaPaint AI Image Editor</title>
        <meta name="description" content="AI Image editing app" />
      </Head>
      <main className="flex-grow container mx-auto p-5 flex flex-col">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="flex-grow w-full max-w-4xl mx-auto mb-5 flex flex-col overflow-hidden">
          <ChatInterface
            chatMessages={chatMessages}
            onSendMessage={handleSubmit}
            onMaskCreated={handleMaskCreated}
            onToggleMask={handleToggleMask}
            selectedImage={selectedImage}
            activeImageId={activeImageId}
            isDrawing={isDrawing}
            hasMask={hasMask}
            ref={fileInputRef}
            imageEditorRef={imageEditorRef}
          />
        </div>
        <div className="max-w-[660px] w-full mx-auto">
          <div className="text-center">
            <button className="lil-button" onClick={() => fileInputRef.current.click()}>
              <UploadIcon className="icon" />
              Upload Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              accept="image/*"
            />
            <Link href="https://www.linkedin.com/in/arnabing/" legacyBehavior>
              <a className="lil-button" target="_blank" rel="noopener noreferrer">
                <CodeIcon className="icon" />
                built by Arnab Raychaudhuri
              </a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}