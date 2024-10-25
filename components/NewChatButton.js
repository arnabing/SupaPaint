import React from 'react';
import { IconPlus } from './ui/icons';

const NewChatButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed top-0 left-0 p-2 h-12 bg-transparent hover:bg-gray-100 transition-colors z-10 flex items-center justify-center"
            aria-label="New Chat"
        >
            <IconPlus className="w-6 h-6 text-gray-600" />
        </button>
    );
};

export default NewChatButton;
