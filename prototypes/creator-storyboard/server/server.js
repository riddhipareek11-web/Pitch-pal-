import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { apiKey, textModel, imageModel, contentGoal, targetAudience, brief, script } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an expert storyboard artist. 
Break the provided script down into a sequence of logical visual frames (shots).
For each frame, provide:
1. 'action': What is happening visually on screen.
2. 'voiceover': The spoken script or text on screen for this frame.
3. 'image_prompt': A highly descriptive prompt to generate this exact frame. Start every image_prompt with: "Simple black and white line art sketch, minimal detail, rough storyboard draft".

Return a valid JSON array of these frame objects.`;

    const userPrompt = `Content Goal: ${contentGoal || 'N/A'}
Target Audience: ${targetAudience || 'N/A'}
Brief: ${brief || 'N/A'}

Script:
${script}

Output JSON Array format:
[
  {
    "action": "Description of action...",
    "voiceover": "Spoken text...",
    "image_prompt": "Simple black and white line art sketch, minimal detail, rough storyboard draft, [specific scene details]"
  }
]`;

    const textResponse = await ai.models.generateContent({
      model: textModel || 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const framesText = textResponse.text;
    let frames = [];
    try {
      frames = JSON.parse(framesText);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", framesText);
      return res.status(500).json({ error: 'Failed to parse AI response into structured frames.' });
    }

    const imageModelToUse = imageModel || 'imagen-3.0-generate-002';
    
    const framesWithImages = await Promise.all(frames.map(async (frame) => {
      try {
        const imgResponse = await ai.models.generateImages({
          model: imageModelToUse,
          prompt: frame.image_prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
          }
        });
        
        const base64Image = imgResponse.generatedImages[0].image.imageBytes;
        return {
          ...frame,
          imageUrl: `data:image/jpeg;base64,${base64Image}`
        };
      } catch (imgError) {
        console.error("Image generation failed for frame:", frame.image_prompt, imgError);
        return {
          ...frame,
          imageUrl: null,
          imageError: imgError.message
        };
      }
    }));

    res.json({ frames: framesWithImages });

  } catch (error) {
    console.error('Error generating storyboard:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Storyboard API Server running on port ${PORT}`);
});
