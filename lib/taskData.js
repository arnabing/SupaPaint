export const taskData = {
    generate: {
        initialChat: [
            { type: 'ai', content: 'What kind of image would you like to generate?' }
        ],
        demoImage: null
    },
    inpaint: {
        initialChat: [
            { type: 'ai', content: 'Upload an image and draw a mask to edit.' },
            { type: 'user', image: 'public/livingroom.png' }
        ],
        demoImage: 'public/livingroom.png'
    },
    removeBackground: {
        initialChat: [
            { type: 'ai', content: 'Upload an image to remove its background.' },
            { type: 'user', image: 'public/bedroom.png' }
        ],
        demoImage: 'public/bedroom.png'
    },
    stageHome: {
        initialChat: [
            { id: '1', type: 'ai', content: 'Hi. Draw an area to edit. What should we change?' },
            { id: '2', type: 'user', image: '/livingroom.png' },
            { id: '3', type: 'user', content: 'Modern bohemian bedroom, bed, throw, side tables, plants, wall decorations' },
            { id: '4', type: 'ai', content: "Here's the edited version based on your prompt:" },
            { id: '5', type: 'ai', image: '/bedroom.png' }
        ],
        demoImage: '/livingroom.png'
    }
    // Add more tasks as needed
};
