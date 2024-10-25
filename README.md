# SupaPaint AI Image Editor

## Project Overview

SupaPaint is a Next.js application designed for AI-powered image editing and generation. The app features a chat interface that allows users to upload images, mask specific areas for editing, and interact with various AI models for image processing and generation.

## Current State

- Basic functionality implemented: image upload, mask creation, and API integration.
- Inpainting with SDXL and image generation via Replicate API.
- Chat interface displays user inputs and AI responses.
- Image optimization for SDXL implemented.
- Debug tab shows input image, mask, and output.
- Task-based workflow for different image processing operations.

## Recent Changes

1. Implemented a unified API handler for both inpainting and image generation tasks.
2. Simplified state management using React hooks.
3. Created a consistent approach to image handling across different tasks.
4. Updated the prompt bar to be more flexible based on the current task.
5. Improved error handling and logging for API interactions.

## Immediate Goals

1. Refine the unified API handler to ensure consistent functionality for all tasks.
2. Implement proper state management for tracking the current task and relevant data.
3. Enhance the UI to provide clear guidance based on the selected task.
4. Ensure seamless switching between inpainting and image generation tasks.
5. Implement robust error handling and user feedback for all operations.
6. Prepare the codebase for future integration with an LLM for task suggestions.

## Key Features

- Chat-based interface for interacting with AI models
- Image uploading, display, and editing
- Accurate image masking functionality using ReactSketchCanvas
- Integration with multiple AI services for image processing and generation
- Debug tab for payload inspection
- SDXL optimization for uploaded images

## Technology Stack

- Next.js
- React
- Tailwind CSS
- react-sketch-canvas (for mask drawing)
- Replicate API (for AI image processing and generation)

## Project Structure

```
supapaint/
├── components/
│   ├── ChatInterface.js
│   ├── ImageEditor.js
│   ├── GeminiLayout.js (new)
│   ├── sidebar-desktop.js (new)
│   ├── sidebar-mobile.js (new)
│   └── ui/ (new folder with Gemini UI components)
├── lib/
│   ├── imageUtils.js
│   └── hooks/
│       └── use-sidebar.js (new)
├── pages/
│   ├── api/
│   │   ├── predictions.js
│   │   └── generate/
│   │       └── image.js (new)
│   ├── _app.js
│   └── index.js (formerly paint.js)
├── styles/
│   └── globals.css
└── public/
    ├── bedroom.png
    └── livingroom.png
```

## Known Issues

- **Inpainting Functionality**: Currently experiencing issues with inpainting due to recent CORS adjustments. The API may not be receiving all required parameters, or there may be issues with the API version being used.
  - **Relevant Code**: 
    - `inpaint.js`: 
      ```javascript:pages/api/edit/inpaint.js
      startLine: 16
      endLine: 59
      ```
    - `apiRouter.js`: 
      ```javascript:lib/apiRouter.js
      startLine: 1
      endLine: 25
      ```
    - `index.js`: 
      ```javascript:pages/index.js
      startLine: 1
      endLine: 100
      ```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Set up environment variables (create a `.env.local` file with `REPLICATE_API_TOKEN=your_token_here`)
4. Run the development server: `npm run dev` or `yarn dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Next Steps

1. Finalize the integration of Gemini UI components, ensuring smooth functionality in our JavaScript environment.
2. Complete the implementation of the Replicate Flux API for image generation.
3. Develop a user-friendly interface for switching between different AI tasks (inpainting, generation, etc.).
4. Enhance the chat interface to support a richer history of interactions, including easy access to past images and edits.
5. Implement an LLM integration for enhancing user prompts and automatically selecting appropriate AI models.
6. Improve error handling and user feedback for all API interactions.
7. Develop a comprehensive testing suite, including unit tests and integration tests.
8. Optimize performance for processing larger images and complex masks.
9. Implement user authentication and session management for personalized experiences.
10. Explore additional AI models for specialized tasks (e.g., background removal, style transfer).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request

Please ensure your code adheres to the existing style conventions and includes appropriate tests.
