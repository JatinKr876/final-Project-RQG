import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Check API key
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing in your .env file.");
    process.exit(1);
}

// Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static("public"));

// Generate Quote
app.post("/api/generate-quote", async (req, res) => {

    try {

        const topic = String(req.body.topic || "").trim();

        // Check topic
        if (!topic) {
            return res.status(400).json({
                error: "Please provide a quote topic."
            });
        }

        // Limit topic length
        if (topic.length > 100) {
            return res.status(400).json({
                error: "Topic must be 200 characters or less."
            });
        }

        // Prompt for Gemini
        const prompt = `
Create ONE original motivational or inspirational quote based on this request:

"${topic}"

Rules:
- Write only ONE quote.
- Make it short, powerful and natural.
- Do not use quotation marks.
- Do not copy any famous quote.
- Create a completely fresh and original quote.
- Do not add explanation.
- Do not add hashtags.
- Do not add bullet points.
- Do not mention that you are an AI.
`;

        let response;

        // First model
        try {

            console.log("Trying Gemini 3.5 Flash-Lite...");

            response = await ai.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: prompt,
                config: {
                    temperature: 1.0,
                    maxOutputTokens: 100
                }
            });

        } catch (firstError) {

            console.log(
                "Primary model unavailable. Trying fallback model..."
            );

            // Fallback model
            response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt,
                config: {
                    temperature: 1.0,
                    maxOutputTokens: 100
                }
            });
        }

        // Get generated text
        const generatedQuote = response.text?.trim();

        // Empty response
        if (!generatedQuote) {

            return res.status(502).json({
                error: "Gemini returned an empty response. Please try again."
            });

        }

        // Send quote to frontend
        res.json({
            quote: generatedQuote,
            author: "QuoteVerse AI"
        });

    } catch (error) {

        console.error("Gemini API error:");
        console.error(error);

        // Handle 503
        if (error?.status === 503) {

            return res.status(503).json({
                error: "Gemini is temporarily busy. Please try again in a few seconds."
            });

        }

        // Handle 401 / 403
        if (
            error?.status === 401 ||
            error?.status === 403
        ) {

            return res.status(401).json({
                error: "Gemini API key is invalid or does not have access."
            });

        }

        // Handle other errors
        res.status(500).json({
            error: "Could not generate the quote. Please check your Gemini API setup."
        });

    }

});

// Start server
app.listen(PORT, () => {

    console.log(
        `QuoteVerse is running at http://localhost:${PORT}`
    );

});