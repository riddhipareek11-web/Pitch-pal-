# Team Collaboration & Workflow Guide

Welcome to the Team AI Transcripts repository. This document outlines how our team collaborates on AI prototypes, maintains context, and ensures a unified workflow.

## Collaboration Workflow

### 1. Prototype Structure (Throwaway Experiments)
- All prototypes are throwaway. 
- Create a new sub-folder under `prototypes/` for each new experiment or feature set.
- Naming convention: `prototypes/Script-experiment-[number]` or `prototypes/[feature-name]-[v1]`.
- Each prototype folder should be self-contained (e.g., have its own frontend/backend if applicable).

### 2. Maintaining Context & Documentation
To ensure all team members (and the AI agents we work with) have the same context:
- **Handoff Files**: Update `docs/handoff.md` (or create a new one inside your prototype folder) to describe how your prototype works and how to run it.
- **System Architecture**: Update `docs/architecture.md` if you introduce database models, external APIs, or other infrastructure.
- **Keep it Clean**: Never commit `.env` files with secret API keys. Always use `.gitignore` to keep them local.

### 3. Workflow Standardization
- When starting a new experiment, copy this `docs/agents.md` file structure if needed, or reference it to align on the project goals.
- Document any specific prompt templates or system prompts used for AI generation in your prototype.
