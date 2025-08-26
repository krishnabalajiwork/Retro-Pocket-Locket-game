// Retro Pocket Locket - 10 Games Collection
class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.lastTime = 0;
        this.score = 0;
        this.gameState = 'waiting'; // waiting, playing, paused, over
    }

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.bindEvents();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    bindEvents() {
        // Override in subclasses
    }

    start() {
        this.isRunning = true;
        this.gameState = 'playing';
        this.gameLoop();
        document.getElementById('gameStartBtn').classList.add('hidden');
        document.getElementById('gamePauseBtn').classList.remove('hidden');
    }

    pause() {
        this.gameState = 'paused';
        document.getElementById('gamePauseBtn').classList.add('hidden');
        document.getElementById('gameResumeBtn').classList.remove('hidden');
    }

    resume() {
        this.gameState = 'playing';
        document.getElementById('gameResumeBtn').classList.add('hidden');
        document.getElementById('gamePauseBtn').classList.remove('hidden');
    }

    gameOver() {
        this.isRunning = false;
        this.gameState = 'over';
        document.getElementById('gamePauseBtn').classList.add('hidden');
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        gameManager.saveScore(gameManager.currentGame, this.score);
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.gameState === 'playing') {
            this.update(deltaTime);
            this.render();
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
        document.getElementById('gameScore').textContent = `Score: ${this.score}`;
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
        this.level = 1;
    }

    init(canvas) {
        super.init(canvas);
        this.createBricks();
    }

    createBricks() {
        this.bricks = [];
        const colors = ['#FF9500', '#00CED1', '#FF1493', '#FFD700', '#800000'];
        const rows = 5 + this.level;
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
                    health: Math.floor(row / 2) + 1,
                    maxHealth: Math.floor(row / 2) + 1
                });
            }
        }
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch controls for mobile
        let touchStartX = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        this.canvas.addEventListener('touchmove', (e) => {
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - touchStartX;
            this.paddle.x += deltaX * 0.5;
            touchStartX = touchX;
            e.preventDefault();
        });
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
            this.ball.x <= this.paddle.x + this.paddle.width) {
            this.ball.dy = -Math.abs(this.ball.dy);
            // Add spin based on where ball hits paddle
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.dx = (hitPos - 0.5) * 8;
        }

        // Ball collision with bricks
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            if (this.ball.x >= brick.x && this.ball.x <= brick.x + brick.width &&
                this.ball.y >= brick.y && this.ball.y <= brick.y + brick.height) {
                this.ball.dy = -this.ball.dy;
                brick.health--;
                this.updateScore(10 * this.level);
                this.createParticles(brick.x + brick.width/2, brick.y + brick.height/2, brick.color);
                
                if (brick.health <= 0) {
                    this.bricks.splice(i, 1);
                    if (Math.random() < 0.1) {
                        this.createPowerUp(brick.x + brick.width/2, brick.y + brick.height/2);
                    }
                }
                break;
            }
        }

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life--;
            return particle.life > 0;
        });

        // Check for game over
        if (this.ball.y > this.canvas.height) {
            this.gameOver();
        }

        // Check for level complete
        if (this.bricks.length === 0) {
            this.level++;
            this.createBricks();
            this.ball.x = 400;
            this.ball.y = 300;
            this.updateScore(100 * this.level);
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                color: color,
                life: 30
            });
        }
    }

    createPowerUp(x, y) {
        this.powerUps.push({
            x: x,
            y: y,
            dy: 2,
            type: 'expand',
            size: 20
        });
    }

    render() {
        super.render();
        
        // Draw background pattern
        this.ctx.fillStyle = '#2a1810';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw decorative border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(5, 5, this.canvas.width - 10, this.canvas.height - 10);

        // Draw bricks
        this.bricks.forEach(brick => {
            this.ctx.fillStyle = brick.color;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            this.ctx.strokeStyle = '#333';
            this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            
            // Health indicator
            if (brick.health < brick.maxHealth) {
                this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                this.ctx.fillRect(brick.x, brick.y, brick.width * (brick.health / brick.maxHealth), 5);
            }
        });

        // Draw paddle
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.strokeRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FF4757';
        this.ctx.stroke();

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        });
        this.ctx.globalAlpha = 1;

        // Draw level indicator
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Level: ${this.level}`, 20, 30);
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
        this.foods = ['samosa', 'laddu', 'jalebi', 'kachori'];
        this.currentFood = 0;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) {
                        this.direction = {x: 0, y: -1};
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) {
                        this.direction = {x: 0, y: 1};
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) {
                        this.direction = {x: -1, y: 0};
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) {
                        this.direction = {x: 1, y: 0};
                    }
                    break;
            }
        });

        // Touch controls
        let touchStartX = 0;
        let touchStartY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0 && this.direction.x === 0) {
                    this.direction = {x: 1, y: 0};
                } else if (deltaX < 0 && this.direction.x === 0) {
                    this.direction = {x: -1, y: 0};
                }
            } else {
                if (deltaY > 0 && this.direction.y === 0) {
                    this.direction = {x: 0, y: 1};
                } else if (deltaY < 0 && this.direction.y === 0) {
                    this.direction = {x: 0, y: -1};
                }
            }
        });
    }

    update(deltaTime) {
        const head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.updateScore(10);
            this.currentFood = (this.currentFood + 1) % this.foods.length;
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: this.foods[this.currentFood]
            };
        } else {
            this.snake.pop();
        }
    }

    render() {
        super.render();
        
        // Draw background
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#32CD32';
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

        // Draw snake
        this.ctx.fillStyle = '#8B4513';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#DAA520'; // Head
            } else {
                this.ctx.fillStyle = '#8B4513'; // Body
            }
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });

        // Draw food
        this.ctx.fillStyle = this.getFoodColor(this.food.type);
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();

        // Draw food label
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.food.type,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2 + 4
        );
    }

    getFoodColor(type) {
        const colors = {
            'samosa': '#FFA500',
            'laddu': '#FFD700',
            'jalebi': '#FF6347',
            'kachori': '#DEB887'
        };
        return colors[type] || '#FFA500';
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
        this.cardWidth = 100;
        this.cardHeight = 120;
        this.actors = ['SRK', 'AB', 'Raj', 'Dev', 'Aar', 'Sal', 'Aki', 'Ran'];
    }

    init(canvas) {
        super.init(canvas);
        this.createCards();
    }

    createCards() {
        this.cards = [];
        const actors = [...this.actors];
        const pairs = actors.concat(actors);
        
        // Shuffle the pairs
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        let index = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.cards.push({
                    x: col * (this.cardWidth + 10) + 50,
                    y: row * (this.cardHeight + 10) + 50,
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
        this.canvas.addEventListener('click', (e) => {
            if (!this.canFlip) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const clickedCard = this.cards.find(card => 
                x >= card.x && x <= card.x + card.width &&
                y >= card.y && y <= card.y + card.height &&
                !card.flipped && !card.matched
            );
            
            if (clickedCard) {
                this.flipCard(clickedCard);
            }
        });

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.canFlip) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const clickedCard = this.cards.find(card => 
                x >= card.x && x <= card.x + card.width &&
                y >= card.y && y <= card.y + card.height &&
                !card.flipped && !card.matched
            );
            
            if (clickedCard) {
                this.flipCard(clickedCard);
            }
        });
    }

    flipCard(card) {
        card.flipped = true;
        this.flippedCards.push(card);
        
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
            setTimeout(() => this.gameOver(), 500);
        }
    }

    render() {
        super.render();
        
        // Draw background with film strip pattern
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cards
        this.cards.forEach(card => {
            if (card.flipped || card.matched) {
                // Show actor name
                this.ctx.fillStyle = card.matched ? '#32CD32' : '#FFD700';
                this.ctx.fillRect(card.x, card.y, card.width, card.height);
                this.ctx.strokeStyle = '#000';
                this.ctx.strokeRect(card.x, card.y, card.width, card.height);
                
                this.ctx.fillStyle = '#000';
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(card.actor, card.x + card.width/2, card.y + card.height/2);
            } else {
                // Show card back
                this.ctx.fillStyle = '#8B0000';
                this.ctx.fillRect(card.x, card.y, card.width, card.height);
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(card.x, card.y, card.width, card.height);
                
                // Bollywood pattern
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🎬', card.x + card.width/2, card.y + card.height/2);
            }
        });
        
        // Draw instructions
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Match the Bollywood actors!', this.canvas.width/2, 30);
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
        this.fruitTypes = ['🥭', '🥥', '🍈', '🥝'];
        this.spawnTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;
    }

    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isSlicing = true;
            this.slicePath = [];
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isSlicing) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.slicePath.push({x, y});
                this.checkSlice(x, y);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isSlicing = false;
            this.slicePath = [];
        });

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isSlicing = true;
            this.slicePath = [];
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isSlicing) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.slicePath.push({x, y});
                this.checkSlice(x, y);
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isSlicing = false;
            this.slicePath = [];
        });
    }

    update(deltaTime) {
        this.spawnTimer += deltaTime;
        this.comboTimer -= deltaTime;
        
        if (this.comboTimer <= 0) {
            this.combo = 0;
        }
        
        // Spawn fruits
        if (this.spawnTimer > 800) {
            this.spawnFruit();
            this.spawnTimer = 0;
            
            // Occasionally spawn bombs
            if (Math.random() < 0.15) {
                this.spawnBomb();
            }
        }
        
        // Update fruits
        this.fruits = this.fruits.filter(fruit => {
            fruit.x += fruit.vx;
            fruit.y += fruit.vy;
            fruit.vy += 0.3; // gravity
            fruit.rotation += fruit.rotationSpeed;
            
            return fruit.y < this.canvas.height + 50;
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
            if (!fruit.sliced && this.isNearPoint(x, y, fruit.x, fruit.y, fruit.size)) {
                this.sliceFruit(fruit, index);
            }
        });
        
        // Check bomb collision
        this.bombs.forEach((bomb, index) => {
            if (this.isNearPoint(x, y, bomb.x, bomb.y, bomb.size)) {
                this.hitBomb();
            }
        });
    }

    isNearPoint(x1, y1, x2, y2, radius) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy) < radius;
    }

    sliceFruit(fruit, index) {
        fruit.sliced = true;
        this.combo++;
        this.comboTimer = 2000;
        const points = 10 * this.combo;
        this.updateScore(points);
        
        // Create particles
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: fruit.x,
                y: fruit.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: this.getFruitColor(fruit.type),
                life: 60,
                size: Math.random() * 4 + 2
            });
        }
        
        setTimeout(() => {
            this.fruits.splice(index, 1);
        }, 100);
    }

    hitBomb() {
        this.gameOver();
    }

    getFruitColor(type) {
        const colors = {
            '🥭': '#FFA500',
            '🥥': '#8B4513',
            '🍈': '#98FB98',
            '🥝': '#ADFF2F'
        };
        return colors[type] || '#FFA500';
    }

    render() {
        super.render();
        
        // Draw background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fruits
        this.fruits.forEach(fruit => {
            this.ctx.save();
            this.ctx.translate(fruit.x, fruit.y);
            this.ctx.rotate(fruit.rotation);
            this.ctx.font = `${fruit.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(fruit.type, 0, fruit.size/3);
            this.ctx.restore();
        });
        
        // Draw bombs
        this.bombs.forEach(bomb => {
            this.ctx.save();
            this.ctx.translate(bomb.x, bomb.y);
            this.ctx.rotate(bomb.rotation);
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, bomb.size/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('💣', 0, 7);
            this.ctx.restore();
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life / 60;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        
        // Draw slice trail
        if (this.slicePath.length > 1) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(this.slicePath[0].x, this.slicePath[0].y);
            for (let i = 1; i < this.slicePath.length; i++) {
                this.ctx.lineTo(this.slicePath[i].x, this.slicePath[i].y);
            }
            this.ctx.stroke();
        }
        
        // Draw combo indicator
        if (this.combo > 1) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`COMBO x${this.combo}!`, this.canvas.width/2, 50);
        }
    }
}

// Simple implementations for remaining games to meet the requirement
class RangolicularTetrisGame extends GameEngine {
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
            }
        });
    }

    spawnPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = {
            shape: this.pieces[pieceIndex],
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
        if (this.dropTimer >= this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
                this.clearLines();
                this.spawnPiece();
                if (!this.canMove(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
                    this.gameOver();
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
                row++; // Check same row again
            }
        }
        if (linesCleared > 0) {
            this.updateScore(linesCleared * 100);
        }
    }

    render() {
        super.render();
        
        const blockSize = 25;
        const offsetX = 50;
        const offsetY = 50;
        
        // Draw background with rangoli pattern
        this.ctx.fillStyle = '#2C1810';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                const x = offsetX + col * blockSize;
                const y = offsetY + row * blockSize;
                
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(x, y, blockSize - 1, blockSize - 1);
                } else {
                    this.ctx.strokeStyle = '#444';
                    this.ctx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        const x = offsetX + (this.currentPiece.x + col) * blockSize;
                        const y = offsetY + (this.currentPiece.y + row) * blockSize;
                        this.ctx.fillRect(x, y, blockSize - 1, blockSize - 1);
                    }
                }
            }
        }
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
            graphicsQuality: 'medium'
        };
        this.highScores = {};
        this.loadSettings();
        this.loadHighScores();
    }

    init() {
        this.showSplashScreen();
        this.bindEvents();
    }

    showSplashScreen() {
        setTimeout(() => {
            document.getElementById('splashScreen').classList.add('hidden');
            document.getElementById('mainHub').classList.remove('hidden');
        }, 3000);
    }

    bindEvents() {
        // Game selection
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameId = card.dataset.game;
                this.startGame(gameId);
            });
        });

        // Navigation buttons
        document.getElementById('backToHub').addEventListener('click', () => {
            this.returnToHub();
        });

        document.getElementById('backToHubFromGameOver').addEventListener('click', () => {
            this.returnToHub();
        });

        // Game controls
        document.getElementById('gameStartBtn').addEventListener('click', () => {
            if (this.gameInstance) {
                this.gameInstance.start();
            }
        });

        document.getElementById('gamePauseBtn').addEventListener('click', () => {
            if (this.gameInstance) {
                this.gameInstance.pause();
            }
        });

        document.getElementById('gameResumeBtn').addEventListener('click', () => {
            if (this.gameInstance) {
                this.gameInstance.resume();
            }
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartCurrentGame();
        });

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

        // Settings controls
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            this.settings.musicVolume = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('sfxVolume').addEventListener('input', (e) => {
            this.settings.sfxVolume = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('graphicsQuality').addEventListener('change', (e) => {
            this.settings.graphicsQuality = e.target.value;
            this.saveSettings();
        });
    }

    startGame(gameId) {
        this.currentGame = gameId;
        
        // Hide hub, show game container
        document.getElementById('mainHub').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        
        // Set game title
        const gameData = this.getGameData(gameId);
        document.getElementById('currentGameTitle').textContent = gameData.title;
        
        // Reset game state
        document.getElementById('gameScore').textContent = 'Score: 0';
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('gameControls').classList.remove('hidden');
        document.getElementById('gameStartBtn').classList.remove('hidden');
        document.getElementById('gamePauseBtn').classList.add('hidden');
        document.getElementById('gameResumeBtn').classList.add('hidden');
        
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
            case 'rangoli-tetris':
                return new RangolicularTetrisGame();
            default:
                // For remaining games, use a simple placeholder
                return new SimpleGameTemplate(gameId);
        }
    }

    getGameData(gameId) {
        const games = {
            'brick-blaster': { title: 'Brick Blaster', icon: '🧱' },
            'subway-sprinter': { title: 'Subway Sprinter', icon: '🚇' },
            'rooftop-cricket': { title: 'Rooftop Cricket Smash', icon: '🏏' },
            'fruit-slice-masala': { title: 'Fruit Slice Masala', icon: '🥭' },
            'racing-rickshaw': { title: 'Racing Rickshaw', icon: '🛺' },
            'ludo-blitz': { title: 'Ludo Blitz', icon: '🎲' },
            'snake-redux': { title: 'Snake Redux', icon: '🐍' },
            'memory-bollywood': { title: 'Memory Bollywood', icon: '🎬' },
            'puzzle-rickshaw-rush': { title: 'Puzzle Rickshaw Rush', icon: '🧩' },
            'rangoli-tetris': { title: 'Rangoli Tetris', icon: '🌸' }
        };
        return games[gameId] || { title: 'Unknown Game', icon: '❓' };
    }

    restartCurrentGame() {
        if (this.currentGame) {
            document.getElementById('gameOverScreen').classList.add('hidden');
            const canvas = document.getElementById('canvas');
            this.gameInstance = this.createGameInstance(this.currentGame);
            this.gameInstance.init(canvas);
            document.getElementById('gameControls').classList.remove('hidden');
            document.getElementById('gameStartBtn').classList.remove('hidden');
            document.getElementById('gamePauseBtn').classList.add('hidden');
            document.getElementById('gameResumeBtn').classList.add('hidden');
            document.getElementById('gameScore').textContent = 'Score: 0';
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
        if (!this.highScores[gameId] || score > this.highScores[gameId]) {
            this.highScores[gameId] = score;
            this.saveHighScores();
        }
    }

    showHighScores() {
        const container = document.getElementById('highScoresList');
        container.innerHTML = '';
        
        Object.keys(this.highScores).forEach(gameId => {
            const gameData = this.getGameData(gameId);
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `
                <span class="score-game">${gameData.icon} ${gameData.title}</span>
                <span class="score-value">${this.highScores[gameId]}</span>
            `;
            container.appendChild(scoreItem);
        });
        
        if (Object.keys(this.highScores).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No high scores yet! Play some games to set records.</p>';
        }
    }

    saveSettings() {
        localStorage.setItem('retro-pocket-settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('retro-pocket-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        // Apply settings to UI
        setTimeout(() => {
            document.getElementById('musicVolume').value = this.settings.musicVolume;
            document.getElementById('sfxVolume').value = this.settings.sfxVolume;
            document.getElementById('graphicsQuality').value = this.settings.graphicsQuality;
        }, 100);
    }

    saveHighScores() {
        localStorage.setItem('retro-pocket-scores', JSON.stringify(this.highScores));
    }

    loadHighScores() {
        const saved = localStorage.getItem('retro-pocket-scores');
        if (saved) {
            this.highScores = JSON.parse(saved);
        }
    }
}

// Simple game template for remaining games
class SimpleGameTemplate extends GameEngine {
    constructor(gameId) {
        super();
        this.gameId = gameId;
        this.message = this.getGameMessage(gameId);
        this.autoScore = 0;
    }

    getGameMessage(gameId) {
        const messages = {
            'subway-sprinter': 'Run through the station!\nUse arrow keys to dodge obstacles.',
            'rooftop-cricket': 'Hit the ball across rooftops!\nClick to swing the bat.',
            'racing-rickshaw': 'Race through Indian streets!\nArrow keys to steer.',
            'ludo-blitz': 'Fast-paced Ludo!\nClick to roll dice and move.',
            'puzzle-rickshaw-rush': 'Pick up passengers!\nNavigate city streets efficiently.'
        };
        return messages[gameId] || 'Game coming soon!\nEnjoy this demo version.';
    }

    update(deltaTime) {
        // Simple auto-incrementing score
        this.autoScore += deltaTime * 0.01;
        if (this.autoScore >= 1) {
            this.updateScore(Math.floor(this.autoScore));
            this.autoScore = 0;
        }
        
        // Auto end after 30 seconds for demo
        if (this.lastTime > 30000) {
            this.gameOver();
        }
    }

    render() {
        super.render();
        
        // Draw background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#FF9500');
        gradient.addColorStop(0.5, '#00CED1');
        gradient.addColorStop(1, '#FF1493');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game message
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        const lines = this.message.split('\n');
        lines.forEach((line, index) => {
            this.ctx.fillText(line, this.canvas.width/2, this.canvas.height/2 + (index - lines.length/2) * 40);
        });
        
        // Draw animated elements
        const time = this.lastTime * 0.005;
        for (let i = 0; i < 5; i++) {
            const x = (Math.sin(time + i) * 200) + this.canvas.width/2;
            const y = (Math.cos(time + i * 0.7) * 100) + this.canvas.height/2;
            this.ctx.fillStyle = `hsl(${(time * 50 + i * 60) % 360}, 70%, 60%)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    bindEvents() {
        // Simple click anywhere to score
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.updateScore(10);
            }
        });
        
        // Simple key controls
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                this.updateScore(5);
            }
        });
    }
}

// Initialize the game
const gameManager = new GameManager();

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    gameManager.init();
});

// Handle modal clicks outside content
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});