
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const recommendationSchema = new mongoose.Schema({
  userInput: String,
  recommendations: [String],
  createdAt: { type: Date, default: Date.now }
});

const Recommendation = mongoose.model(
  "Recommendation",
  recommendationSchema
);


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function recommendMovies(text) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `
      You are a movie recommendation expert.
      Suggest 3 to 5 movies based on user preference.
      Return ONLY movie names separated by commas.
      No explanation.
    `
  });

  const result = await model.generateContent(text);
  return result.response.text();
}


app.post("/recommend", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await recommendMovies(text);

    const movies = response
      .split(",")
      .map(m => m.trim())
      .filter(Boolean);

    await Recommendation.create({
      userInput: text,
      recommendations: movies
    });

    res.json({ recommendations: movies });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API error" });
  }
});


const PORT = 5000 || process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);


