// Retro Pocket Locket - Enhanced Indian Games Collection
class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.lastTime = 0;
        this.score = 0;
        this.gameState = 'waiting'; // waiting, playing, paused, over
        this.startTime = 0;
        this.gameTime = 0;
        this.lives = 3;
        this.level = 1;
    }

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.bindEvents();
        this.reset();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameTime = 0;
        this.startTime = 0;
        this.gameState = 'waiting';
        this.updateUI();
    }

    bindEvents() {
        // Override in subclasses
    }

    start() {
        this.isRunning = true;
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.gameLoop();
        
        document.getElementById('gameInstructions').classList.add('hidden');
        document.getElementById('gameControls').classList.remove('hidden');
        document.getElementById('gamePauseBtn').classList.remove('hidden');
    }

    pause() {
        this.gameState = 'paused';
        document.getElementById('pauseOverlay').classList.remove('hidden');
    }

    resume() {
        this.gameState = 'playing';
        document.getElementById('pauseOverlay').classList.add('hidden');
    }

    gameOver(won = false) {
        this.isRunning = false;
        this.gameState = 'over';
        
        const finalTime = this.formatTime(this.gameTime);
        const message = won ? "Congratulations! You won!" : "Better luck next time!";
        
        document.getElementById('gameOverTitle').textContent = won ? 'Victory!' : 'Game Over!';
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
        document.getElementById('finalTime').textContent = `Time Played: ${finalTime}`;
        document.getElementById('gameOverMessage').textContent = message;
        
        // Check for high score
        const isHighScore = gameManager.saveScore(gameManager.currentGame, this.score);
        if (isHighScore) {
            document.getElementById('achievementBadge').classList.remove('hidden');
        } else {
            document.getElementById('achievementBadge').classList.add('hidden');
        }
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('gameControls').classList.add('hidden');
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.gameState === 'playing') {
            this.gameTime = Date.now() - this.startTime;
            this.update(deltaTime);
            this.render();
            this.updateUI();
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Override in subclasses
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Override in subclasses
    }

    updateScore(points) {
        this.score += points;
        this.updateUI();
    }

    updateLives(change) {
        this.lives += change;
        if (this.lives <= 0) {
            this.gameOver(false);
        }
        this.updateUI();
    }

    updateLevel(newLevel) {
        this.level = newLevel;
        this.updateUI();
    }

    updateUI() {
        document.getElementById('gameScore').textContent = `Score: ${this.score}`;
        document.getElementById('gameTimer').textContent = `Time: ${this.formatTime(this.gameTime)}`;
        
        const livesElement = document.getElementById('gameLives');
        const levelElement = document.getElementById('gameLevel');
        
        if (this.showLives) {
            livesElement.textContent = `Lives: ${this.lives}`;
            livesElement.classList.remove('hidden');
        } else {
            livesElement.classList.add('hidden');
        }
        
        if (this.showLevel) {
            levelElement.textContent = `Level: ${this.level}`;
            levelElement.classList.remove('hidden');
        } else {
            levelElement.classList.add('hidden');
        }
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    drawText(text, x, y, font = '20px Arial', color = '#333', align = 'center') {
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }

    isPointInRect(px, py, x, y, width, height) {
        return px >= x && px <= x + width && py >= y && py <= y + height;
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
}

// Brick Blaster Game
class BrickBlasterGame extends GameEngine {
    constructor() {
        super();
        this.paddle = { x: 350, y: 550, width: 100, height: 20, speed: 8 };
        this.ball = { x: 400, y: 300, dx: 4, dy: -4, radius: 10 };
        this.bricks = [];
        this.powerUps = [];
        this.particles = [];
        this.keys = {};
        this.showLives = true;
        this.showLevel = true;
        this.ballSpeed = 4;
    }

    init(canvas) {
        super.init(canvas);
        this.createBricks();
    }

    reset() {
        super.reset();
        this.paddle = { x: 350, y: 550, width: 100, height: 20, speed: 8 };
        this.ball = { x: 400, y: 300, dx: 4, dy: -4, radius: 10 };
        this.bricks = [];
        this.powerUps = [];
        this.particles = [];
        this.ballSpeed = 4;
        this.createBricks();
    }

    createBricks() {
        this.bricks = [];
        const colors = ['#FF9500', '#00CED1', '#FF1493', '#FFD700', '#32CD32'];
        const rows = 5 + Math.floor(this.level / 2);
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 25;
        const padding = 5;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: col * (brickWidth + padding) + 30,
                    y: row * (brickHeight + padding) + 50,
                    width: brickWidth,
                    height: brickHeight,
                    color: colors[row % colors.length],
                    health: Math.floor(row / 3) + 1,
                    maxHealth: Math.floor(row / 3) + 1
                });
            }
        }
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch/mouse controls
        let isPressed = false;
        
        const handleStart = (e) => {
            isPressed = true;
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (clientX) {
                const canvasX = (clientX - rect.left) * (this.canvas.width / rect.width);
                this.paddle.x = canvasX - this.paddle.width / 2;
            }
        };
        
        const handleMove = (e) => {
            if (!isPressed) return;
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (clientX) {
                const canvasX = (clientX - rect.left) * (this.canvas.width / rect.width);
                this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, canvasX - this.paddle.width / 2));
            }
            e.preventDefault();
        };
        
        const handleEnd = () => {
            isPressed = false;
        };

        this.canvas.addEventListener('mousedown', handleStart);
        this.canvas.addEventListener('mousemove', handleMove);
        this.canvas.addEventListener('mouseup', handleEnd);
        this.canvas.addEventListener('touchstart', handleStart);
        this.canvas.addEventListener('touchmove', handleMove);
        this.canvas.addEventListener('touchend', handleEnd);
    }

    update(deltaTime) {
        // Paddle movement
        if (this.keys['ArrowLeft'] && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['ArrowRight'] && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += this.paddle.speed;
        }

        // Ball movement
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with walls
        if (this.ball.x <= this.ball.radius || this.ball.x >= this.canvas.width - this.ball.radius) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y <= this.ball.radius) {
            this.ball.dy = -this.ball.dy;
        }

        // Ball collision with paddle
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width &&
            this.ball.dy > 0) {
            this.ball.dy = -Math.abs(this.ball.dy);
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.dx = (hitPos - 0.5) * 8;
        }

        // Ball collision with bricks
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            if (this.ball.x + this.ball.radius >= brick.x && 
                this.ball.x - this.ball.radius <= brick.x + brick.width &&
                this.ball.y + this.ball.radius >= brick.y && 
                this.ball.y - this.ball.radius <= brick.y + brick.height) {
                
                this.ball.dy = -this.ball.dy;
                brick.health--;
                this.updateScore(10 * this.level);
                this.createParticles(brick.x + brick.width/2, brick.y + brick.height/2, brick.color);
                
                if (brick.health <= 0) {
                    this.bricks.splice(i, 1);
                    if (Math.random() < 0.15) {
                        this.createPowerUp(brick.x + brick.width/2, brick.y + brick.height/2);
                    }
                }
                break;
            }
        }

        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += powerUp.dy;
            
            // Check paddle collision
            if (powerUp.y + powerUp.size >= this.paddle.y &&
                powerUp.x >= this.paddle.x &&
                powerUp.x <= this.paddle.x + this.paddle.width) {
                this.activatePowerUp(powerUp.type);
                return false;
            }
            
            return powerUp.y < this.canvas.height;
        });

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life--;
            return particle.life > 0;
        });

        // Check for ball falling
        if (this.ball.y > this.canvas.height) {
            this.updateLives(-1);
            if (this.lives > 0) {
                this.ball.x = 400;
                this.ball.y = 300;
                this.ball.dx = 4;
                this.ball.dy = -4;
            }
        }

        // Check for level complete
        if (this.bricks.length === 0) {
            this.updateLevel(this.level + 1);
            this.createBricks();
            this.ball.x = 400;
            this.ball.y = 300;
            this.ballSpeed += 0.5;
            this.ball.dx = this.ballSpeed * (this.ball.dx > 0 ? 1 : -1);
            this.ball.dy = -this.ballSpeed;
            this.updateScore(100 * this.level);
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x, y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                color,
                life: 30
            });
        }
    }

    createPowerUp(x, y) {
        this.powerUps.push({
            x, y,
            dy: 2,
            type: Math.random() < 0.5 ? 'expand' : 'multiball',
            size: 20
        });
    }

    activatePowerUp(type) {
        switch(type) {
            case 'expand':
                this.paddle.width = Math.min(150, this.paddle.width + 25);
                break;
            case 'multiball':
                // Simple bonus points instead of complex multiball
                this.updateScore(50);
                break;
        }
    }

    render() {
        super.render();
        
        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Bricks
        this.bricks.forEach(brick => {
            this.ctx.fillStyle = brick.color;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            this.ctx.strokeStyle = '#333';
            this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            
            if (brick.health < brick.maxHealth) {
                this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                this.ctx.fillRect(brick.x, brick.y, brick.width * (brick.health / brick.maxHealth), 5);
            }
        });

        // Paddle
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.strokeRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FF4757';
        this.ctx.stroke();

        // Power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = powerUp.type === 'expand' ? '#FFD700' : '#FF69B4';
            this.ctx.fillRect(powerUp.x - powerUp.size/2, powerUp.y - powerUp.size/2, powerUp.size, powerUp.size);
        });

        // Particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        });
        this.ctx.globalAlpha = 1;
    }
}

// Snake Redux Game  
class SnakeReduxGame extends GameEngine {
    constructor() {
        super();
        this.snake = [{x: 10, y: 10}];
        this.food = {x: 15, y: 15, type: 'samosa'};
        this.direction = {x: 0, y: 0};
        this.gridSize = 20;
        this.tileCount = 30;
        this.foods = ['🥭', '🥥', '🍈', '🥝', '🌶️', '🧄', '🧅'];
        this.moveTimer = 0;
        this.moveInterval = 150;
        this.showLives = false;
        this.showLevel = true;
    }

    reset() {
        super.reset();
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 0, y: 0};
        this.moveTimer = 0;
        this.spawnFood();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) this.direction = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) this.direction = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) this.direction = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) this.direction = {x: 1, y: 0};
                    break;
                case 'Escape':
                    this.pause();
                    break;
            }
        });

        // Touch controls
        let touchStartX = 0, touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 20 && this.direction.x === 0) {
                    this.direction = {x: 1, y: 0};
                } else if (deltaX < -20 && this.direction.x === 0) {
                    this.direction = {x: -1, y: 0};
                }
            } else {
                if (deltaY > 20 && this.direction.y === 0) {
                    this.direction = {x: 0, y: 1};
                } else if (deltaY < -20 && this.direction.y === 0) {
                    this.direction = {x: 0, y: -1};
                }
            }
        });
    }

    update(deltaTime) {
        this.moveTimer += deltaTime;
        
        if (this.moveTimer >= this.moveInterval) {
            this.moveSnake();
            this.moveTimer = 0;
        }
    }

    moveSnake() {
        if (this.direction.x === 0 && this.direction.y === 0) return;
        
        const head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver(false);
            return;
        }

        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver(false);
                return;
            }
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.updateScore(10 * this.level);
            this.spawnFood();
            
            // Level up every 5 foods
            if (this.snake.length % 5 === 0) {
                this.updateLevel(this.level + 1);
                this.moveInterval = Math.max(80, this.moveInterval - 10);
            }
        } else {
            this.snake.pop();
        }
    }

    spawnFood() {
        do {
            this.food.x = Math.floor(Math.random() * this.tileCount);
            this.food.y = Math.floor(Math.random() * this.tileCount);
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
        
        this.food.type = this.foods[Math.floor(Math.random() * this.foods.length)];
    }

    render() {
        super.render();
        
        // Background
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#DAA520';
            } else {
                this.ctx.fillStyle = '#8B4513';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize + 1, 
                segment.y * this.gridSize + 1, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        });

        // Food
        this.ctx.font = `${this.gridSize - 4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.food.type,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2 + 6
        );

        // Length display
        this.drawText(`Length: ${this.snake.length}`, 20, 30, '18px Arial', '#FFF', 'left');
    }
}

// Memory Bollywood Game
class MemoryBollywoodGame extends GameEngine {
    constructor() {
        super();
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.canFlip = true;
        this.gridSize = 4;
        this.cardWidth = 90;
        this.cardHeight = 110;
        this.actors = ['SRK', 'AB', 'Raj', 'Dev', 'Aar', 'Sal', 'Aki', 'Ran'];
        this.moves = 0;
        this.showLives = false;
        this.showLevel = false;
    }

    init(canvas) {
        super.init(canvas);
        this.createCards();
    }

    reset() {
        super.reset();
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.canFlip = true;
        this.moves = 0;
        this.createCards();
    }

    createCards() {
        this.cards = [];
        const actors = [...this.actors];
        const pairs = actors.concat(actors);
        
        // Shuffle
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        let index = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.cards.push({
                    x: col * (this.cardWidth + 10) + 100,
                    y: row * (this.cardHeight + 10) + 80,
                    width: this.cardWidth,
                    height: this.cardHeight,
                    actor: pairs[index],
                    flipped: false,
                    matched: false,
                    id: index
                });
                index++;
            }
        }
    }

    bindEvents() {
        const handleClick = (e) => {
            if (!this.canFlip || this.gameState !== 'playing') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (!clientX || !clientY) return;
            
            const x = (clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (clientY - rect.top) * (this.canvas.height / rect.height);
            
            const clickedCard = this.cards.find(card => 
                x >= card.x && x <= card.x + card.width &&
                y >= card.y && y <= card.y + card.height &&
                !card.flipped && !card.matched
            );
            
            if (clickedCard) {
                this.flipCard(clickedCard);
            }
        };

        this.canvas.addEventListener('click', handleClick);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleClick(e);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }
        });
    }

    flipCard(card) {
        card.flipped = true;
        this.flippedCards.push(card);
        this.moves++;
        
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.actor === card2.actor) {
            card1.matched = true;
            card2.matched = true;
            this.matchedCards.push(card1, card2);
            this.updateScore(20);
        } else {
            card1.flipped = false;
            card2.flipped = false;
        }
        
        this.flippedCards = [];
        this.canFlip = true;
        
        if (this.matchedCards.length === this.cards.length) {
            const bonus = Math.max(0, 100 - this.moves);
            this.updateScore(bonus);
            setTimeout(() => this.gameOver(true), 500);
        }
    }

    render() {
        super.render();
        
        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Cards
        this.cards.forEach(card => {
            if (card.flipped || card.matched) {
                this.ctx.fillStyle = card.matched ? '#32CD32' : '#FFD700';
                this.ctx.fillRect(card.x, card.y, card.width, card.height);
                this.ctx.strokeStyle = '#000';
                this.ctx.strokeRect(card.x, card.y, card.width, card.height);
                
                this.ctx.fillStyle = '#000';
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(card.actor, card.x + card.width/2, card.y + card.height/2);
            } else {
                this.ctx.fillStyle = '#8B0000';
                this.ctx.fillRect(card.x, card.y, card.width, card.height);
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(card.x, card.y, card.width, card.height);
                
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🎬', card.x + card.width/2, card.y + card.height/2 + 10);
            }
        });
        
        // Stats
        this.drawText('Match the Bollywood actors!', this.canvas.width/2, 30, '18px Arial', '#FFD700');
        this.drawText(`Moves: ${this.moves}`, this.canvas.width/2, 55, '16px Arial', '#FFF');
        this.drawText(`Matched: ${this.matchedCards.length/2}/${this.cards.length/2}`, this.canvas.width/2, 580, '16px Arial', '#FFF');
    }
}

// Fruit Slice Masala Game
class FruitSliceMasalaGame extends GameEngine {
    constructor() {
        super();
        this.fruits = [];
        this.bombs = [];
        this.particles = [];
        this.isSlicing = false;
        this.slicePath = [];
        this.fruitTypes = ['🥭', '🥥', '🍈', '🥝', '🌶️', '🧄'];
        this.spawnTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.showLives = true;
        this.showLevel = true;
    }

    reset() {
        super.reset();
        this.fruits = [];
        this.bombs = [];
        this.particles = [];
        this.isSlicing = false;
        this.slicePath = [];
        this.spawnTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;
    }

    bindEvents() {
        const startSlice = (e) => {
            this.isSlicing = true;
            this.slicePath = [];
        };
        
        const updateSlice = (e) => {
            if (!this.isSlicing || this.gameState !== 'playing') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (clientX && clientY) {
                const x = (clientX - rect.left) * (this.canvas.width / rect.width);
                const y = (clientY - rect.top) * (this.canvas.height / rect.height);
                this.slicePath.push({x, y});
                this.checkSlice(x, y);
            }
            e.preventDefault();
        };
        
        const endSlice = () => {
            this.isSlicing = false;
            this.slicePath = [];
        };

        this.canvas.addEventListener('mousedown', startSlice);
        this.canvas.addEventListener('mousemove', updateSlice);
        this.canvas.addEventListener('mouseup', endSlice);
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startSlice(e); });
        this.canvas.addEventListener('touchmove', updateSlice);
        this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); endSlice(); });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }
        });
    }

    update(deltaTime) {
        this.spawnTimer += deltaTime;
        this.comboTimer -= deltaTime;
        
        if (this.comboTimer <= 0) {
            this.combo = 0;
        }
        
        // Spawn fruits
        if (this.spawnTimer > Math.max(500, 1200 - this.level * 100)) {
            this.spawnFruit();
            this.spawnTimer = 0;
            
            if (Math.random() < 0.15 + this.level * 0.05) {
                this.spawnBomb();
            }
        }
        
        // Update fruits
        this.fruits = this.fruits.filter(fruit => {
            fruit.x += fruit.vx;
            fruit.y += fruit.vy;
            fruit.vy += 0.3;
            fruit.rotation += fruit.rotationSpeed;
            
            // Remove fruits that missed
            if (fruit.y > this.canvas.height + 50) {
                if (!fruit.sliced) {
                    this.updateLives(-1);
                }
                return false;
            }
            return !fruit.sliced;
        });
        
        // Update bombs
        this.bombs = this.bombs.filter(bomb => {
            bomb.x += bomb.vx;
            bomb.y += bomb.vy;
            bomb.vy += 0.3;
            bomb.rotation += bomb.rotationSpeed;
            return bomb.y < this.canvas.height + 50;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life--;
            return particle.life > 0;
        });

        // Level progression
        if (this.score > this.level * 200) {
            this.updateLevel(this.level + 1);
        }
    }

    spawnFruit() {
        const fruit = {
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: this.canvas.height,
            vx: (Math.random() - 0.5) * 6,
            vy: -(Math.random() * 8 + 12),
            size: 40,
            type: this.fruitTypes[Math.floor(Math.random() * this.fruitTypes.length)],
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            sliced: false
        };
        this.fruits.push(fruit);
    }

    spawnBomb() {
        const bomb = {
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: this.canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: -(Math.random() * 6 + 10),
            size: 35,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.3
        };
        this.bombs.push(bomb);
    }

    checkSlice(x, y) {
        // Check fruit slicing
        this.fruits.forEach((fruit, index) => {
            if (!fruit.sliced && this.getDistance(x, y, fruit.x, fruit.y) < fruit.size/2) {
                this.sliceFruit(fruit);
            }
        });
        
        // Check bomb collision
        this.bombs.forEach((bomb, index) => {
            if (this.getDistance(x, y, bomb.x, bomb.y) < bomb.size/2) {
                this.hitBomb();
            }
        });
    }

    sliceFruit(fruit) {
        fruit.sliced = true;
        this.combo++;
        this.comboTimer = 2000;
        const points = 10 * Math.max(1, this.combo);
        this.updateScore(points);
        
        // Create particles
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: fruit.x,
                y: fruit.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: '#FFA500',
                life: 60,
                size: Math.random() * 4 + 2
            });
        }
    }

    hitBomb() {
        this.updateLives(-1);
        
        // Explosion particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.canvas.width/2,
                y: this.canvas.height/2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                color: '#FF0000',
                life: 80,
                size: Math.random() * 6 + 3
            });
        }
    }

    render() {
        super.render();
        
        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fruits
        this.fruits.forEach(fruit => {
            this.ctx.save();
            this.ctx.translate(fruit.x, fruit.y);
            this.ctx.rotate(fruit.rotation);
            this.ctx.font = `${fruit.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(fruit.type, 0, fruit.size/3);
            this.ctx.restore();
        });
        
        // Bombs
        this.bombs.forEach(bomb => {
            this.ctx.save();
            this.ctx.translate(bomb.x, bomb.y);
            this.ctx.rotate(bomb.rotation);
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, bomb.size/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('💣', 0, 7);
            this.ctx.restore();
        });
        
        // Particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life / 60;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        
        // Slice trail
        if (this.slicePath.length > 1) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(this.slicePath[0].x, this.slicePath[0].y);
            for (let i = 1; i < this.slicePath.length; i++) {
                this.ctx.lineTo(this.slicePath[i].x, this.slicePath[i].y);
            }
            this.ctx.stroke();
        }
        
        // Combo indicator
        if (this.combo > 1) {
            this.drawText(`COMBO x${this.combo}!`, this.canvas.width/2, 50, '24px Arial', '#FFD700');
        }
    }
}

// Racing Rickshaw Game
class RacingRickshawGame extends GameEngine {
    constructor() {
        super();
        this.player = { x: 375, y: 450, width: 50, height: 80, speed: 6 };
        this.obstacles = [];
        this.powerUps = [];
        this.spawnTimer = 0;
        this.roadOffset = 0;
        this.speed = 3;
        this.showLives = true;
        this.showLevel = true;
    }

    reset() {
        super.reset();
        this.player = { x: 375, y: 450, width: 50, height: 80, speed: 6 };
        this.obstacles = [];
        this.powerUps = [];
        this.spawnTimer = 0;
        this.roadOffset = 0;
        this.speed = 3;
    }

    bindEvents() {
        this.keys = {};
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch controls
        let touchStartX = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - touchStartX;
            this.player.x += deltaX * 0.5;
            this.player.x = Math.max(200, Math.min(600, this.player.x));
            touchStartX = touchX;
        });
    }

    update(deltaTime) {
        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 200) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < 600 - this.player.width) {
            this.player.x += this.player.speed;
        }

        // Road animation
        this.roadOffset += this.speed;
        if (this.roadOffset >= 40) {
            this.roadOffset = 0;
        }

        // Spawn obstacles and power-ups
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > Math.max(800, 1500 - this.level * 100)) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            
            if (Math.random() < 0.2) {
                this.spawnPowerUp();
            }
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.y += this.speed + 2;
            
            // Check collision
            if (this.isPointInRect(this.player.x + this.player.width/2, this.player.y + this.player.height/2,
                                 obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                this.updateLives(-1);
                return false;
            }
            
            // Score points for passing
            if (obstacle.y > this.player.y + this.player.height && !obstacle.passed) {
                obstacle.passed = true;
                this.updateScore(5);
            }
            
            return obstacle.y < this.canvas.height + 50;
        });

        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += this.speed + 1;
            
            // Check collection
            if (this.isPointInRect(this.player.x + this.player.width/2, this.player.y + this.player.height/2,
                                 powerUp.x, powerUp.y, powerUp.size, powerUp.size)) {
                this.updateScore(20);
                return false;
            }
            
            return powerUp.y < this.canvas.height + 50;
        });

        // Level progression
        if (this.score > this.level * 100) {
            this.updateLevel(this.level + 1);
            this.speed += 0.5;
        }
    }

    spawnObstacle() {
        const lanes = [250, 325, 400, 475, 550];
        this.obstacles.push({
            x: lanes[Math.floor(Math.random() * lanes.length)],
            y: -100,
            width: 40,
            height: 70,
            type: Math.random() < 0.5 ? 'car' : 'truck',
            passed: false
        });
    }

    spawnPowerUp() {
        this.powerUps.push({
            x: 250 + Math.random() * 300,
            y: -50,
            size: 30,
            type: 'coin'
        });
    }

    render() {
        super.render();
        
        // Road background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Road
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(200, 0, 400, this.canvas.height);
        
        // Lane dividers
        this.ctx.fillStyle = '#FFF';
        for (let i = 0; i < 4; i++) {
            const x = 250 + i * 75;
            for (let y = this.roadOffset; y < this.canvas.height; y += 40) {
                this.ctx.fillRect(x - 2, y, 4, 20);
            }
        }
        
        // Side decorations
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 0, 200, this.canvas.height);
        this.ctx.fillRect(600, 0, 200, this.canvas.height);
        
        // Player rickshaw
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Rickshaw details
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 60, 10, 15);
        this.ctx.fillRect(this.player.x + 35, this.player.y + 60, 10, 15);
        
        // Obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'car') {
                this.ctx.fillStyle = '#FF0000';
            } else {
                this.ctx.fillStyle = '#8B4513';
            }
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            this.ctx.strokeStyle = '#000';
            this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2, powerUp.size/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.stroke();
        });
        
        // Speed indicator
        this.drawText(`Speed: ${this.speed.toFixed(1)}`, 50, 50, '16px Arial', '#FFF', 'left');
    }
}

// Ludo Blitz Game
class LudoBlitzGame extends GameEngine {
    constructor() {
        super();
        this.boardSize = 15;
        this.cellSize = 30;
        this.players = ['red', 'blue', 'green', 'yellow'];
        this.currentPlayer = 0;
        this.dice = 1;
        this.gameTokens = [];
        this.canRoll = true;
        this.showLives = false;
        this.showLevel = false;
        this.winner = null;
    }

    reset() {
        super.reset();
        this.currentPlayer = 0;
        this.dice = 1;
        this.canRoll = true;
        this.winner = null;
        this.initializeTokens();
    }

    init(canvas) {
        super.init(canvas);
        this.initializeTokens();
    }

    initializeTokens() {
        this.gameTokens = [];
        const startPositions = {
            red: [{x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 1}, {x: 2, y: 2}],
            blue: [{x: 12, y: 1}, {x: 12, y: 2}, {x: 13, y: 1}, {x: 13, y: 2}],
            green: [{x: 12, y: 12}, {x: 12, y: 13}, {x: 13, y: 12}, {x: 13, y: 13}],
            yellow: [{x: 1, y: 12}, {x: 1, y: 13}, {x: 2, y: 12}, {x: 2, y: 13}]
        };

        this.players.forEach(color => {
            startPositions[color].forEach((pos, index) => {
                this.gameTokens.push({
                    color,
                    id: index,
                    x: pos.x,
                    y: pos.y,
                    position: -1, // -1 means in home
                    isHome: true
                });
            });
        });
    }

    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState !== 'playing') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            // Check dice click
            if (this.canRoll && x >= 650 && x <= 750 && y >= 50 && y <= 150) {
                this.rollDice();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && this.canRoll && this.gameState === 'playing') {
                this.rollDice();
            } else if (e.key === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }
        });
    }

    rollDice() {
        if (!this.canRoll) return;
        
        this.dice = Math.floor(Math.random() * 6) + 1;
        this.canRoll = false;
        
        // Simple AI: move a random token
        setTimeout(() => {
            this.moveToken();
            this.nextPlayer();
        }, 1000);
    }

    moveToken() {
        const currentPlayerTokens = this.gameTokens.filter(token => 
            token.color === this.players[this.currentPlayer] && !token.finished
        );
        
        if (currentPlayerTokens.length > 0) {
            const token = currentPlayerTokens[Math.floor(Math.random() * currentPlayerTokens.length)];
            
            if (token.isHome && this.dice === 6) {
                token.isHome = false;
                token.position = 0;
                this.updateTokenPosition(token);
            } else if (!token.isHome) {
                token.position += this.dice;
                if (token.position >= 52) {
                    token.finished = true;
                    this.updateScore(20);
                } else {
                    this.updateTokenPosition(token);
                }
            }
        }
        
        this.updateScore(this.dice);
        
        // Check win condition
        const finishedTokens = this.gameTokens.filter(token => 
            token.color === this.players[this.currentPlayer] && token.finished
        );
        
        if (finishedTokens.length === 4) {
            this.winner = this.players[this.currentPlayer];
            this.gameOver(true);
        }
    }

    updateTokenPosition(token) {
        // Simplified position mapping for visual purposes
        const angle = (token.position / 52) * 2 * Math.PI;
        token.x = 7.5 + Math.cos(angle) * 5;
        token.y = 7.5 + Math.sin(angle) * 5;
    }

    nextPlayer() {
        if (this.dice !== 6) {
            this.currentPlayer = (this.currentPlayer + 1) % 4;
        }
        this.canRoll = true;
    }

    render() {
        super.render();
        
        // Background
        this.ctx.fillStyle = '#F5F5DC';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Board
        const startX = 50;
        const startY = 50;
        
        // Draw grid
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.boardSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX + i * this.cellSize, startY);
            this.ctx.lineTo(startX + i * this.cellSize, startY + this.boardSize * this.cellSize);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY + i * this.cellSize);
            this.ctx.lineTo(startX + this.boardSize * this.cellSize, startY + i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Home areas
        const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00'];
        const homeAreas = [
            {x: 0, y: 0, width: 6, height: 6},
            {x: 9, y: 0, width: 6, height: 6},
            {x: 9, y: 9, width: 6, height: 6},
            {x: 0, y: 9, width: 6, height: 6}
        ];
        
        homeAreas.forEach((area, index) => {
            this.ctx.fillStyle = colors[index];
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(
                startX + area.x * this.cellSize,
                startY + area.y * this.cellSize,
                area.width * this.cellSize,
                area.height * this.cellSize
            );
            this.ctx.globalAlpha = 1;
        });
        
        // Draw tokens
        this.gameTokens.forEach(token => {
            if (!token.finished) {
                const colorMap = { red: '#FF0000', blue: '#0000FF', green: '#00FF00', yellow: '#FFFF00' };
                this.ctx.fillStyle = colorMap[token.color];
                this.ctx.beginPath();
                this.ctx.arc(
                    startX + (token.x + 0.5) * this.cellSize,
                    startY + (token.y + 0.5) * this.cellSize,
                    this.cellSize * 0.3,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                this.ctx.strokeStyle = '#000';
                this.ctx.stroke();
            }
        });
        
        // Dice
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(650, 50, 100, 100);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(650, 50, 100, 100);
        
        this.drawText(this.dice.toString(), 700, 110, '36px Arial', '#000');
        
        // Current player indicator
        const playerColors = ['Red', 'Blue', 'Green', 'Yellow'];
        this.drawText(`Current: ${playerColors[this.currentPlayer]}`, 650, 200, '18px Arial', colors[this.currentPlayer]);
        
        if (this.canRoll) {
            this.drawText('Click dice or press SPACE', 650, 230, '14px Arial', '#666');
        }
    }
}

// Rooftop Cricket Game
class RooftopCricketGame extends GameEngine {
    constructor() {
        super();
        this.bat = { x: 400, y: 500, width: 60, height: 15, angle: 0 };
        this.ball = null;
        this.pitcher = { x: 400, y: 100, timer: 0, interval: 3000 };
        this.runs = 0;
        this.wickets = 0;
        this.maxWickets = 3;
        this.showLives = false;
        this.showLevel = false;
        this.swingTimer = 0;
        this.isSwinging = false;
    }

    reset() {
        super.reset();
        this.bat = { x: 400, y: 500, width: 60, height: 15, angle: 0 };
        this.ball = null;
        this.pitcher = { x: 400, y: 100, timer: 0, interval: 3000 };
        this.runs = 0;
        this.wickets = 0;
        this.swingTimer = 0;
        this.isSwinging = false;
    }

    bindEvents() {
        const swing = () => {
            if (this.gameState === 'playing' && !this.isSwinging) {
                this.swing();
            }
        };

        this.canvas.addEventListener('click', swing);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            swing();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && this.gameState === 'playing') {
                swing();
            } else if (e.key === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }
        });
    }

    swing() {
        this.isSwinging = true;
        this.swingTimer = 200;
        this.bat.angle = -Math.PI / 4;
        
        // Check if ball is in hitting zone
        if (this.ball && 
            Math.abs(this.ball.x - this.bat.x) < 50 && 
            Math.abs(this.ball.y - this.bat.y) < 50) {
            this.hitBall();
        }
    }

    hitBall() {
        if (!this.ball) return;
        
        // Calculate hit direction and power
        const power = Math.random() * 10 + 5;
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        
        this.ball.vx = Math.cos(angle) * power;
        this.ball.vy = Math.sin(angle) * power - 5;
        this.ball.hit = true;
        
        // Calculate runs based on distance
        const distance = Math.abs(this.ball.vx) + Math.abs(this.ball.vy);
        let runsScored = 0;
        
        if (distance > 15) runsScored = 6; // Six
        else if (distance > 12) runsScored = 4; // Four
        else if (distance > 8) runsScored = 2;
        else if (distance > 5) runsScored = 1;
        
        this.runs += runsScored;
        this.updateScore(runsScored * 10);
        
        if (runsScored === 6) {
            this.updateScore(20); // Bonus for six
        } else if (runsScored === 4) {
            this.updateScore(10); // Bonus for four
        }
    }

    update(deltaTime) {
        // Bat swing animation
        if (this.isSwinging) {
            this.swingTimer -= deltaTime;
            if (this.swingTimer <= 0) {
                this.isSwinging = false;
                this.bat.angle = 0;
            } else {
                this.bat.angle = -Math.PI / 4 * (this.swingTimer / 200);
            }
        }
        
        // Pitcher timer
        this.pitcher.timer += deltaTime;
        if (this.pitcher.timer >= this.pitcher.interval && !this.ball) {
            this.bowlBall();
            this.pitcher.timer = 0;
        }
        
        // Ball movement
        if (this.ball) {
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
            
            if (!this.ball.hit) {
                // Ball coming towards bat
                if (this.ball.y >= this.bat.y) {
                    if (Math.abs(this.ball.x - this.bat.x) < 30) {
                        // Missed but close
                        this.wickets++;
                    } else {
                        // Completely missed
                        this.wickets++;
                    }
                    this.ball = null;
                    
                    if (this.wickets >= this.maxWickets) {
                        this.gameOver(false);
                    }
                }
            } else {
                // Ball hit, apply gravity
                this.ball.vy += 0.3;
                
                // Remove ball when it goes off screen
                if (this.ball.y > this.canvas.height || 
                    this.ball.x < 0 || 
                    this.ball.x > this.canvas.width) {
                    this.ball = null;
                }
            }
        }
    }

    bowlBall() {
        this.ball = {
            x: this.pitcher.x,
            y: this.pitcher.y,
            vx: (Math.random() - 0.5) * 2,
            vy: 4,
            radius: 8,
            hit: false
        };
    }

    render() {
        super.render();
        
        // Sky background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Rooftops
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 550, this.canvas.width, 50);
        
        // Buildings in background
        for (let i = 0; i < 5; i++) {
            this.ctx.fillStyle = i % 2 === 0 ? '#696969' : '#778899';
            this.ctx.fillRect(i * 160, 400, 160, 150);
        }
        
        // Pitcher
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(this.pitcher.x - 15, this.pitcher.y - 30, 30, 60);
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(this.pitcher.x, this.pitcher.y - 40, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bat
        this.ctx.save();
        this.ctx.translate(this.bat.x, this.bat.y);
        this.ctx.rotate(this.bat.angle);
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(-this.bat.width/2, -this.bat.height/2, this.bat.width, this.bat.height);
        this.ctx.restore();
        
        // Batsman
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(this.bat.x - 15, this.bat.y - 50, 30, 50);
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(this.bat.x, this.bat.y - 60, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball
        if (this.ball) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Stats
        this.drawText(`Runs: ${this.runs}`, 50, 50, '20px Arial', '#000', 'left');
        this.drawText(`Wickets: ${this.wickets}/${this.maxWickets}`, 50, 80, '16px Arial', '#000', 'left');
        
        if (!this.ball && this.wickets < this.maxWickets) {
            this.drawText('Get ready...', this.canvas.width/2, 300, '24px Arial', '#333');
        }
        
        this.drawText('Click or press SPACE to swing!', this.canvas.width/2, this.canvas.height - 30, '16px Arial', '#666');
    }
}

// Rangoli Tetris Game
class RangoliTetrisGame extends GameEngine {
    constructor() {
        super();
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropTimer = 0;
        this.dropInterval = 1000;
        this.pieces = [
            [[1,1,1,1]], // I
            [[1,1],[1,1]], // O
            [[0,1,0],[1,1,1]], // T
            [[0,1,1],[1,1,0]], // S
            [[1,1,0],[0,1,1]], // Z
            [[1,0,0],[1,1,1]], // J
            [[0,0,1],[1,1,1]]  // L
        ];
        this.colors = ['#FF9500', '#00CED1', '#FF1493', '#FFD700', '#32CD32', '#FF6B6B', '#9B59B6'];
        this.showLives = false;
        this.showLevel = true;
        this.linesCleared = 0;
    }

    reset() {
        super.reset();
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropTimer = 0;
        this.dropInterval = 1000;
        this.linesCleared = 0;
        this.spawnPiece();
    }

    init(canvas) {
        super.init(canvas);
        this.spawnPiece();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case 'Escape':
                    this.pause();
                    break;
            }
        });

        // Touch controls
        let touchStartX = 0, touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) {
                    this.movePiece(1, 0);
                } else if (deltaX < -30) {
                    this.movePiece(-1, 0);
                }
            } else {
                if (deltaY > 30) {
                    this.movePiece(0, 1);
                } else if (deltaY < -30) {
                    this.rotatePiece();
                }
            }
        });
    }

    spawnPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = {
            shape: this.pieces[pieceIndex].map(row => [...row]),
            x: Math.floor(this.board[0].length / 2) - Math.floor(this.pieces[pieceIndex][0].length / 2),
            y: 0,
            color: this.colors[pieceIndex]
        };
    }

    movePiece(dx, dy) {
        if (this.canMove(this.currentPiece.x + dx, this.currentPiece.y + dy, this.currentPiece.shape)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }

    canMove(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    if (newX < 0 || newX >= this.board[0].length || newY >= this.board.length) {
                        return false;
                    }
                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, index) =>
            this.currentPiece.shape.map(row => row[index]).reverse()
        );
        if (this.canMove(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
        }
    }

    update(deltaTime) {
        this.dropTimer += deltaTime;
        const currentInterval = Math.max(100, this.dropInterval - this.level * 50);
        
        if (this.dropTimer >= currentInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
                this.clearLines();
                this.spawnPiece();
                if (!this.canMove(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
                    this.gameOver(false);
                }
            }
            this.dropTimer = 0;
        }
    }

    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = this.currentPiece.x + col;
                    const y = this.currentPiece.y + row;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let row = this.board.length - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(10).fill(0));
                linesCleared++;
                row++;
            }
        }
        if (linesCleared > 0) {
            this.linesCleared += linesCleared;
            this.updateScore(linesCleared * 100 * this.level);
            
            // Level up every 10 lines
            if (this.linesCleared >= this.level * 10) {
                this.updateLevel(this.level + 1);
            }
        }
    }

    render() {
        super.render();
        
        const blockSize = 25;
        const offsetX = 200;
        const offsetY = 50;
        
        // Background with rangoli pattern
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, 400
        );
        gradient.addColorStop(0, '#2C1810');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Board outline
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(offsetX - 2, offsetY - 2, 
                           this.board[0].length * blockSize + 4, 
                           this.board.length * blockSize + 4);
        
        // Board
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                const x = offsetX + col * blockSize;
                const y = offsetY + row * blockSize;
                
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(x, y, blockSize - 1, blockSize - 1);
                    this.ctx.strokeStyle = '#000';
                    this.ctx.strokeRect(x, y, blockSize - 1, blockSize - 1);
                } else {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }
        
        // Current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        const x = offsetX + (this.currentPiece.x + col) * blockSize;
                        const y = offsetY + (this.currentPiece.y + row) * blockSize;
                        this.ctx.fillRect(x, y, blockSize - 1, blockSize - 1);
                        this.ctx.strokeStyle = '#000';
                        this.ctx.strokeRect(x, y, blockSize - 1, blockSize - 1);
                    }
                }
            }
        }
        
        // Stats
        this.drawText('Rangoli Tetris', 550, 100, '24px Arial', '#FFD700', 'center');
        this.drawText(`Lines: ${this.linesCleared}`, 550, 150, '18px Arial', '#FFF', 'center');
        this.drawText('Controls:', 550, 200, '16px Arial', '#FFD700', 'center');
        this.drawText('← → Move', 550, 220, '14px Arial', '#FFF', 'center');
        this.drawText('↓ Drop', 550, 240, '14px Arial', '#FFF', 'center');
        this.drawText('↑ Rotate', 550, 260, '14px Arial', '#FFF', 'center');
    }
}

// Game Manager
class GameManager {
    constructor() {
        this.currentGame = null;
        this.gameInstance = null;
        this.settings = {
            musicVolume: 70,
            sfxVolume: 80,
            graphicsQuality: 'medium',
            controlStyle: 'auto'
        };
        this.highScores = {};
        this.gameStats = {
            gamesPlayed: 0,
            totalScore: 0
        };
        this.loadData();
    }

    init() {
        this.showSplashScreen();
        this.bindEvents();
        this.updateStats();
    }

    showSplashScreen() {
        setTimeout(() => {
            document.getElementById('splashScreen').classList.add('hidden');
            document.getElementById('mainHub').classList.remove('hidden');
        }, 4000);
    }

    bindEvents() {
        // Game selection
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameId = card.dataset.game;
                this.startGame(gameId);
            });
        });

        // Navigation
        document.getElementById('backToHub').addEventListener('click', () => this.returnToHub());
        document.getElementById('backToHubFromGameOver').addEventListener('click', () => this.returnToHub());
        document.getElementById('quitFromPause').addEventListener('click', () => this.returnToHub());

        // Game controls
        document.getElementById('startGameBtn').addEventListener('click', () => {
            if (this.gameInstance) this.gameInstance.start();
        });
        
        document.getElementById('gamePauseBtn').addEventListener('click', () => {
            if (this.gameInstance) this.gameInstance.pause();
        });
        
        document.getElementById('resumeFromPause').addEventListener('click', () => {
            if (this.gameInstance) this.gameInstance.resume();
        });
        
        document.getElementById('restartFromPause').addEventListener('click', () => {
            this.restartCurrentGame();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartCurrentGame();
        });

        // Modals
        this.bindModalEvents();
        
        // Settings
        this.bindSettingsEvents();

        // ESC key for pause
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameInstance && this.gameInstance.gameState === 'playing') {
                this.gameInstance.pause();
            }
        });
    }

    bindModalEvents() {
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.remove('hidden');
        });
        document.getElementById('closeSettings').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('hidden');
        });

        // High scores modal
        document.getElementById('scoresBtn').addEventListener('click', () => {
            this.showHighScores();
            document.getElementById('scoresModal').classList.remove('hidden');
        });
        document.getElementById('closeScores').addEventListener('click', () => {
            document.getElementById('scoresModal').classList.add('hidden');
        });

        // Instructions modal
        document.getElementById('instructionsBtn').addEventListener('click', () => {
            document.getElementById('instructionsModal').classList.remove('hidden');
        });
        document.getElementById('closeInstructions').addEventListener('click', () => {
            document.getElementById('instructionsModal').classList.add('hidden');
        });

        // Score actions
        document.getElementById('clearScores').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all high scores?')) {
                this.highScores = {};
                this.saveData();
                this.showHighScores();
            }
        });

        // Modal click outside to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    }

    bindSettingsEvents() {
        // Volume controls
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            this.settings.musicVolume = parseInt(e.target.value);
            document.getElementById('musicVolumeValue').textContent = `${e.target.value}%`;
            this.saveData();
        });

        document.getElementById('sfxVolume').addEventListener('input', (e) => {
            this.settings.sfxVolume = parseInt(e.target.value);
            document.getElementById('sfxVolumeValue').textContent = `${e.target.value}%`;
            this.saveData();
        });

        // Other settings
        document.getElementById('graphicsQuality').addEventListener('change', (e) => {
            this.settings.graphicsQuality = e.target.value;
            this.saveData();
        });

        document.getElementById('controlStyle').addEventListener('change', (e) => {
            this.settings.controlStyle = e.target.value;
            this.saveData();
        });
    }

    startGame(gameId) {
        this.currentGame = gameId;
        
        document.getElementById('mainHub').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        
        const gameData = this.getGameData(gameId);
        document.getElementById('currentGameTitle').textContent = gameData.title;
        document.getElementById('instructionText').textContent = gameData.instructions;
        
        // Reset UI
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');
        document.getElementById('gameInstructions').classList.remove('hidden');
        document.getElementById('gameControls').classList.add('hidden');
        
        // Initialize game
        const canvas = document.getElementById('canvas');
        this.gameInstance = this.createGameInstance(gameId);
        this.gameInstance.init(canvas);
    }

    createGameInstance(gameId) {
        switch(gameId) {
            case 'brick-blaster':
                return new BrickBlasterGame();
            case 'snake-redux':
                return new SnakeReduxGame();
            case 'memory-bollywood':
                return new MemoryBollywoodGame();
            case 'fruit-slice-masala':
                return new FruitSliceMasalaGame();
            case 'racing-rickshaw':
                return new RacingRickshawGame();
            case 'ludo-blitz':
                return new LudoBlitzGame();
            case 'rooftop-cricket':
                return new RooftopCricketGame();
            case 'rangoli-tetris':
                return new RangoliTetrisGame();
            default:
                return new BrickBlasterGame();
        }
    }

    getGameData(gameId) {
        const games = {
            'brick-blaster': { 
                title: 'Brick Blaster', 
                icon: '🧱',
                instructions: 'Move your paddle to keep the ball in play and break all the colorful bricks! Use mouse/touch to control.'
            },
            'fruit-slice-masala': { 
                title: 'Fruit Slice Masala', 
                icon: '🥭',
                instructions: 'Slice falling fruits by drawing lines with your mouse or finger. Avoid the bombs!'
            },
            'memory-bollywood': { 
                title: 'Memory Bollywood', 
                icon: '🎬',
                instructions: 'Click cards to flip them and find matching pairs of Bollywood actors. Match all pairs to win!'
            },
            'snake-redux': { 
                title: 'Snake Redux', 
                icon: '🐍',
                instructions: 'Use arrow keys or swipe to guide your snake. Eat food to grow, but don\'t hit walls or yourself!'
            },
            'racing-rickshaw': { 
                title: 'Racing Rickshaw', 
                icon: '🛺',
                instructions: 'Race through busy Indian streets! Use arrow keys or touch to steer and avoid obstacles.'
            },
            'ludo-blitz': { 
                title: 'Ludo Blitz', 
                icon: '🎲',
                instructions: 'Click the dice or press SPACE to roll. Move your tokens around the board to reach home first!'
            },
            'rooftop-cricket': { 
                title: 'Rooftop Cricket', 
                icon: '🏏',
                instructions: 'Time your swing perfectly! Click or press SPACE when the ball comes to hit it for runs.'
            },
            'rangoli-tetris': { 
                title: 'Rangoli Tetris', 
                icon: '🌸',
                instructions: 'Use arrow keys to move and rotate falling pieces. Clear lines by filling rows completely!'
            }
        };
        return games[gameId] || { title: 'Unknown Game', icon: '❓', instructions: 'Game instructions not available.' };
    }

    restartCurrentGame() {
        if (this.currentGame) {
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('pauseOverlay').classList.add('hidden');
            
            const canvas = document.getElementById('canvas');
            this.gameInstance = this.createGameInstance(this.currentGame);
            this.gameInstance.init(canvas);
            
            document.getElementById('gameInstructions').classList.remove('hidden');
            document.getElementById('gameControls').classList.add('hidden');
        }
    }

    returnToHub() {
        if (this.gameInstance) {
            this.gameInstance.isRunning = false;
        }
        
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('mainHub').classList.remove('hidden');
        
        this.currentGame = null;
        this.gameInstance = null;
    }

    saveScore(gameId, score) {
        const isHighScore = !this.highScores[gameId] || score > this.highScores[gameId];
        
        if (isHighScore) {
            this.highScores[gameId] = score;
        }
        
        this.gameStats.gamesPlayed++;
        this.gameStats.totalScore += score;
        this.saveData();
        this.updateStats();
        
        return isHighScore;
    }

    showHighScores() {
        const container = document.getElementById('highScoresList');
        container.innerHTML = '';
        
        const sortedScores = Object.entries(this.highScores)
            .sort(([,a], [,b]) => b - a);
        
        if (sortedScores.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No high scores yet! Play some games to set records.</p>';
            return;
        }
        
        sortedScores.forEach(([gameId, score]) => {
            const gameData = this.getGameData(gameId);
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `
                <span class="score-game">${gameData.icon} ${gameData.title}</span>
                <span class="score-value">${score}</span>
            `;
            container.appendChild(scoreItem);
        });
    }

    updateStats() {
        document.getElementById('gamesPlayed').textContent = this.gameStats.gamesPlayed;
        document.getElementById('totalScore').textContent = this.gameStats.totalScore;
    }

    saveData() {
        try {
            localStorage.setItem('retro-pocket-settings', JSON.stringify(this.settings));
            localStorage.setItem('retro-pocket-scores', JSON.stringify(this.highScores));
            localStorage.setItem('retro-pocket-stats', JSON.stringify(this.gameStats));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    loadData() {
        try {
            const savedSettings = localStorage.getItem('retro-pocket-settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
            
            const savedScores = localStorage.getItem('retro-pocket-scores');
            if (savedScores) {
                this.highScores = JSON.parse(savedScores);
            }
            
            const savedStats = localStorage.getItem('retro-pocket-stats');
            if (savedStats) {
                this.gameStats = { ...this.gameStats, ...JSON.parse(savedStats) };
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
        
        // Apply settings to UI
        setTimeout(() => {
            document.getElementById('musicVolume').value = this.settings.musicVolume;
            document.getElementById('musicVolumeValue').textContent = `${this.settings.musicVolume}%`;
            document.getElementById('sfxVolume').value = this.settings.sfxVolume;
            document.getElementById('sfxVolumeValue').textContent = `${this.settings.sfxVolume}%`;
            document.getElementById('graphicsQuality').value = this.settings.graphicsQuality;
            document.getElementById('controlStyle').value = this.settings.controlStyle;
        }, 100);
    }
}

// Initialize the game manager
const gameManager = new GameManager();

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    gameManager.init();
});
