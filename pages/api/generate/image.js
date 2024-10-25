import Replicate from "replicate";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb',
        },
    },
};

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        console.log('API: Image generation - Method not allowed');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            console.log('API: Image generation - Missing prompt parameter');
            return res.status(400).json({ error: 'Missing prompt parameter' });
        }

        console.log('API: Image generation request received', { prompt });

        const prediction = await replicate.predictions.create({
            model: "black-forest-labs/flux-schnell",
            input: { prompt, num_outputs: 1 }
        });

        console.log("API: Image generation prediction created", { id: prediction.id });

        let completed;
        for (let i = 0; i < 30; i++) {
            const latest = await replicate.predictions.get(prediction.id);
            if (latest.status !== "starting" && latest.status !== "processing") {
                completed = latest;
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        if (!completed) {
            console.log("API: Image generation prediction timed out", { id: prediction.id });
            throw new Error("Prediction timed out");
        }

        console.log("API: Image generation completed", { id: completed.id, outputUrl: completed.output[0].substring(0, 50) + '...' });

        return res.status(201).json(completed);
    } catch (error) {
        console.error('API: Error in image generation route:', error.message);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}
