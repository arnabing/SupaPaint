import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    console.log("Fetching prediction with ID:", id);
    const prediction = await replicate.predictions.get(id);
    console.log("Prediction fetched:", prediction);

    res.status(200).json(prediction);
  } catch (error) {
    console.error('Error fetching prediction:', error);
    res.status(500).json({ error: error.message });
  }
}