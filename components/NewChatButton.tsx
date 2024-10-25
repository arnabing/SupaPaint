import React from 'react'
import { IconPlus } from './ui/icons'

const NewChatButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="New Chat"
        >
            <IconPlus className="w-6 h-6 text-gray-600" />
        </button>
    )
}

export default NewChatButton
