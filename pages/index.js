import React, { useState, useCallback, useEffect, useRef } from 'react';
import Head from "next/head";
import ChatInterface from "../components/ChatInterface";
import TaskSelector from "../components/TaskSelector";
import PromptBar from "../components/PromptBar";
import Layout from "../components/Layout";
import NewChatButton from "../components/NewChatButton";
import { prepareImage, getOptimalDimensions } from '../lib/imageUtils';
import { drawMaskOnImage, createMaskFromStrokes } from '../lib/maskUtils';
import { taskData } from '../lib/taskData';
import { getApiEndpoint } from '../lib/apiRouter';

export default function Home() {
  const [windowHeight, setWindowHeight] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState({ original: null, optimized: null, mask: null });
  const [error, setError] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeImageId, setActiveImageId] = useState(null);
  const [hasMask, setHasMask] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const fileInputRef = useRef(null);
  const imageEditorRef = useRef(null);
  const [input, setInput] = useState('');

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

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTaskSelect = useCallback((taskId) => {
    console.log("Selected task ID:", taskId);
    setCurrentTask(taskId);
    const taskInfo = taskData[taskId];
    if (taskInfo) {
      setChatMessages(taskInfo.initialChat || []);
      if (taskInfo.demoImage) {
        setSelectedImage({
          original: taskInfo.demoImage,
          optimized: taskInfo.demoImage,
          mask: null
        });
      } else {
        setSelectedImage({ original: null, optimized: null, mask: null });
      }
    } else {
      console.error(`Task ${taskId} not found in taskData`);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    console.log('New chat started');
    setChatMessages([]);
    setCurrentTask(null);
    setSelectedImage({ original: null, optimized: null, mask: null });
    setIsDrawing(false);
    setActiveImageId(null);
    setHasMask(false);
  }, []);

  const handleSendMessage = useCallback(async (message) => {
    console.log('Sending message:', message);
    setChatMessages(prev => [...prev, { type: 'user', content: message }]);
    setInput('');

    try {
      const { endpoint, payload: validatedPayload } = getApiEndpoint('generate', { prompt: message });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedPayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'An error occurred');

      // Poll for the prediction result
      let prediction = data;
      for (let i = 0; i < 30; i++) {
        if (prediction.status === "succeeded") {
          break;
        } else if (prediction.status === "failed") {
          throw new Error('Prediction failed');
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusResponse = await fetch(`/api/predictions/${prediction.id}`);
        if (!statusResponse.ok) {
          throw new Error(`Failed to check prediction status: ${statusResponse.status}`);
        }
        prediction = await statusResponse.json();
      }

      if (prediction.status !== "succeeded") {
        throw new Error('Prediction did not complete in time');
      }

      if (prediction.output && prediction.output.length > 0) {
        setChatMessages(prev => [
          ...prev,
          {
            type: 'ai',
            content: "Here's the generated image:",
            image: prediction.output[0]
          }
        ]);
      } else {
        throw new Error("No image was generated");
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error.message);
      setChatMessages(prev => [...prev, { type: 'ai', content: `Error: ${error.message}` }]);
    }
  }, []);

  const handleImageUpload = useCallback(async (event) => {
    console.log('Image upload started');
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          console.log('Image loaded and optimized');
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

  const handleMaskCreated = useCallback((maskDataUrl) => {
    console.log('Mask created');
    setSelectedImage(prev => ({ ...prev, mask: maskDataUrl }));
    setHasMask(true);
  }, []);

  const handleToggleMask = useCallback((imageId) => {
    console.log('Toggling mask:', imageId, isDrawing);

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

  const handleSubmit = useCallback(async (inputText) => {
    console.log('Submitting:', inputText, 'Current task:', currentTask);
    console.log('Selected image:', selectedImage);

    setChatMessages(prev => [...prev, { type: 'user', content: inputText }]);
    setInput('');

    try {
      let payload = { prompt: inputText };

      if (selectedImage.original) {
        const { dataUrl, width, height } = await prepareImage(selectedImage.original);
        payload = {
          ...payload,
          image: dataUrl,
          width,
          height
        };

        if (isDrawing) {
          const { strokes, canvasSize } = await imageEditorRef.current.getStrokes();
          if (strokes && strokes.length > 0) {
            const mask = createMaskFromStrokes(strokes, canvasSize, width, height);
            payload.mask = mask;
          }
        }
      }

      const { endpoint, payload: validatedPayload } = getApiEndpoint(currentTask, payload);

      console.log('Payload prepared:', validatedPayload);

      openDebugTab({
        prompt: inputText,
        input: {
          image: validatedPayload.image,
          mask: validatedPayload.mask,
        },
        output: null,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedPayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'An error occurred');

      // Poll for the prediction result
      let prediction = data;
      for (let i = 0; i < 30; i++) {
        if (prediction.status === "succeeded") {
          break;
        } else if (prediction.status === "failed") {
          throw new Error('Prediction failed');
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusResponse = await fetch(`/api/predictions/${prediction.id}`);
        if (!statusResponse.ok) {
          throw new Error(`Failed to check prediction status: ${statusResponse.status}`);
        }
        prediction = await statusResponse.json();
      }

      if (prediction.status !== "succeeded") {
        throw new Error('Prediction did not complete in time');
      }

      // Handle the response and update the UI
      setChatMessages(prev => [
        ...prev,
        { type: 'ai', content: 'Here\'s the result based on your input:' },
        { type: 'ai', image: prediction.output ? prediction.output[0] : prediction.image }
      ]);

      setSelectedImage({
        original: prediction.output ? prediction.output[0] : prediction.image,
        optimized: prediction.output ? prediction.output[0] : prediction.image,
        mask: null
      });
      setIsDrawing(false);
      setActiveImageId(null);

    } catch (error) {
      console.error("Error in submission:", error);
      setError(error.message);
      setChatMessages(prev => [...prev, { type: 'ai', content: `Error: ${error.message}` }]);
    }
  }, [currentTask, selectedImage, setError, setChatMessages, setInput, isDrawing, imageEditorRef, openDebugTab]);

  const handleFileUpload = useCallback((event) => {
    console.log('File uploaded:', event.target.files[0]);
    // Call your existing handleImageUpload or similar function
  }, [/* dependencies */]);

  return (
    <Layout>
      <div style={{ height: `${windowHeight}px` }} className="flex flex-col">
        <NewChatButton onClick={handleNewChat} />
        <main className="flex-grow container mx-auto p-5 flex flex-col">
          <div className="flex-grow w-full max-w-4xl mx-auto mb-5 flex flex-col overflow-hidden">
            {!currentTask ? (
              <TaskSelector onTaskSelect={handleTaskSelect} />
            ) : (
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
                onFileUpload={handleFileUpload}
              />
            )}
          </div>
        </main>
        <PromptBar
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          onFileUpload={handleFileUpload}
        />
      </div>
    </Layout>
  );
}
