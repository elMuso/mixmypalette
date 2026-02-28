# 🎨 MixMyPalette

**MixMyPalette** is a high-precision digital paint-mixing assistant. Unlike standard digital color mixers that use additive RGB math (which often turns muddy), MixMyPalette uses **Mixbox** to simulate real-world pigment scattering and absorption.

Whether you are a miniature painter, oil artist, or DIYer, this tool helps you find the exact ratio of your own paints to match any target color from an image.

Huge thanks to the [Paint-Mixer](https://github.com/Palette-Pickers/paint-mixer) implementation, without which this project would not have been possible.

## ✨ Features

- **Physical Pigment Simulation**: Powered by the `mixbox` library for realistic "Blue + Yellow = Green" results.
- **Perceptual Accuracy**: Uses the `CIE94` Delta-E algorithm to calculate color similarity based on how humans actually see color.
- **Multi-Branch Evolutionary Solver**: A parallel-processing engine that runs 4 simultaneous "branches" of color combinations, performing over 30,000 "thoughts" per second to find the best match.
- **Dual-Mode Discovery**: Optimized for both quick "Standard" mixes (capped at 10 parts) and "Precision" deep searching.
- **Live Image Sampling**: Upload an image, zoom, and pick a target color directly from the pixels.
- **Persistent Storage**: Automatically saves your palette and current recipe to LocalStorage.
- **Glassmorphic UI**: A sleek, modern interface built with SolidJS and Tailwind CSS.

## 📖 Usage Instructions

1.  **Build your Palette**: Add the physical paints you have on hand or a visual approximation.
2.  **Pick a Target**: Upload a photo of what you want to match, or use the color picker to define your goal.
3.  **Find the Mix**:
    - **Tap "Find Mix"**: Triggers a **Standard Search**. This finds the best possible match using a maximum of **10 total drops**, making it easy for humans to count and mix manually.
    - **Hold "Find Mix" (Long Press)**: Activates **Precision Mode**. This removes the 10-drop cap and uses an "uncapped" evolutionary search. It won't stop at 100%—instead, it will keep running to find the **simplest possible recipe** (lowest part count) for that specific color.
4.  **Stop & Refine**: Tap the button again at any time to halt the search.

## 🚀 Tech Stack

- **Framework**: [SolidJS](https://www.solidjs.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Color Science**: `mixbox`, `tinycolor2`, and custom CIELAB conversion utilities.

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/elMuso/mixmypalette.git
   cd mixmypalette
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🧪 How the Engine Works

The solver uses a **Parallel Hill-Climbing** algorithm:

1.  **Branching**: The engine spawns 4 parallel branches, each starting with the current best-known recipe.
2.  **Exploration**: 95% of the time, the engine "nudges" an existing branch. 5% of the time, it performs a "Quantum Leap," generating a completely random combination to escape local maxima. (ratios differ on precision mode)
3.  **Multi-Objective Optimization**: In Precision Mode, the fitness function prioritizes **Accuracy > Simplicity**. If two recipes yield the same color, the engine adopts the one with fewer total parts.
4.  **Simulated Annealing**: High-quality branches occasionally accept a slightly "worse" match if it significantly reduces the complexity of the recipe, allowing the engine to "slide" toward more elegant solutions.

Check it out at [mixmypalette.pages.dev](https://mixmypalette.pages.dev)
