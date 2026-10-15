
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini AI setup
const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
    ? new GoogleGenAI({ apiKey })
    : null;

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Homepage
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

// Generate AI Quote
app.post("/api/generate-quote", async (req, res) => {
    try {
        if (!ai) {
            return res.status(500).json({
                error: "Gemini API key is not configured."
            });
        }

        const topic = String(req.body?.topic || "").trim();

        if (!topic) {
            return res.status(400).json({
                error: "Please provide a quote topic."
            });
        }

        if (topic.length > 100) {
            return res.status(400).json({
                error: "Topic must be 100 characters or less."
            });
        }

        const prompt = `
Create ONE original motivational or inspirational quote
based on this topic: "${topic}"

Rules:
- Write only one short, powerful and natural quote.
- Do not use quotation marks.
- Do not copy famous quotes.
- Do not add explanations or hashtags.
- Do not add bullet points.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 1,
                maxOutputTokens: 100
            }
        });

        const quote = response.text?.trim();

        if (!quote) {
            return res.status(502).json({
                error: "Gemini returned an empty response. Please try again."
            });
        }

        return res.json({
            quote,
            author: "QuoteVerse AI"
        });

    } catch (error) {
        console.error("Gemini API error:", error);

        return res.status(500).json({
            error: "Could not generate the quote. Please try again."
        });
    }
});

// Local development server
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(
            `QuoteVerse running at http://localhost:${PORT}`
        );
    });
}

// Export Express app for Vercel
export default app;
