# AI Script Generator - Developer Handoff

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Axios, Lucide-React
- **Backend**: Node.js, Express, Multer (File uploads)
- **AI**: Google Generative AI (\`@google/generative-ai\`) for Gemini 1.5 Pro
- **File Parsing**: \`pdf-parse\` (PDFs), \`mammoth\` (Word docs)

## Directory Structure
- \`prototype/backend/\`: Node.js API.
- \`prototype/frontend/\`: React frontend app.

## How to Run

### 1. Backend Setup
1. Ensure Node.js is installed.
2. Navigate to \`prototype/backend\` in terminal: \`cd prototype/backend\`
3. Install dependencies: \`npm install\`
4. Open \`.env\` and replace \`your_gemini_api_key_here\` with a real Google AI Studio API key.
5. Start server: \`npm start\` (Runs on http://localhost:5001)

### 2. Frontend Setup
1. Open a new terminal window.
2. Navigate to \`prototype/frontend\`: \`cd prototype/frontend\`
3. Install dependencies: \`npm install\`
4. Start dev server: \`npm run dev\`
5. Open the displayed local URL in your browser.

## Features Implemented
- **Step 1**: Upload files, paste Canva links, or type the brief.
- **Step 2**: Gemini AI extracts Objective, Audience, and Core Idea. User can edit.
- **Step 3 & 4**: Generates 3 scripts (Simple, Best Match, Bold). Strict text editor UI that preserves Hook, Setup, Content, CTA formatting. Export to clipboard.
