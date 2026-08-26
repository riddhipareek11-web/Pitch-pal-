# Creator AI Storyboard Studio — Architecture & Product Documentation

## 1. Product Context & Overview
The **Creator AI Storyboard Studio** is a modern, lightweight creative workspace built specifically for short-form social media video creators (Instagram Reels, TikTok, YouTube Shorts).

Unlike traditional studio film-production software that overwhelms creators with complex camera rig notations, this tool focuses on rapid narrative pacing, visual shot breakdown, and practical pre-production sketches that creators can use directly on set while shooting on mobile phones.

---

## 2. Core Workflow & Multi-Step Architecture

```
[01. SCRIPT INPUT]
       │
       ▼
[02. AI SCRIPT ANALYSIS]  ──► (Extracts HOOK, SETUP, CONTENT, CTA & Scene Timings)
       │
       ▼
[03. SHOT PLAN]          ──► (Planning Layer: "What needs to be filmed?")
       │
       ▼
[04. VISUAL SETUP]       ──► (Locks Creator, Product & Environment References)
       │
       ▼
[05. GENERATION]         ──► (Applies Simple Line Sketch Pre-production Style)
       │
       ▼
[06. STORYBOARD GRID]    ──► (Visualisation Layer: 9:16 Vertical Sketch Cards)
       │
       ▼
[07. DETAIL & REGENERATE]──► (Visual Variations A/B/C + Interactive Annotation)
       │
       ▼
[08. PREVIEW & EXPORT]   ──► (Reel Rhythm Sequence Player + Production PDF/PNG)
```

---

## 3. Core Design Principles

### A. Strict Separation of Planning vs. Visualisation
1. **Shot List (Planning Layer)**: Answers *"What needs to be filmed?"*
   - Creator action, subject movement, props, dialogue/VO, location setting, and narrative purpose.
2. **Storyboard (Visualisation Layer)**: Answers *"How will that shot look?"*
   - Camera angle (Eye level, Low angle, Overhead), framing (Wide, Medium, Close-up Macro), camera movement (Static, Snap Zoom, Handheld Bounce), and composition guidelines.

### B. Visual Language & Style Constraints
- **Visual Style**: Hand-drawn black-and-white pre-production line sketches.
- **Constraints**:
  - Clean ink strokes and pencil hatching.
  - Minimal shading, off-white background.
  - Clearly readable character expressions and actions.
  - Visible product branding and silhouettes (e.g. boAt Stone rugged speaker).
  - Dynamic hand-drawn movement arrows for soundwaves, trajectories, and camera pans.
  - Zero decorative clutter, photorealism, or 3D renders.

### C. Persistent Visual Reference System
- **Creator Reference**: Locks character traits (attire, hairstyle, expressions) across all frames.
- **Product Reference**: Maintains exact product geometry, rugged grills, and logo marks across all interactions.
- **Environment Context**: Grounds scenes into recognizable locations (Plaza, Auto-rickshaw, Gym, Sidewalk).

---

## 4. Key Feature Set

1. **Script Input & Beat Extraction**:
   - Supports vertical short-form formats (Instagram Reel, TikTok, Shorts).
   - Pre-loaded with the boAt speaker viral test sample script.
2. **Interactive Shot Plan Editor**:
   - Sequential numbered cards with section badges (`HOOK`, `SETUP`, `CONTENT`, `CTA`).
   - Move Up/Down, Duplicate, Inline Edit, and Delete with automatic renumbering.
3. **Visual Reference Setup**:
   - Creator and Product consistency locks with active status badges.
   - Constrained Simple Line Sketch style selector.
4. **Main Storyboard Grid**:
   - Grouped by narrative section with timing breakdowns.
   - Clean 9:16 aspect ratio sketch panels with hover actions for instant inspection.
5. **Two-Column Shot Detail & Interactive Canvas**:
   - Left: Large frame view with interactive drawing tool for sketching custom director arrows/notes.
   - Right: Clean separation of *"What the Shot Shows"* vs *"Camera & Composition"*.
6. **Multi-Variation Regeneration**:
   - Generates 3 visual options (`Sketch A: Creator Centered`, `Sketch B: Product Focus`, `Sketch C: Reaction Flow`).
   - Granular camera angle, composition, and expression overrides without altering other approved shots.
7. **Reel Rhythm Sequence Player**:
   - Simulates the flow and pacing of the Reel with subtitle cues and speed controls (1x, 1.5x).
8. **Creator Production PDF & Text Export**:
   - Generates printable production shoot sheets formatted for creator shoot days.

---

## 5. How to Run the Application

This is a zero-dependency, single-file modern web application.

1. Open `prototypes/storyboard/index.html` directly in any web browser (Chrome, Safari, Edge, Firefox).
2. Alternatively, run a local web server from the project directory:
   ```bash
   cd prototypes/storyboard
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.
