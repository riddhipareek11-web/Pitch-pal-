import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Helper function to query DuckDuckGo HTML and scrape search results
async function searchDDG(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      console.warn(`DDG search failed for query: "${query}" with status: ${response.status}`);
      return [];
    }
    
    const body = await response.text();
    const $ = cheerio.load(body);
    const results = [];
    
    $(".result").each((i, el) => {
      const title = $(el).find(".result__title").text().trim();
      const snippet = $(el).find(".result__snippet").text().trim();
      const link = $(el).find(".result__url").attr("href");
      if (title && snippet) {
        results.push({ title, snippet, link });
      }
    });
    
    return results.slice(0, 8);
  } catch (e) {
    console.error(`Error querying DDG for "${query}":`, e);
    return [];
  }
}

app.post('/api/research', async (req, res) => {
  const { brandName } = req.body;
  if (!brandName || !brandName.trim()) {
    return res.status(400).json({ error: "Brand name is required." });
  }

  try {
    console.log(`Researching brand: "${brandName}"`);
    
    // Fetch context in parallel to keep search fast
    const [resultsStrategy, resultsProducts] = await Promise.all([
      searchDDG(`${brandName} brand marketing strategy positioning audience`),
      searchDDG(`${brandName} top products price range competitors`)
    ]);
    
    const allResults = [...resultsStrategy, ...resultsProducts];
    console.log(`Gathered ${allResults.length} search results for "${brandName}"`);
    
    const searchContext = allResults.map((item, idx) => {
      return `[Result ${idx + 1}] Title: ${item.title}\nURL: ${item.link}\nSnippet: ${item.snippet}\n`;
    }).join("\n");
    
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    
    const prompt = `
      You are an expert market researcher and brand strategist.
      Your task is to conduct deep research on the brand "${brandName}" based on the following real web search results and your own knowledge.
      
      Web Search Context:
      ${searchContext || "No search results available. Synthesize based on your own knowledge of this brand."}
      
      You must construct a complete, detailed brand research report.
      Format the output STRICTLY as a JSON object. Ensure every field is filled with real, high-quality information (no placeholders, no mock data, no "N/A" if possible, make logical inferences if needed).
      
      The JSON structure MUST follow this exact schema:
      {
        "researchPurpose": "A clear description of the research purpose for this brand.",
        "category": "The industry/product category (e.g. Beauty/Cosmetics, Skincare, Athleisure, Tech, etc.)",
        "market": "Market scope (e.g., Global, primarily US & India, etc.)",
        "brandSnapshot": {
          "standsFor": "What does the brand stand for? Core values, mission statement.",
          "personality": "Brand personality adjectives (e.g., Inclusive, empathetic, authentic)",
          "toneOfVoice": "Description of the tone of voice (e.g., Warm, friendly, empowering)",
          "visualPersonality": "Visual style details (e.g., Minimalist, pastel tones, soft focus, diverse casting)",
          "brandPromise": "The core promise to the customer (e.g., Making mental health and self-acceptance key to beauty)"
        },
        "productCategory": {
          "currentlySells": "What the brand currently sells (types of products)",
          "priceContext": "Price context (e.g., mid-range premium, drugstore, luxury) and general price point examples"
        },
        "productFeatures": {
          "commonHeroCues": "Common or hero functional cues (e.g., easy-to-blend liquid formulas, skin-loving ingredients, custom easy-open packaging)",
          "heroExample": "Specific hero example product (e.g. Soft Pinch Liquid Blush, detailing its features)"
        },
        "featuresToBenefits": [
          { "feature": "Name of Feature 1", "benefit": "Customer Benefit 1" },
          { "feature": "Name of Feature 2", "benefit": "Customer Benefit 2" }
        ],
        "targetAudience": {
          "primaryTG": "Primary Target Group (demographics, age group, e.g. Gen Z & Millennials who value self-care)",
          "secondaryTG": "Secondary Target Group",
          "psychographics": "Interests, lifestyle, values (e.g., mental health awareness, clean beauty, minimal makeup look)"
        },
        "audienceNeed": {
          "functionalNeed": "Functional needs (e.g., cosmetics that are easy to apply and last all day)",
          "emotionalNeed": "Emotional needs (e.g., feeling accepted, not feeling pressured by unrealistic beauty standards)",
          "lifestyleNeed": "Lifestyle needs (e.g., quick 5-minute makeup routine for busy students/professionals)",
          "jtbd": "Jobs To Be Done: What is the customer hiring this brand to do? (e.g., 'Help me express my natural beauty and boost my confidence without looking cakey')"
        },
        "audienceBehaviour": {
          "typicalBehaviours": "How they buy, use, or think about products",
          "contentBehaviour": "Where they hang out and how they consume content (e.g., highly active on TikTok, following beauty influencers, searching for routines)"
        },
        "painPoints": {
          "productPainPoints": "Common complaints or issues with products in this category (e.g., standard blush is either too powdery or fades too fast)",
          "buyingPainPoints": "Buying friction (e.g., shade matching online, high-demand items frequently out of stock)"
        },
        "purchaseMotivation": {
          "primary": "Primary reason they buy this brand",
          "keyTrigger": "Key psychological trigger (e.g. Selena Gomez endorsement, feeling of community/belonging, self-love)"
        },
        "competitiveContext": "Who are their main competitors and how does this brand stand out?",
        "brandContentGap": "Where are they missing out or what is the gap in their content marketing? (e.g., not enough educational content on how to layer products, or lacking deep dives into raw ingredients)",
        "contentObjective": {
          "primary": "Primary content marketing objective",
          "secondary": "Secondary content marketing objective",
          "possibleKpi": "Possible KPIs (e.g., conversion rate, save rate, engagement rate, UGC video submissions)"
        },
        "oneThingToRemember": "The one key takeaway the audience should remember after seeing content for this brand.",
        "coreMessagingPillars": [
          "Core Messaging Pillar 1",
          "Core Messaging Pillar 2",
          "Core Messaging Pillar 3"
        ],
        "previousReelUgcAngles": [
          "UGC/Reel Angle 1",
          "UGC/Reel Angle 2",
          "UGC/Reel Angle 3"
        ],
        "previousHookBank": [
          "Hook 1",
          "Hook 2",
          "Hook 3"
        ],
        "visualStoryboardDirection": "Visual and aesthetic direction for content (e.g., Bright, soft natural lighting, close-up texture shots, candid emotions, minimal editing)",
        "previousCta": [
          "CTA 1",
          "CTA 2",
          "CTA 3"
        ],
        "creatorOpportunity": "How can a content creator partner with this brand? What angles are they looking for? (e.g., raw, unfiltered reviews, mental health advocacy tie-ins, accessibility focus)"
      }
      
      Respond ONLY with the raw JSON object. Do not include markdown code block syntax (like \`\`\`json).
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON output:", responseText);
      return res.status(500).json({ error: "Failed to parse synthesized brand research. Please try again." });
    }

    res.json(parsedData);
  } catch (error) {
    console.error("Error in /api/research:", error);
    res.status(500).json({ error: "An error occurred during brand research generation." });
  }
});

app.listen(PORT, () => {
  console.log(`Brand Researcher Server running on port ${PORT}`);
});
