import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// File upload setup (memory storage for quick processing)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Helper function to extract text from files
async function extractTextFromFile(file) {
    if (!file) return "";
    
    try {
        if (file.mimetype === 'application/pdf') {
            const data = await pdfParse(file.buffer);
            return data.text;
        } else if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            file.mimetype === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            return result.value;
        } else if (file.mimetype === 'text/markdown' || file.mimetype === 'text/plain') {
            return file.buffer.toString('utf-8');
        }
    } catch (e) {
        console.error("Error parsing file:", e);
    }
    return "";
}

// Endpoint 1: Analyze Brief (Step 1 -> Step 2)
app.post('/api/analyze', upload.array('files'), async (req, res) => {
    try {
        const { text, canvaLink } = req.body;
        const files = req.files || [];

        let combinedBrief = text || "";
        if (canvaLink) combinedBrief += `\nCanva Link provided: ${canvaLink}`;
        
        if (files.length > 0) {
            for (const file of files) {
                const fileText = await extractTextFromFile(file);
                combinedBrief += `\nDocument (${file.originalname}) Content:\n${fileText}`;
            }
        }

        if (!combinedBrief.trim()) {
            return res.status(400).json({ error: "Please provide a brief via text or file upload." });
        }

        // Call Gemini to analyze the brief
        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const prompt = `
            Analyze the following brand/product brief and extract the key information.
            Format the output STRICTLY as a JSON object with the following keys:
            - "objective": The main goal or why they are doing this (e.g. Launch new product).
            - "audience": Define the target audience (e.g. Gen Z, tech savvy).
            - "coreIdea": The core idea or main message (e.g. Make it look cool and effortless).
            
            Keep the extracted text short and concise. If the brief doesn't explicitly state one of them, make an educated guess based on the context.

            Brief Content:
            ${combinedBrief}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        let analysisData;
        try {
            analysisData = JSON.parse(responseText);
        } catch (parseErr) {
            console.error("Failed to parse Gemini JSON:", responseText);
            // Fallback object if parsing fails
            analysisData = { objective: "Unknown", audience: "Unknown", coreIdea: "Unknown" };
        }

        res.json(analysisData);

    } catch (error) {
        console.error("Error in /api/analyze:", error);
        res.status(500).json({ error: "Failed to analyze brief." });
    }
});

// Endpoint 2: Generate Scripts (Step 2 -> Step 3)
app.post('/api/generate', async (req, res) => {
    try {
        const { objective, audience, coreIdea } = req.body;

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const prompt = `
            You are an expert short-form video scriptwriter (e.g., for Instagram Reels, TikTok).
            Based on the following parameters:
            - Objective: ${objective}
            - Target Audience: ${audience}
            - Core Idea: ${coreIdea}

            Generate 3 distinct script variations:
            1. "simple": A simple, safe, and direct script.
            2. "bestMatch": The best matching script for the requested audience and idea.
            3. "boldMove": An out-of-the-box, highly engaging, risky/bold script.

            EACH script MUST strictly follow this exact 4-part structure (with the exact keys):
            - "hook": 0-3 seconds. Impactful, scroll-stopping, addresses the target audience, or asks a shocking question. Include what we see (Visual/B-roll) and hear (VO/Dialogue).
            - "setup": 3-15 seconds. Pain points, benefits for viewers, why the audience should care.
            - "content": 15-45 seconds. Fast tips, product demo, fast angle changes.
            - "cta": Final 3-5 seconds. Ask to follow, comment/save/share, or read caption.

            Format the ENTIRE output STRICTLY as a JSON object matching this structure:
            {
              "simple": { "hook": "...", "setup": "...", "content": "...", "cta": "..." },
              "bestMatch": { "hook": "...", "setup": "...", "content": "...", "cta": "..." },
              "boldMove": { "hook": "...", "setup": "...", "content": "...", "cta": "..." }
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        let scriptsData;
        try {
            scriptsData = JSON.parse(responseText);
        } catch (parseErr) {
            console.error("Failed to parse Gemini scripts JSON:", responseText);
            throw new Error("Invalid output format from AI");
        }

        res.json(scriptsData);

    } catch (error) {
        console.error("Error in /api/generate:", error);
        res.status(500).json({ error: "Failed to generate scripts." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
