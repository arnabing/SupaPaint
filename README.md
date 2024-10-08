# SupaPaint AI Image Editor

## Project Overview

SupaPaint is a Next.js application designed for AI-powered image editing, particularly for staging houses and general photo editing. The app features an iMessage-like chat interface that allows users to upload images, mask specific areas for editing, and send these images to Replicate for processing using Stable Diffusion or other AI models.

## Current State

- Basic functionality implemented: image upload, mask creation, and API integration.
- Chat interface displays user inputs and AI responses.
- Image optimization for SDXL implemented.
- Debug tab shows input image, mask, and output.
- Inpainting with SDXL is functional.

## Recent Changes

1. Implemented SDXL inpainting functionality.
2. Added debug tab for input/output visualization.
3. Improved error handling and logging.
4. Optimized image and mask preparation for API requests.

## Immediate Goals

1. Implement mask clearing for all images, including generated ones.
2. Enable mask drawing on any image in the chat history, including AI-generated images.
3. Refine the UI for a more intuitive mask drawing experience.
4. Implement undo/redo functionality for mask drawing.
5. Add option to adjust mask brush size.

## Key Features

- iMessage-like chat interface
- Image uploading and display
- Accurate image masking functionality using ReactSketchCanvas
- Integration with AI services for image processing
- Debug tab for payload inspection
- SDXL optimization for uploaded images

## Technology Stack

- Next.js
- React
- Tailwind CSS
- react-sketch-canvas (for mask drawing)
- Replicate API (for AI image processing)

## Project Structure

```
supapaint/
├── components/
│   ├── ChatInterface.js
│   ├── ImageEditor.js
├── lib/
│   └── imageUtils.js
├── pages/
│   ├── api/
│   │   └── predictions.js
│   ├── _app.js
│   └── paint.js
├── styles/
│   └── globals.css
└── public/
    ├── bedroom.png
    └── livingroom.png
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Set up environment variables (create a `.env.local` file with `REPLICATE_API_TOKEN=your_token_here`)
4. Run the development server: `npm run dev` or `yarn dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser


## Next Steps

1. Integrate Replicate Flux API for image generation without masks.
2. Implement a user interface for selecting between inpainting and image generation.
3. Add support for other AI models (e.g., remove background, search and recolor).
4. Integrate an LLM for enhancing user prompts and selecting appropriate AI models.
5. Improve error handling and user feedback for API interactions.
6. Implement comprehensive testing (unit tests, integration tests).
7. Optimize performance for processing larger images and complex masks.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request

Please ensure your code adheres to the existing style conventions and includes appropriate tests.