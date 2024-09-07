import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import ChatInterface from "../components/ChatInterface";
import { prepareImage, getImageDimensions, convertToRGBMask, prepareMask, loadImage } from '../lib/imageUtils';
import { Upload as UploadIcon } from "lucide-react";
import { Code as CodeIcon } from "lucide-react";

const initialChatHistory = [
  {
    type: 'ai',
    content: 'Hi. Draw an area to edit. What should we change?'
  },
  {
    type: 'user',
    image: '/livingroom.png'
  },
  {
    type: 'user',
    content: 'Modern bohemian bedroom, bed, throw, side tables, plants, wall decorations'
  },
  {
    type: 'ai',
    content: "Here's the edited version based on your prompt:"
  },
  {
    type: 'ai',
    image: '/bedroom.png'
  }
];

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [maskPaths, setMaskPaths] = useState([]);
  const [userUploadedImage, setUserUploadedImage] = useState(null);
  const [chatMessages, setChatMessages] = useState(initialChatHistory.map(msg => ({
    ...msg,
    optimizedImage: msg.image,
    optimizedWidth: null,
    optimizedHeight: null
  })));
  const [canSubmitPrompt, setCanSubmitPrompt] = useState(true);
  const [windowHeight, setWindowHeight] = useState(0);
  const [activeMaskImage, setActiveMaskImage] = useState(null);
  const [showMaskDrawing, setShowMaskDrawing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);
  const dimensionsLoadedRef = useRef(false);

  const handleImageSelect = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setActiveMaskImage(null);
  }, []);

  const toggleMask = useCallback((imageUrl) => {
    console.log('paint.js: Toggling mask for', imageUrl);
    setActiveMaskImage(current => {
      const newValue = current === imageUrl ? null : imageUrl;
      console.log('paint.js: New activeMaskImage:', newValue);
      return newValue;
    });
    setSelectedImage(imageUrl);
  }, []);

  function openImageInNewTab(dataUrl, fileName, width, height) {
    const newTab = window.open('about:blank', '_blank');
    if (newTab) {
      newTab.document.write(`
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; }
              h1 { margin-bottom: 10px; }
              p { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>Optimized Image</h1>
            <p>Dimensions: ${width}x${height}</p>
            <img src="${dataUrl}" alt="${fileName}" style="max-width: 100%; height: auto;">
          </body>
        </html>
      `);
    } else {
      console.error('Failed to open new tab. Pop-up blocker might be enabled.');
    }
  }

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (dimensionsLoadedRef.current) return;

    const loadImageDimensions = async () => {
      const updatedMessages = await Promise.all(
        chatMessages.map(async (msg) => {
          if (msg.image && (!msg.width || !msg.height)) {
            const dimensions = await getImageDimensions(msg.image);
            return { ...msg, ...dimensions };
          }
          return msg;
        })
      );
      setChatMessages(updatedMessages);
      dimensionsLoadedRef.current = true;
    };

    loadImageDimensions();
  }, [chatMessages]);

  const getImageToProcess = useCallback(() => {
    if (activeMaskImage) {
      return activeMaskImage;
    }
    const latestPrompt = chatMessages.filter(msg => msg.type === 'user' && msg.content).pop();
    if (latestPrompt) {
      const imageAfterPrompt = chatMessages
        .slice(chatMessages.indexOf(latestPrompt))
        .find(msg => msg.image)?.image;
      if (imageAfterPrompt) {
        return imageAfterPrompt;
      }
    }
    return chatMessages.filter(msg => msg.image).pop()?.image;
  }, [activeMaskImage, chatMessages]);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const originalDataUrl = e.target.result;
        const dimensions = await getImageDimensions(originalDataUrl);
        setUserUploadedImage(originalDataUrl);
        setChatMessages(prev => [
          ...prev,
          { 
            type: 'user', 
            image: originalDataUrl,
            width: dimensions.width,
            height: dimensions.height
          },
          { type: 'ai', content: `Image uploaded successfully. Dimensions: ${dimensions.width}x${dimensions.height}. You can now create a mask.` }
        ]);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const handleMaskCreated = useCallback((maskDataUrl, originalImageUrl) => {
    console.log('paint.js: Mask created', { 
      originalImageUrl, 
      maskDataUrlLength: maskDataUrl.length 
    });
    if (originalImageUrl) {
      setChatMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.image === originalImageUrl 
            ? { ...msg, mask: maskDataUrl, hasMask: true }
            : msg
        )
      );
      setCanSubmitPrompt(true);
      console.log('paint.js: Updated chat messages and set canSubmitPrompt to true');
    } else {
      console.error('handleMaskCreated: originalImageUrl is undefined');
    }
  }, []);

  const handleSubmit = async (prompt) => {
    setActiveMaskImage(null);
    const imageToProcess = getImageToProcess();
    if (!imageToProcess) {
      setError("No image available for processing. Please upload or select an image.");
      return;
    }

    try {
      const { dataUrl: processedImage, width, height } = await prepareImage(imageToProcess);

      // Process the mask if it exists
      let processedMask = null;
      if (activeMaskImage) {
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');

        const maskImg = await loadImage(activeMaskImage);
        maskCtx.drawImage(maskImg, 0, 0, width, height);

        const maskImageData = maskCtx.getImageData(0, 0, width, height);
        const maskData = maskImageData.data;

        for (let i = 0; i < maskData.length; i += 4) {
          const alpha = maskData[i + 3];
          maskData[i] = alpha;     // R
          maskData[i + 1] = alpha; // G
          maskData[i + 2] = alpha; // B
          maskData[i + 3] = 255;   // A
        }

        maskCtx.putImageData(maskImageData, 0, 0);
        processedMask = maskCanvas.toDataURL('image/png');
      }

      // Open a new tab with both images
      const newTab = window.open();
      newTab.document.write(`
        <html>
          <head>
            <title>Processed Images</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .image-container { display: flex; gap: 20px; }
              img { max-width: 45vw; max-height: 90vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <div class="image-container">
              <img src="${processedImage}" alt="Processed Image">
              ${processedMask ? `<img src="${processedMask}" alt="Mask Image">` : ''}
            </div>
          </body>
        </html>
      `);

      console.log("Sending to API - Image dimensions:", { width, height });
      console.log("Processed image data URL length:", processedImage.length);
      console.log("Processed mask data URL length:", processedMask ? processedMask.length : "No mask");

      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          image: processedImage,
          mask: processedMask,
          width,
          height,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let prediction = await response.json();

      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed"
      ) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResponse = await fetch("/api/predictions/" + prediction.id);
        if (!statusResponse.ok) {
          throw new Error(`HTTP error! status: ${statusResponse.status}`);
        }
        prediction = await statusResponse.json();
        console.log("Prediction status:", prediction.status);
      }

      if (prediction.status === "succeeded") {
        console.log("Prediction succeeded:", prediction.output);
        const generatedImageUrl = prediction.output[prediction.output.length - 1];
        
        try {
          const { dataUrl: preparedImageUrl, width, height } = await prepareImage(generatedImageUrl);
          
          setChatMessages(prev => [...prev, 
            { type: 'ai', content: "Here's the edited version based on your prompt:" },
            { type: 'ai', image: preparedImageUrl, width, height }
          ]);
          
          setActiveMaskImage(preparedImageUrl);

          // Open the generated image in a new tab
          openImageInNewTab(preparedImageUrl, "generated_image.png", width, height);
        } catch (error) {
          console.error("Error preparing generated image:", error);
          setChatMessages(prev => [...prev, { type: 'ai', content: `Error preparing image: ${error.message}` }]);
        }
      } else {
        throw new Error(`Prediction failed: ${prediction.error}`);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error.message);
      setChatMessages(prev => [...prev, { type: 'ai', content: `Error: ${error.message}` }]);
    }
  };

  return (
    <div style={{height: `${windowHeight}px`}} className="flex flex-col">
      <Head>
        <title>SupaPaint AI Image Editor</title>
        <meta name="description" content="AI Image editing app" />
      </Head>
      <div className="flex-grow w-full max-w-4xl mx-auto mb-5 flex flex-col overflow-hidden">
        <ChatInterface 
          messages={chatMessages} 
          onSendMessage={handleSubmit}
          canSubmitPrompt={canSubmitPrompt}
          onMaskCreated={handleMaskCreated}
          activeMaskImage={activeMaskImage}
          toggleMask={toggleMask}
          selectedImage={selectedImage}
          onImageSelect={handleImageSelect}
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
    </div>
  );
}