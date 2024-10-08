import React, { useState, useCallback, forwardRef } from 'react';
import { Paintbrush, Eraser } from 'lucide-react';
import ImageEditor from './ImageEditor';

const ChatInterface = forwardRef(({ chatMessages, onSendMessage, onMaskCreated, onToggleMask, selectedImage, activeImageId, isDrawing, hasMask, imageEditorRef }, ref) => {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (input.trim() || isDrawing) {
      console.log("[ChatInterface] Sending message:", input);
      onSendMessage(input);
      setInput('');
    }
  }, [input, onSendMessage, isDrawing]);

  return (
    <div className="flex flex-col h-full w-full chat-background">
      <div className="flex-grow overflow-auto p-4 w-full">
        {chatMessages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block rounded-lg p-3 ${message.image ? 'w-full max-w-2xl' : 'max-w-[75%]'} 
              ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
              {message.content && <p className="mb-2 break-words">{message.content}</p>}
              {message.image && (
                <div>
                  <ImageEditor
                    ref={imageEditorRef}
                    image={message}
                    onUpdateImage={onMaskCreated}
                    isDrawing={isDrawing && activeImageId === message.id}
                  />
                  <button
                    onClick={() => onToggleMask(message.id)}
                    className="mt-2 bg-black text-white rounded-md px-2 py-1 text-xs flex items-center"
                  >
                    {isDrawing && activeImageId === message.id ? (
                      <>
                        <Eraser className="w-4 h-4 mr-1" />
                        Clear Mask
                      </>
                    ) : (
                      <>
                        <Paintbrush className="w-4 h-4 mr-1" />
                        Draw Mask
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a prompt..."
            className="flex-grow rounded-l-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-r-md px-4 py-2 text-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
});

export default ChatInterface;