import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Paintbrush } from 'lucide-react';
import MaskDrawing from './MaskDrawing';

const ChatMessage = ({ message, onMaskCreated, isActiveMask, toggleMask, isSelected, onImageSelect }) => {
  const [aspectRatio, setAspectRatio] = useState(4 / 3);

  useEffect(() => {
    if (message && message.image) {
      const img = new window.Image();
      img.onload = () => {
        setAspectRatio(img.width / img.height);
      };
      img.onerror = (error) => {
        console.error('ChatMessage: Error loading image:', error);
      };
      img.src = message.image;
    }
  }, [message]);

  const handleMaskCreated = (maskDataUrl) => {
    onMaskCreated(maskDataUrl, message.image);
  };

  return (
    <div className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block rounded-lg ${
          message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
        } p-3 ${message.image ? 'w-full max-w-2xl' : 'max-w-[75%]'} ${
          isSelected ? 'border-2 border-yellow-500' : ''
        }`}
        onClick={() => message.image && onImageSelect(message.image)}
      >
        {message.content && <p className="mb-2">{message.content}</p>}
        {message.image && (
          <div className="relative w-full" style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}>
            {isActiveMask ? (
              <MaskDrawing
                imageUrl={message.image}
                onMaskCreated={handleMaskCreated}
                onCancel={() => toggleMask(message.image)}
              />
            ) : (
              <Image
                src={message.image}
                alt={message.content || "Chat image"}
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
                priority={true}
              />
            )}
          </div>
        )}
        {message.image && (
          <div className="mt-2 flex justify-start">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleMask(message.image);
              }} 
              className="bg-white text-black rounded-md px-2 py-1 text-xs flex items-center"
            >
              <Paintbrush className="w-4 h-4 mr-1" />
              {isActiveMask ? 'Clear mask' : 'Draw mask'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;