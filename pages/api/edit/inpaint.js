
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
    console.log('API: Inpainting - Method not allowed');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, image, mask, width, height } = req.body;

    if (!prompt || !image || !mask || !width || !height) {
      console.log('API: Inpainting - Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('API: Inpainting request received', {
      prompt,
      imageUrl: image.substring(0, 50) + '...',
      maskSize: mask.length,
      width,
      height
    });

    const prediction = await replicate.predictions.create({
      version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
      input: {
        prompt,
        image,
        mask,
        width,
        height,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        scheduler: "DPMSolverMultistep",
      },
    });

    console.log("API: Inpainting prediction created", { id: prediction.id });

    return res.status(201).json(prediction);
  } catch (error) {
    console.error('API: Error in inpainting predictions route:', error.message);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
