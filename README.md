# 🌌 ZenGarden: The Digital Mindfulness Sandbox

ZenGarden is a premium, visually stunning React single-page application designed for relaxation, sensory play, and mindfulness. It brings together dynamic, organic graphics, custom browser-based synthesizers, and interactive tactile sand garden sandboxes under a sleek, glassmorphic layout.

---

## ✨ Features

### 🖌️ 1. Zen Sandbox
A high-performance HTML5 Canvas simulation of a traditional Japanese rock garden.
- **Raking Tools**: Single, 3-Prong, and 5-Prong rakes that draw 3D sand grooves (combining dark valleys and light peaks for realistic depth).
- **Ripple Emitter**: Click or tap anywhere to generate calm, expanding concentric water ripples.
- **Clean Sweep**: A customized CSS-skewed wipe overlay that clears the canvas with an animated sweeping motion.

### 🎛️ 2. Sound Sanctuary
An offline, browser-native ambient sound mixer powered entirely by the **Web Audio API** (no external audio assets required).
- **Soft Rain**: Synthesizer utilizing bandpass-filtered pink-noise frequencies.
- **Ocean Waves**: Deep rushing noise volume-modulated by a slow Low-Frequency Oscillator (LFO).
- **Deep Wind**: Gusts of wind modulated through a resonant bandpass filter.
- **Wind Chimes**: Procedural scheduler triggering random frequencies from a pentatonic scale, complete with an echo-delay line and spatial panning.
- **Binaural Beats**: Dual detuned oscillators (140Hz and 146Hz) producing a deep 6Hz theta wave focus hum.

### 🌬️ 3. Breath Sync
A guided breathing meditation circle with organic visual and audio cues.
- **Presets**: Supports Box Breathing (4s-4s-4s-4s), Calming (4s-7s-8s), and Energizing (6s-2s-4s).
- **Morphing Visuals**: An organic morphing SVG blob that scales dynamically based on the current breathing state (Inhale, Hold, Exhale).
- **Audio Transitions**: Soft, warm oscillator chime tones triggered at the start of each phase.

### 🏺 4. The Gratitude Jar
A digital space for reflecting on positive moments.
- **Form submission**: Write down what you're grateful for and "release" it.
- **Physics particles**: Watched notes rise into a container as glowing firefly particles, floating using sine-wave drifts and bouncing off jar boundaries.
- **Interactive Tooltips**: Hovering over any firefly displays a glassmorphic note overlay.
- **Persistence**: Saved entries and total Zen XP level persist across browser sessions using `localStorage`.

---

## 🎨 Themes
ZenGarden supports three highly curated visual modes that transition all color palettes, gradient backdrops, and active highlight states with hardware-accelerated animations:
- 🌅 **Dawn**: Warm pastel oranges, pinks, and gold tones.
- 🌆 **Sunset**: Deep violet, magenta, and copper hues.
- 🌌 **Midnight**: Obsidian black, cosmic navy, and neon cyan highlight glow.

---

## 🛠️ Tech Stack
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS3 + Custom Glassmorphic Backdrop Filters & CSS Variables
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API
- **Graphics**: HTML5 Canvas (2D Context) + SVG morphing shapes

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/zengarden.git
   ```
2. Navigate into the project folder:
   ```bash
   cd zengarden
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the hot-reloading development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to experience the ZenGarden.

### Production Build
To build and optimize the application for deployment:
```bash
npm run build
```

---

## 📂 Project Structure
```
voila/
├── src/
│   ├── components/
│   │   ├── BreathSync.jsx       # Breathing guide & morphing SVG
│   │   ├── GratitudeJar.jsx     # Floating fireflies canvas jar
│   │   ├── SoundSanctuary.jsx   # Sound mixer control board
│   │   └── ZenSandbox.jsx       # HTML5 Canvas sand drawing
│   ├── App.jsx                  # Global layout, state & theme manager
│   ├── audio.js                 # Web Audio API sound synthesis library
│   ├── index.css                # Glassmorphic classes & theme variables
│   └── main.jsx                 # React root mounting
```
