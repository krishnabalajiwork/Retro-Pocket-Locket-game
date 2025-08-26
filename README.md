# Retro Pocket Locket 🎮

A polished nostalgia collection of 10 HTML5 mini-games inspired by popular 2005-2010 hits, each with authentic Indian cultural twists including visual motifs, sounds, and gameplay flavors.

## 🎯 Project Overview

**Retro Pocket Locket** combines the beloved mechanics of classic mobile/web games with rich Indian cultural themes. Each game features:
- **Visual Motifs**: Bollywood aesthetics, rangoli patterns, festival colors
- **Audio**: Tabla beats, dhol rhythms, Indian classical instruments  
- **Cultural Elements**: Indian foods, architecture, mythology, regional themes
- **Modern Polish**: 60 FPS performance, mobile-responsive design

## 🎮 Games Collection

| Game | Category | Difficulty | Playtime | Description |
|------|----------|------------|----------|-------------|
| 🧱 **Brick Blaster** | Arcade | Easy | 5-10 min | Arkanoid with Bollywood-themed bricks |
| 🚇 **Subway Sprinter** | Runner | Medium | 3-15 min | Endless runner through Indian railway stations |
| 🏏 **Rooftop Cricket Smash** | Sports | Medium | 2-5 min | Cricket batting on Mumbai rooftops |
| 🥭 **Fruit Slice Masala** | Casual | Easy | 3-8 min | Slice Indian fruits with spice effects |
| 🛺 **Racing Rickshaw** | Racing | Medium | 5-12 min | Top-down auto-rickshaw racing |
| 🎲 **Ludo Blitz** | Board | Easy | 8-15 min | Fast Ludo with Indian sweet pieces |
| 🐍 **Snake Redux** | Classic | Medium | 2-10 min | Snake with Indian foods and scenery |
| 🎬 **Memory Bollywood** | Puzzle | Easy | 3-6 min | Memory matching with Bollywood themes |
| 🧩 **Puzzle Rickshaw Rush** | Puzzle | Medium | 4-10 min | Navigate city streets for passengers |
| 🌸 **Rangoli Tetris** | Puzzle | Medium | 5-20 min | Tetris with decorative Rangoli blocks |

## 🛠 Tech Stack

- **Games Engine**: Phaser 3.90+ (TypeScript preferred, JavaScript acceptable)
- **Launcher**: Streamlit with HTML component embedding
- **Assets**: PNG spritesheets + JSON atlases, OGG/MP3 audio
- **Build System**: NPM scripts with Webpack/Vite bundling
- **Deployment**: GitHub Actions → GitHub Pages
- **Target Size**: < 150MB total repository

## 📁 Repository Structure

```
/RetroPocketLocket
├── games/
│   ├── brick-blaster/          # Phaser project files
│   │   ├── index.html         # Game entry point
│   │   ├── main.js            # Game logic
│   │   ├── assets/            # Sprites, audio, animations
│   │   └── game-config.json   # Tuning parameters
│   ├── subway-sprinter/
│   ├── rooftop-cricket-smash/
│   ├── fruit-slice-masala/
│   ├── racing-rickshaw/
│   ├── ludo-blitz/
│   ├── snake-redux/
│   ├── memory-bollywood/
│   ├── puzzle-rickshaw-rush/
│   ├── rangoli-tetris/
│   └── manifest.json          # Games metadata
├── streamlit_app.py           # Launcher application
├── package.json              # Build scripts
├── README.md
└── .github/workflows/
    └── build-and-deploy.yml   # CI/CD pipeline
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for Streamlit launcher)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/RetroPocketLocket.git
cd RetroPocketLocket
```

2. **Install dependencies**
```bash
npm install
pip install streamlit
```

3. **Build all games**
```bash
npm run build:all
```

4. **Run Streamlit launcher**
```bash
streamlit run streamlit_app.py
```

The launcher will be available at `http://localhost:8501`

### Development Workflow

1. **Develop individual games**
```bash
cd games/brick-blaster
npm run dev  # Start development server
```

2. **Build specific game**
```bash
npm run build:brick-blaster
```

3. **Test in Streamlit**
```bash
streamlit run streamlit_app.py
```

## 🎨 Asset Standards

### Spritesheets
- **Format**: PNG @1x/@2x + JSON Atlas (TexturePacker format)
- **Naming**: `<game-slug>-spritesheet.png`, `<game-slug>-atlas.json`
- **Optimization**: Compressed PNGs, power-of-2 dimensions

### Audio
- **Formats**: OGG (primary) + MP3 (fallback)
- **SFX**: < 120KB compressed, 44.1kHz, mono/stereo as needed
- **Music**: 15-45s loops, 44.1kHz stereo
- **Naming**: `sfx_<description>.ogg`, `music_loop.ogg`

### UI Icons
- **Formats**: SVG (scalable) + 512px PNG (preview)
- **Style**: Indian cultural motifs, festival colors

## ⚙️ Game Configuration

Each game includes a `game-config.json` file with tuning parameters:

```json
{
  "ballSpeedBase": 360,
  "ballSpeedIncrement": 20,
  "paddleWidth": 80,
  "paddleResponseLerp": 0.15,
  "brickRows": 6,
  "brickCols": 12,
  "powerupDropRate": 0.3
}
```

The Streamlit launcher provides debug sliders to adjust these parameters in real-time during development.

## 📱 Performance Targets

- **Desktop**: 60 FPS on modern browsers
- **Mobile**: 60 FPS on recent devices, graceful 30 FPS fallback
- **Loading**: < 3 seconds per game initial load
- **Memory**: < 100MB RAM per game instance

## 🌍 Deployment

### GitHub Pages (Automatic)

Push to `main` branch triggers automatic deployment:

1. **GitHub Actions** builds all games
2. **Static files** deployed to `gh-pages` branch  
3. **Games accessible** at `https://username.github.io/RetroPocketLocket/games/`

### Manual Deployment

```bash
npm run build:all
npm run deploy
```

## 🎯 Indian Cultural Themes

### Visual Design
- **Color Palette**: Saffron, teal, magenta (festival colors)
- **Patterns**: Paisley, peacock feathers, mandala backgrounds
- **Architecture**: Indian temples, railway stations, rooftops

### Audio Design  
- **Instruments**: Tabla, dhol, flute, harmonium
- **Styles**: Chiptune with Indian classical fusion
- **Cultural Sounds**: Temple bells, auto-rickshaw horns, crowd cheers

### Gameplay Elements
- **Foods**: Mango, guava, samosa, laddu, jalebi
- **Settings**: Mumbai rooftops, railway platforms, village markets
- **Characters**: Indian attire, traditional jewelry, cultural accessories

## 🧪 Testing

### Automated Tests
```bash
npm run test:all           # Run all game tests
npm run test:brick-blaster # Test specific game
```

### Performance Testing
```bash
npm run lighthouse:all     # Performance audits
npm run test:mobile       # Mobile device testing
```

### Playwright E2E Tests
```bash
npm run test:e2e          # End-to-end game testing
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/new-game`)
3. **Follow** asset standards and performance guidelines
4. **Test** on multiple devices and browsers
5. **Submit** pull request with game demo video

### Adding New Games

1. Create game directory in `/games/`
2. Implement using Phaser 3 framework
3. Add entry to `games/manifest.json`
4. Include `game-config.json` for tuning
5. Provide assets following standards
6. Add npm build script in root `package.json`

## 📄 License

MIT License - feel free to use for educational and commercial projects.

## 🙏 Acknowledgments

- **Phaser 3** - Excellent HTML5 game framework
- **Indian Cultural Heritage** - Rich source of inspiration
- **Streamlit** - Simplified launcher development
- **GitHub Pages** - Free hosting platform

---

**Created with ❤️ for preserving Indian culture through interactive gaming**
