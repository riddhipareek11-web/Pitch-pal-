# PitchPal: Onboarding & Login Prototype (Experiment 2)

This folder contains the standalone onboarding, login, and dashboard welcome flow MVP for **PitchPal**. It is built as a separate clone of the original script generator prototype to ensure the original files are preserved.

## New Features Implemented

1. **Global Header & Navigation**:
   - Contains Logo `⚡ PitchPal`.
   - Post-login menu items: `Home` & `My Pitches` (both navigate to Welcome Screen) and a `+ New Pitch` button (resets and starts a new script brief).
   - Profile avatar with dropdown listing user's name & Instagram ID, plus a **Logout** button.
2. **Login Portal**:
   - Clean, modern layout using Indigo and Slate color scheme.
   - **Login with Email**: Displays Google-like account picker with mock profiles. Selecting one automatically proceeds to onboarding.
   - **Login with Phone**: Input phone number and enter a mock OTP code (`4821` with verification error state validation).
3. **Onboarding Details Form**:
   - Prompts the user to enter their **Full Name** and **Instagram Username** (e.g. `Septumringvali`).
4. **Welcome Screen Dashboard**:
   - Displays dynamic tagline: `Ready to pitch your next dream brand, @Septumringvali?` using the creator's username.
   - Includes badge: `✨ AI-Powered Influencer Outreach`
   - Includes button: `🚀 Pitch a New Brand` which opens the script brief generator.
5. **Seamless Script Generator Integration**:
   - Clicking `🚀 Pitch a New Brand` transitions the app into the existing brief upload/strategy/script editor sequence under the same header.

---

## How to Run

Ensure the backend and frontend are running on separate terminals.

### 1. Backend Server Setup
1. Open a new terminal.
2. Navigate to `prototypes/Script-experiment-2/backend`:
   ```bash
   cd prototypes/Script-experiment-2/backend
   ```
3. Start the server (runs on `http://localhost:5001`):
   ```bash
   npm start
   ```

### 2. Frontend App Setup
1. Open another terminal.
2. Navigate to `prototypes/Script-experiment-2/frontend`:
   ```bash
   cd prototypes/Script-experiment-2/frontend
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL in your browser.
