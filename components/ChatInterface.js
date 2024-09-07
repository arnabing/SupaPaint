import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  canSubmitPrompt,
  onMaskCreated,
  activeMaskImage,
  toggleMask,
  selectedImage,
  onImageSelect
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && canSubmitPrompt) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex-grow overflow-auto p-4 w-full">
      {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            onMaskCreated={onMaskCreated}
            isActiveMask={message.image === activeMaskImage}
            toggleMask={toggleMask}
            isSelected={message.image === selectedImage}
            onImageSelect={onImageSelect}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a prompt..."
            className="block w-full flex-grow rounded-l-md"
          />
          <button
            type="submit"
            className={`bg-black text-white rounded-r-md text-small inline-block p-3 flex-none ${
              !canSubmitPrompt ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!canSubmitPrompt}
          >
            Paint
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;