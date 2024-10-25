const API_ROUTES = {
    generate: {
        endpoint: '/api/generate/image',
        requiredParams: ['prompt'],
        description: 'Generates an image based on a text prompt'
    },
    inpaint: {
        endpoint: '/api/edit/inpaint',
        requiredParams: ['prompt', 'image', 'mask', 'width', 'height'],
        description: 'Edits an existing image based on a text prompt and mask'
    },
    stageHome: {
        endpoint: '/api/edit/inpaint',
        requiredParams: ['prompt', 'image', 'width', 'height'],
        description: 'Stages a home image based on a text prompt, with optional inpainting'
    }
};

export function getApiEndpoint(task, payload) {
    let route;
    if (payload.mask) {
        route = API_ROUTES.inpaint;
    } else if (payload.image) {
        route = API_ROUTES.stageHome;
    } else {
        route = API_ROUTES[task] || API_ROUTES.generate;
    }

    const missingParams = route.requiredParams.filter(param => !payload.hasOwnProperty(param));
    if (missingParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }

    return {
        endpoint: route.endpoint,
        payload
    };
}
