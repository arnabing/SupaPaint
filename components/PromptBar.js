import React, { useRef } from 'react';
import Link from 'next/link';
import { IconArrowElbow, IconCamera } from './ui/icons';

const PromptBar = ({ input, setInput, onSubmit, onFileUpload }) => {
    const fileInputRef = useRef(null);

    const isInputEmpty = !input || input.trim() === '';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input);
            setInput('');
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center pb-3 pt-2">
            <div className="w-full max-w-3xl mx-auto px-4">
                <div className="relative flex items-center bg-darkgrey/100 backdrop-blur-md rounded-full border border-black/10 shadow-[0_0_10px_rgba(0,0,0,0.10)]">
                    <button
                        type="button"
                        className="absolute left-2 p-1 text-black/60 hover:bg-black/5 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <IconCamera className="h-6 w-6" />
                        <span className="sr-only">Upload image</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={onFileUpload}
                        accept="image/*"
                    />
                    <form onSubmit={handleSubmit} className="flex-grow">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Send a message."
                            className="w-full bg-transparent py-3 pl-12 pr-12 focus:outline-none"
                        />
                    </form>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="absolute right-2 p-1 text-black/60 hover:bg-black/5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!input.trim()}
                    >
                        <IconArrowElbow className="h-6 w-6" />
                        <span className="sr-only">Send message</span>
                    </button>
                </div>
                <div className="text-center mt-2 text-sm text-gray-500">
                    <Link href="https://www.linkedin.com/in/arnabing/" target="_blank" rel="noopener noreferrer">
                        built by Arnab Raychaudhuri
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PromptBar;
