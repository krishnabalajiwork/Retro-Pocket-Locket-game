# Retro Pocket Locket - Deliverables Documentation

## 📦 Generated Assets & Files

This document outlines all generated assets, file locations, and instructions for customization and deployment.

## 🎯 Core Deliverables

### 1. Project Structure
```
/RetroPocketLocket/
├── games/                      # Individual game directories
├── streamlit_app.py           # Launcher application  
├── package.json               # Build scripts & dependencies
├── README.md                  # Project documentation
├── .github/workflows/         # CI/CD configuration
└── DELIVERABLES.md           # This file
```

### 2. Game Templates (10 games)
Each game directory contains:
- `index.html` - Game entry point
- `main.js` - Phaser 3 game logic (TypeScript preferred)
- `assets/` - Sprites, audio, animations
- `game-config.json` - Tuning parameters
- `package.json` - Game-specific build configuration

### 3. Streamlit Launcher (`streamlit_app.py`)
**Features:**
- Game hub with filterable grid layout
- Local and GitHub Pages embedding modes
- Debug panel with live parameter tuning
- About page with project information
- Mobile-responsive Indian-themed design

**Usage:**
```bash
streamlit run streamlit_app.py
```

### 4. Build System (`package.json`)
**Available Scripts:**
- `npm run build:all` - Build all games
- `npm run dev:all` - Start all development servers
- `npm run test:all` - Run all tests
- `npm run deploy` - Deploy to GitHub Pages

### 5. CI/CD Pipeline (`.github/workflows/build-and-deploy.yml`)
**Automated Workflow:**
1. Install Node.js and dependencies
2. Build all games in parallel
3. Deploy static files to `gh-pages` branch
4. Games accessible at `https://username.github.io/RetroPocketLocket/`

## 🎮 Game Specifications

### Asset Requirements (Per Game)

#### Visual Assets
| Asset Type | Format | Naming Convention | Requirements |
|------------|--------|-------------------|--------------|
| Spritesheets | PNG + JSON | `<slug>-spritesheet.png`<br>`<slug>-atlas.json` | @1x/@2x, power-of-2 dimensions |
| UI Icons | SVG + PNG | `<slug>-icon.svg`<br>`<slug>-icon-512.png` | Scalable + 512px preview |
| Backgrounds | PNG/JPG | `<slug>-bg-<variant>.png` | Optimized, <500KB each |

#### Audio Assets  
| Asset Type | Format | Naming Convention | Requirements |
|------------|--------|-------------------|--------------|
| Sound Effects | OGG + MP3 | `sfx_<description>.ogg` | <120KB, 44.1kHz |
| Music Loops | OGG + MP3 | `music_loop.ogg` | 15-45s, stereo, loopable |
| Voice Lines | OGG + MP3 | `voice_<language>_<clip>.ogg` | Optional Hindi localization |

#### Animation Data
| Asset Type | Format | Requirements |
|------------|--------|--------------|
| Sprite Animations | JSON | Frame sequences + timing |
| Particle Effects | JSON/PNG | Texture atlases + emitter configs |
| Spine/DragonBones | JSON + Atlas | Runtime export format |

### Tuning Parameters (game-config.json)

#### Sample Configuration Structure:
```json
{
  "gameplay": {
    "ballSpeedBase": 360,
    "ballSpeedIncrement": 20,
    "paddleWidth": 80
  },
  "physics": {
    "gravity": 1400,
    "restitution": 0.95,
    "friction": 0.1
  },
  "audio": {
    "masterVolume": 0.8,
    "sfxVolume": 0.7,
    "musicVolume": 0.5
  },
  "visuals": {
    "particleDensity": "medium",
    "enableShaders": true,
    "targetFPS": 60
  }
}
```

#### Editable Parameters by Game:

**Brick Blaster:**
- `ballSpeedBase` (px/s) - Initial ball velocity
- `paddleResponseLerp` (0-1) - Paddle movement smoothing
- `powerupDropRate` (0-1) - Frequency of power-up spawns

**Subway Sprinter:**
- `forwardSpeed` (px/s) - Runner movement speed
- `jumpHeightPx` - Jump arc height
- `laneSwitchTimeMs` - Lane change animation duration

**Rooftop Cricket:**
- `perfectTimingWindowMs` - Timing window for perfect hits
- `shotVelocityMultiplier` - Ball speed multiplier on perfect hit
- `windEffect` (0-1) - Environmental wind influence

## 🛠 Customization Guide

### Adding New Games

1. **Create game directory:**
```bash
mkdir games/new-game-name
cd games/new-game-name
```

2. **Initialize Phaser 3 project:**
```bash
npm init -y
npm install phaser@3.90.0
npm install --save-dev typescript webpack webpack-cli
```

3. **Add to root package.json scripts:**
```json
{
  "build:new-game-name": "cd games/new-game-name && npm run build",
  "dev:new-game-name": "cd games/new-game-name && npm run dev"
}
```

4. **Update games/manifest.json:**
```json
{
  "games": [
    {
      "id": "new-game-name",
      "title": "New Game Title",
      "slug": "new-game-name", 
      "displayIcon": "🎮",
      "shortDesc": "Brief description",
      "category": "arcade|puzzle|sports|casual|etc",
      "difficulty": "easy|medium|hard",
      "estimatedPlayTime": "X-Y minutes"
    }
  ]
}
```

### Replacing Placeholder Assets

#### High-Quality Art Assets:
1. **Source Files Location:** `/assets/source/`
   - `game-name.psd` - Photoshop source files
   - `game-name.ai` - Illustrator vector sources  
   - `game-name.ase` - Aseprite pixel art sources

2. **Export Process:**
   - Export @1x and @2x PNG spritesheets
   - Generate JSON atlases using TexturePacker
   - Optimize PNGs with tools like TinyPNG
   - Place in `/games/<game-name>/assets/images/`

#### Professional Audio:
1. **Source Files Location:** `/assets/source/audio/`
   - `game-name-music.wav` - Uncompressed music stems
   - `game-name-sfx.wav` - Sound effect sources
   - `game-name-voice.wav` - Voice recordings

2. **Export Process:**
   - Convert to OGG Vorbis (primary) + MP3 (fallback)
   - Target 44.1kHz, appropriate bitrate
   - Ensure loopable music with seamless transitions
   - Place in `/games/<game-name>/assets/audio/`

### Performance Optimization

#### Asset Optimization:
- **Images:** Use WebP for modern browsers, PNG fallback
- **Audio:** OGG Vorbis with quality 5-7 for music, 3-5 for SFX
- **Sprites:** Pack efficiently, minimize whitespace
- **Code:** Minify JavaScript, remove unused code

#### Runtime Optimization:
- **Object Pooling:** Reuse game objects to prevent GC spikes
- **Texture Management:** Unload unused textures from memory
- **Animation:** Use efficient tweening libraries
- **Physics:** Optimize collision detection areas

## 🚀 Deployment Instructions

### Local Development
```bash
# Install all dependencies
npm install
npm run install:all

# Start individual game development
npm run dev:brick-blaster

# Start Streamlit launcher
streamlit run streamlit_app.py
```

### GitHub Pages Deployment

#### Automatic (Recommended):
1. Push code to `main` branch
2. GitHub Actions builds and deploys automatically
3. Games available at `https://username.github.io/RetroPocketLocket/`

#### Manual:
```bash
# Build all games
npm run build:all

# Deploy using gh-pages
npm install -g gh-pages
gh-pages -d games
```

### Custom Domain Setup:
1. Add `CNAME` file to `/games/` directory
2. Configure DNS CNAME record pointing to `username.github.io`
3. Enable HTTPS in repository settings

## 📊 Quality Assurance

### Testing Checklist
- [ ] All games load without errors
- [ ] Mobile responsiveness on iOS/Android
- [ ] Audio plays correctly across browsers
- [ ] Performance meets 60 FPS target on modern devices
- [ ] Graceful degradation to 30 FPS on older devices
- [ ] All cultural elements are authentic and respectful
- [ ] Accessibility standards met (WCAG 2.1 AA)

### Performance Budgets
- **Initial Load:** < 3 seconds per game
- **Memory Usage:** < 100MB RAM per game instance  
- **Asset Size:** < 15MB per game total
- **Repository Size:** < 150MB total

### Browser Compatibility
- **Primary:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile:** iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks:** Canvas rendering for WebGL-incompatible devices

## 🎨 Cultural Authenticity Guidelines

### Visual Design Standards:
- Use traditional Indian color palettes appropriately
- Research cultural significance before using religious symbols
- Ensure respectful representation of regional differences
- Consult with cultural advisors for accuracy

### Audio Design Standards:
- Use authentic Indian instruments and scales
- Avoid stereotypical or exaggerated representations
- Consider regional musical variations
- Provide context for cultural elements used

## 📞 Support & Maintenance

### Issue Reporting:
- Use GitHub Issues for bugs and feature requests
- Provide browser version, device info, and reproduction steps
- Include screenshots/videos for visual issues

### Regular Maintenance:
- Update Phaser 3 to latest stable version quarterly
- Review and optimize asset sizes annually
- Test performance on new devices and browsers
- Update cultural elements based on community feedback

---

**Last Updated:** August 2025  
**Version:** 1.0.0  
**Maintainer:** Development Team
