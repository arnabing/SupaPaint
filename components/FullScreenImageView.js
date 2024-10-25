import React from 'react';
import PromptBar from './PromptBar';
import { X as IconX, Pencil as IconPencil } from 'lucide-react';

const FullScreenImageView = ({ image, onClose, onMaskToggle, isMaskActive, onSendMessage }) => {
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 bg-gray-900">
                <button onClick={onMaskToggle} className={`p-2 rounded-full ${isMaskActive ? 'bg-blue-500' : 'bg-gray-700'}`}>
                    <IconPencil className="w-6 h-6 text-white" />
                </button>
                <button onClick={onClose} className="p-2 rounded-full bg-gray-700">
                    <IconX className="w-6 h-6 text-white" />
                </button>
            </div>
            <div className="flex-grow flex items-center justify-center p-4">
                <img src={image} alt="Selected" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="p-4">
                <PromptBar onSubmit={onSendMessage} />
            </div>
        </div>
    );
};

export default FullScreenImageView;
