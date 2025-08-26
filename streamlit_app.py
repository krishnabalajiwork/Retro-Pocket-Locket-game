import streamlit as st
import json
import os
from pathlib import Path
import streamlit.components.v1 as components

# Page configuration
st.set_page_config(
    page_title="Retro Pocket Locket",
    page_icon="🎮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Indian-themed styling
st.markdown("""
<style>
.main-header {
    text-align: center;
    color: #C0152F;
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
    text-align: center;
    color: #208D8D;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    font-style: italic;
}

.game-tile {
    border: 2px solid #FFB366;
    border-radius: 15px;
    padding: 1rem;
    margin: 1rem 0;
    background: linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.game-tile:hover {
    transform: translateY(-5px);
    border-color: #E6844A;
}

.game-icon {
    font-size: 3rem;
    text-align: center;
}

.difficulty-easy { color: #22C55E; }
.difficulty-medium { color: #F59E0B; }
.difficulty-hard { color: #EF4444; }

.config-panel {
    background-color: #F0F9FF;
    border-left: 4px solid #208D8D;
    padding: 1rem;
    margin: 1rem 0;
}
</style>
""", unsafe_allow_html=True)

# Load games manifest
@st.cache_data
def load_games_manifest():
    """Load games manifest from JSON file or return default data"""
    try:
        manifest_path = Path("games/manifest.json")
        if manifest_path.exists():
            with open(manifest_path, 'r') as f:
                return json.load(f)
    except:
        pass

    # Default games data if manifest file doesn't exist
    return {
        "games": [
            {
                "id": "brick-blaster",
                "title": "Brick Blaster",
                "slug": "brick-blaster",
                "displayIcon": "🧱",
                "shortDesc": "Arkanoid-style brick breaker with Indian festival themes",
                "playUrl": "brick-blaster/index.html",
                "category": "arcade",
                "difficulty": "easy",
                "estimatedPlayTime": "5-10 minutes"
            },
            {
                "id": "subway-sprinter", 
                "title": "Subway Sprinter",
                "slug": "subway-sprinter",
                "displayIcon": "🚇",
                "shortDesc": "Endless runner through Indian railway stations",
                "playUrl": "subway-sprinter/index.html",
                "category": "runner",
                "difficulty": "medium",
                "estimatedPlayTime": "3-15 minutes"
            },
            {
                "id": "rooftop-cricket-smash",
                "title": "Rooftop Cricket Smash", 
                "slug": "rooftop-cricket-smash",
                "displayIcon": "🏏",
                "shortDesc": "Cricket batting game on Mumbai rooftops",
                "playUrl": "rooftop-cricket-smash/index.html",
                "category": "sports",
                "difficulty": "medium",
                "estimatedPlayTime": "2-5 minutes"
            },
            {
                "id": "fruit-slice-masala",
                "title": "Fruit Slice Masala",
                "slug": "fruit-slice-masala", 
                "displayIcon": "🥭",
                "shortDesc": "Slice Indian fruits with spice-themed effects",
                "playUrl": "fruit-slice-masala/index.html",
                "category": "casual",
                "difficulty": "easy",
                "estimatedPlayTime": "3-8 minutes"
            },
            {
                "id": "racing-rickshaw",
                "title": "Racing Rickshaw",
                "slug": "racing-rickshaw",
                "displayIcon": "🛺", 
                "shortDesc": "Top-down auto-rickshaw racing adventure",
                "playUrl": "racing-rickshaw/index.html",
                "category": "racing",
                "difficulty": "medium",
                "estimatedPlayTime": "5-12 minutes"
            },
            {
                "id": "ludo-blitz",
                "title": "Ludo Blitz",
                "slug": "ludo-blitz",
                "displayIcon": "🎲",
                "shortDesc": "Fast-paced Ludo with Indian sweet game pieces",
                "playUrl": "ludo-blitz/index.html",
                "category": "board", 
                "difficulty": "easy",
                "estimatedPlayTime": "8-15 minutes"
            },
            {
                "id": "snake-redux",
                "title": "Snake Redux",
                "slug": "snake-redux",
                "displayIcon": "🐍",
                "shortDesc": "Classic snake game with Indian foods and scenery",
                "playUrl": "snake-redux/index.html",
                "category": "classic",
                "difficulty": "medium",
                "estimatedPlayTime": "2-10 minutes"
            },
            {
                "id": "memory-bollywood", 
                "title": "Memory Bollywood",
                "slug": "memory-bollywood",
                "displayIcon": "🎬",
                "shortDesc": "Memory card matching with Bollywood themes",
                "playUrl": "memory-bollywood/index.html",
                "category": "puzzle",
                "difficulty": "easy",
                "estimatedPlayTime": "3-6 minutes"
            },
            {
                "id": "puzzle-rickshaw-rush",
                "title": "Puzzle Rickshaw Rush",
                "slug": "puzzle-rickshaw-rush",
                "displayIcon": "🧩",
                "shortDesc": "Navigate city streets to pick up passengers", 
                "playUrl": "puzzle-rickshaw-rush/index.html",
                "category": "puzzle",
                "difficulty": "medium",
                "estimatedPlayTime": "4-10 minutes"
            },
            {
                "id": "rangoli-tetris",
                "title": "Rangoli Tetris",
                "slug": "rangoli-tetris",
                "displayIcon": "🌸",
                "shortDesc": "Tetris with decorative Rangoli pattern blocks",
                "playUrl": "rangoli-tetris/index.html",
                "category": "puzzle",
                "difficulty": "medium",
                "estimatedPlayTime": "5-20 minutes"
            }
        ]
    }

@st.cache_data
def load_game_config(game_slug):
    """Load game configuration for tuning parameters"""
    try:
        config_path = Path(f"games/{game_slug}/game-config.json")
        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
    except:
        pass

    # Default configs for demo
    default_configs = {
        "brick-blaster": {
            "ballSpeedBase": 360,
            "ballSpeedIncrement": 20,
            "paddleWidth": 80,
            "paddleResponseLerp": 0.15,
            "brickRows": 6,
            "brickCols": 12,
            "powerupDropRate": 0.3
        },
        "subway-sprinter": {
            "forwardSpeed": 350,
            "jumpHeightPx": 120,
            "laneSwitchTimeMs": 200,
            "coinSpawnRate": 0.4,
            "obstacleSpacing": 300
        },
        "rooftop-cricket-smash": {
            "bowlerSpeed": 750,
            "perfectTimingWindowMs": 100,
            "shotVelocityMultiplier": 1.4,
            "gravity": 1400,
            "windEffect": 0.1
        }
    }

    return default_configs.get(game_slug, {})

def embed_local_game(game_slug, height=600):
    """Embed local HTML game file"""
    game_path = Path(f"games/{game_slug}/index.html")

    if game_path.exists():
        with open(game_path, 'r') as f:
            html_content = f.read()
        components.html(html_content, height=height, scrolling=True)
    else:
        st.error(f"Game file not found: {game_path}")
        st.info("🚧 Game under development. Coming soon!")

def embed_github_pages_game(game_slug, username, repo_name, height=600):
    """Embed game from GitHub Pages"""
    url = f"https://{username}.github.io/{repo_name}/games/{game_slug}/"
    components.iframe(url, height=height, scrolling=True)

def main():
    # Header
    st.markdown('<h1 class="main-header">🎮 Retro Pocket Locket</h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">A Nostalgic Collection of Indian-Themed Mini Games</p>', unsafe_allow_html=True)

    # Load games data
    games_data = load_games_manifest()
    games = games_data.get("games", [])

    # Sidebar navigation
    st.sidebar.title("🎯 Navigation")
    page = st.sidebar.radio(
        "Choose a page:",
        ["🏠 Game Hub", "🎮 Play Game", "📊 Debug Panel", "ℹ️ About Project"]
    )

    if page == "🏠 Game Hub":
        # Game Hub - Display all games
        st.markdown("### 🎮 Choose Your Adventure")

        # Filter options
        col1, col2, col3 = st.columns(3)
        with col1:
            categories = ["All"] + list(set(game["category"] for game in games))
            selected_category = st.selectbox("Filter by Category", categories)

        with col2:
            difficulties = ["All"] + list(set(game["difficulty"] for game in games))
            selected_difficulty = st.selectbox("Filter by Difficulty", difficulties)

        with col3:
            sort_by = st.selectbox("Sort by", ["Title", "Category", "Difficulty", "Play Time"])

        # Filter games
        filtered_games = games
        if selected_category != "All":
            filtered_games = [g for g in filtered_games if g["category"] == selected_category]
        if selected_difficulty != "All":
            filtered_games = [g for g in filtered_games if g["difficulty"] == selected_difficulty]

        # Display games in grid
        st.markdown("---")

        for i in range(0, len(filtered_games), 2):
            cols = st.columns(2)

            for j, col in enumerate(cols):
                if i + j < len(filtered_games):
                    game = filtered_games[i + j]

                    with col:
                        st.markdown(f"""
                        <div class="game-tile">
                            <div class="game-icon">{game["displayIcon"]}</div>
                            <h3 style="text-align: center; margin: 0.5rem 0;">{game["title"]}</h3>
                            <p style="text-align: center; margin-bottom: 1rem;">{game["shortDesc"]}</p>

                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <span style="background-color: #E6F3FF; padding: 0.25rem 0.5rem; border-radius: 0.5rem; font-size: 0.8rem;">
                                    {game["category"].title()}
                                </span>
                                <span class="difficulty-{game["difficulty"]}" style="font-weight: bold;">
                                    {"●" * (1 if game["difficulty"] == "easy" else 2 if game["difficulty"] == "medium" else 3)}
                                </span>
                            </div>

                            <p style="text-align: center; font-size: 0.9rem; color: #666;">
                                ⏱️ {game["estimatedPlayTime"]}
                            </p>
                        </div>
                        """, unsafe_allow_html=True)

                        if st.button(f"Play {game['title']}", key=f"play_{game['id']}"):
                            st.session_state.selected_game = game["id"]
                            st.rerun()

    elif page == "🎮 Play Game":
        # Game Playing Interface
        if "selected_game" not in st.session_state:
            st.warning("Please select a game from the Game Hub first!")
            return

        game_id = st.session_state.selected_game
        game = next((g for g in games if g["id"] == game_id), None)

        if not game:
            st.error("Game not found!")
            return

        st.markdown(f"### {game['displayIcon']} {game['title']}")
        st.markdown(f"*{game['shortDesc']}*")

        # Game embedding options
        embed_mode = st.radio(
            "Choose embedding mode:",
            ["Local Development", "GitHub Pages", "Demo Message"],
            help="Local: Embed from local files | GitHub Pages: Embed from deployed version | Demo: Show placeholder"
        )

        if embed_mode == "Local Development":
            st.info("🔧 Loading local game files...")
            embed_local_game(game["slug"])

        elif embed_mode == "GitHub Pages":
            st.info("🌐 Loading from GitHub Pages...")
            username = st.text_input("GitHub Username", "your-username")
            repo_name = st.text_input("Repository Name", "RetroPocketLocket")

            if username != "your-username":
                embed_github_pages_game(game["slug"], username, repo_name)
            else:
                st.warning("Please enter your GitHub username")

        else:  # Demo Message
            st.markdown(f"""
            <div style="text-align: center; padding: 4rem; background: linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%); border-radius: 15px; margin: 2rem 0;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">{game['displayIcon']}</div>
                <h2 style="color: #C0152F; margin-bottom: 1rem;">{game['title']}</h2>
                <p style="font-size: 1.2rem; color: #208D8D; margin-bottom: 2rem;">{game['shortDesc']}</p>
                <div style="background-color: #E8F5E8; padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                    <p style="margin: 0;"><strong>🎯 Estimated Play Time:</strong> {game['estimatedPlayTime']}</p>
                    <p style="margin: 0;"><strong>📂 Category:</strong> {game['category'].title()}</p>
                    <p style="margin: 0;"><strong>⭐ Difficulty:</strong> {game['difficulty'].title()}</p>
                </div>
                <p style="font-size: 1.1rem; color: #666; margin-top: 2rem;">
                    🚧 <strong>Game under development!</strong><br>
                    Full playable version coming soon with authentic Indian cultural themes.
                </p>
            </div>
            """, unsafe_allow_html=True)

    elif page == "📊 Debug Panel":
        # Debug and Tuning Panel
        st.markdown("### 🔧 Game Tuning & Debug Panel")

        if "selected_game" not in st.session_state:
            st.info("Select a game from the Game Hub to view its tuning parameters.")
            return

        game_id = st.session_state.selected_game
        game = next((g for g in games if g["id"] == game_id), None)

        if not game:
            st.error("Game not found!")
            return

        st.markdown(f"#### Tuning Parameters for {game['displayIcon']} {game['title']}")

        # Load game configuration
        config = load_game_config(game["slug"])

        if config:
            st.markdown('<div class="config-panel">', unsafe_allow_html=True)
            st.markdown("**Live Tuning Controls** *(Development Mode Only)*")

            # Create sliders for each config parameter
            modified_config = {}

            for key, value in config.items():
                if isinstance(value, (int, float)):
                    if isinstance(value, int):
                        modified_value = st.slider(
                            f"{key}",
                            min_value=int(value * 0.1),
                            max_value=int(value * 3),
                            value=value,
                            help=f"Original value: {value}"
                        )
                    else:
                        modified_value = st.slider(
                            f"{key}",
                            min_value=float(value * 0.1),
                            max_value=float(value * 3),
                            value=value,
                            step=0.01,
                            help=f"Original value: {value}"
                        )
                    modified_config[key] = modified_value
                else:
                    st.text(f"{key}: {value}")
                    modified_config[key] = value

            st.markdown('</div>', unsafe_allow_html=True)

            # Show JSON config
            st.markdown("#### Current Configuration JSON")
            st.json(modified_config)

            # Instructions
            st.info("""
            **How to use:**
            1. Adjust sliders to modify game parameters in real-time
            2. Copy the JSON configuration below
            3. Update the game's `game-config.json` file
            4. Refresh the game to see changes

            *Note: Live parameter injection requires game code integration with `window.REMOTE_CONFIG`*
            """)
        else:
            st.warning(f"No configuration found for {game['title']}")

    elif page == "ℹ️ About Project":
        # About Project Page
        st.markdown("### 📖 About Retro Pocket Locket")

        st.markdown("""
        **Retro Pocket Locket** is a lovingly crafted collection of 10 HTML5 mini-games that blend 
        nostalgic 2005-2010 gaming mechanics with rich Indian cultural themes.
        """)

        # Project Stats
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("🎮 Total Games", len(games))
        with col2:
            categories = set(game["category"] for game in games)
            st.metric("📂 Categories", len(categories))
        with col3:
            easy_games = len([g for g in games if g["difficulty"] == "easy"])
            st.metric("⭐ Easy Games", easy_games)
        with col4:
            st.metric("📱 Mobile Ready", "100%")

        # Cultural Themes
        st.markdown("#### 🎨 Indian Cultural Themes")
        st.markdown("""
        - **Visual Design**: Bollywood aesthetics, rangoli patterns, festival colors (saffron, teal, magenta)
        - **Audio**: Tabla beats, dhol rhythms, flute melodies, harmonium chords
        - **Gameplay Elements**: Indian foods (mango, samosa, laddu), Mumbai rooftops, railway stations
        - **Art Style**: Paisley motifs, peacock feathers, mandala backgrounds, temple architecture
        """)

        # Technical Architecture  
        st.markdown("#### ⚙️ Technical Architecture")
        st.markdown("""
        - **Game Engine**: Phaser 3.90+ with TypeScript support
        - **Launcher**: Streamlit with HTML component embedding
        - **Assets**: Optimized PNG spritesheets + JSON atlases, OGG/MP3 audio
        - **Build System**: NPM scripts with Webpack/Vite bundling
        - **Deployment**: GitHub Actions → GitHub Pages
        - **Performance**: 60 FPS target, <150MB total size
        """)

        # Development Roadmap
        st.markdown("#### 🛣️ Development Roadmap")

        progress_data = [
            ("Project Setup & Architecture", 100),
            ("Asset Standards & Guidelines", 90), 
            ("Streamlit Launcher", 95),
            ("GitHub Pages Deployment", 85),
            ("Game 1: Brick Blaster", 60),
            ("Game 2: Subway Sprinter", 45),
            ("Game 3: Rooftop Cricket", 30),
            ("Games 4-6: Casual Collection", 20),
            ("Games 7-10: Puzzle Suite", 10),
            ("Performance Optimization", 5),
            ("Mobile Testing & Polish", 0)
        ]

        for task, progress in progress_data:
            st.progress(progress / 100, text=f"{task} ({progress}%)")

        # Contributing
        st.markdown("#### 🤝 Contributing")
        st.markdown("""
        We welcome contributions! Here's how you can help:

        1. **Game Development**: Implement games using Phaser 3 framework
        2. **Asset Creation**: Design sprites, animations, and audio with Indian themes  
        3. **Cultural Consulting**: Ensure authentic representation of Indian elements
        4. **Testing**: Performance testing across devices and browsers
        5. **Documentation**: Improve guides and tutorials

        Check out our [GitHub repository](https://github.com/your-username/RetroPocketLocket) to get started!
        """)

if __name__ == "__main__":
    main()
