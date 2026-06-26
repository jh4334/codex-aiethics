# Repository Guide for Codex

## Project

This repository contains a static HTML5 Canvas game for Korean elementary AI ethics education.

Current redesign goal:

- Convert the game into a concept-driven AI ethics escape-room RPG.
- Follow `docs/superpowers/specs/2026-06-26-ai-ethics-stage-redesign-design.md`.
- Track implementation in GitHub issue #1.

## Setup

Use Node.js 20 or newer.

Recommended setup for cloud or Codespaces work:

```bash
npm install
npm install --no-save playwright
npx playwright install --with-deps chromium
```

If `--with-deps` is unavailable in the environment, run:

```bash
npx playwright install chromium
```

## Verification

Run these before pushing code changes:

```bash
npm run validate
npm test
npm run test:browser
npm run test:pack
```

For documentation-only changes, at minimum run:

```bash
npm run validate
git diff --check
```

## Design Direction

The approved direction is five AI ethics stages:

1. Data Footprint Forest: privacy, consent, data traces.
2. Filter Bubble Maze: recommendations, confirmation bias, diverse perspectives.
3. Bias Court: dataset bias, fairness, representation.
4. Deepfake Broadcast Station: generative AI, misinformation, source checking.
5. Responsibility Core: human oversight, accountability, synthesis.

Ending branches should be based on approximately 70% ethical map choices and 30% monster persuasion.

## Implementation Notes

- Keep the game classroom-safe: failure should become reflection, not punishment.
- Do not add the item system yet; it is a later feature.
- Preserve the existing static deployment model: no backend, no login, no database.
- Update teacher docs, README, tests, and browser smoke coverage when behavior changes.
- Do not commit generated `ai-ethics-adventure-offline.zip`.
