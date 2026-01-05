# PERFECT PUZZLE

A sliding-puzzle web app built with React + TypeScript and Vite. Upload any image, crop the portion you want to use, choose a grid size (2x2 — 12x12) and play a sliding-tile puzzle generated from your crop.

## Demo / Preview

Recording (screen capture):

https://github.com/user-attachments/assets/31ffb298-0e5c-46fd-b557-308a92e66a4f

Live demo: https://sayakaono.github.io/sliding-puzzle/

## Features

- Upload an image and crop the exact area to use for the puzzle (react-image-crop).
- Choose grid sizes from 2x2 up to 12x12.
- Works on desktop and mobile (touch/click).
- Built with modern stack: React 19, TypeScript, Vite.

## Quick start

Prerequisites
- Node.js 18+ (recommended)
- npm (or yarn/pnpm) — the repository uses npm in examples below

Clone and install
```bash
git clone https://github.com/SayakaOno/sliding-puzzle.git
cd sliding-puzzle
npm install
```

Run dev server
```bash
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

Build for production
```bash
npm run build
```

Preview production build locally
```bash
npm run preview
```

Lint
```bash
npm run lint
```

## How to use

1. Open the app in your browser.
2. Select a grid size from the selector (default is 3x3).
3. Upload an image (or use the sample if provided).
4. Use the crop UI to select the portion of the image you want used for the puzzle.
   - A preview canvas displays the crop.
5. Click "Start Game" to generate the puzzle from the cropped image.
6. Play by clicking or tapping tiles adjacent to the empty space to slide them into place.

Notes:
- The UI enables starting the game only after a valid crop has been created.
- Larger grid sizes (e.g., 10x10+) increase the number of tiles and may be slower on low-powered devices.

## Project structure (high level)

- src/
  - components/
    - ImageSetup — image upload + cropping UI and preview canvas
    - Game — game logic and tile rendering
  - App.tsx — app shell and state for grid size / play mode
  - main.tsx, CSS files, and type definitions
- index.html, vite.config.ts, tsconfig*.json
- package.json — dependencies & scripts

Key dependencies
- react, react-dom (React 19)
- typescript
- vite
- react-image-crop (image cropping)
- react-select (grid size selector)
- react-modal, tsparticles (visuals/UX)

## Technical details / implementation notes

- Cropping logic is adapted from the React Image Crop demo patterns.
- The puzzle is client-side only — no backend required.

## Acknowledgements

Dedicated to my niece — she supplied the ideas and the colour palette, which really helped.<br />
Thank you, Reina — it was so much fun building the app with you 🫶❤️

- react-image-crop demo for canvas/cropping patterns
- Vite + React starter for the project scaffold
