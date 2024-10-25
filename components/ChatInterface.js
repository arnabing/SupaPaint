import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Paintbrush, Eraser } from 'lucide-react';
import ImageEditor from './ImageEditor';
import PromptBar from './PromptBar';
import FullScreenImageView from './FullScreenImageView';

const ChatInterface = forwardRef(({
  chatMessages,
  onSendMessage,
  onMaskCreated,
  onToggleMask,
  selectedImage,
  activeImageId,
  isDrawing,
  hasMask,
  imageEditorRef,
  onFileUpload
}, ref) => {
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const handleImageClick = (image, messageId) => {
    if (!isDrawing || activeImageId !== messageId) {
      setFullScreenImage(image);
    }
  };

  const handleCloseFullScreen = () => {
    setFullScreenImage(null);
  };

  const handleSubmit = (message) => {
    onSendMessage(message);
  };

  return (
    <div className="flex flex-col h-full w-full chat-background">
      <div className="flex-grow overflow-auto p-4">
        {chatMessages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block rounded-lg p-3 ${message.image ? 'w-full max-w-2xl' : 'max-w-[75%]'} 
              ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
              {message.content && <p className="mb-2 break-words">{message.content}</p>}
              {message.image && (
                <div onClick={() => handleImageClick(message.image, message.id)}>
                  <ImageEditor
                    ref={imageEditorRef}
                    image={message}
                    onUpdateImage={onMaskCreated}
                    isDrawing={isDrawing && activeImageId === message.id}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMask(message.id);
                    }}
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
      {fullScreenImage && (
        <FullScreenImageView
          image={fullScreenImage}
          onClose={handleCloseFullScreen}
          onMaskToggle={() => onToggleMask(activeImageId)}
          isMaskActive={isDrawing}
          onSendMessage={handleSubmit}
        />
      )}
    </div>
  );
});

export default ChatInterface;
