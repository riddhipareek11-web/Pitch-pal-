# Prototype Handoff Notes

This file tracks what's currently in `prototypes/` and how to run each one. Older, superseded prototypes are removed once a newer one replaces them - check git history if you need to recover one.

## creator-storyboard

The current, actively maintained prototype: brief -> shot-by-shot storyboard -> drafted brand pitch email/DM. See `prototypes/creator-storyboard/README.md` for what it does and full run instructions.

## Script-experiment-5: Integrated Script & Storyboard Flow

### Description
An integrated prototype that stitches the complete creation flow: **Login -> Brief Input -> AI-powered Brief Analysis & Strategy -> 3-variation Script Editor -> 4-frame Visual Storyboard Generator**. The script generator view features an "Approve & Create Storyboard" button that transitions the approved script (concatenated Hook, Setup, Content, CTA) directly to the Storyboard builder. The Storyboard generator supports generating images via Hugging Face Access Token with a robust, zero-configuration fallback using Pollinations.ai.

### How to Run

#### 1. Backend Setup
1. Open a terminal window.
2. Navigate to `prototypes/Script-experiment-5/backend`: `cd prototypes/Script-experiment-5/backend`
3. Run `npm install` (if not done already).
4. Add your `GEMINI_API_KEY` to the shared `.env` file at the repo root (copy `.env.example` to `.env` there if you haven't already).
5. Run `npm start` (Runs on http://localhost:5003).

#### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to `prototypes/Script-experiment-5/frontend`: `cd prototypes/Script-experiment-5/frontend`
3. Run `npm install` (if not done already).
4. Run `npm run dev` (Runs on http://localhost:3002).
5. Open `http://localhost:3002` in your browser.
