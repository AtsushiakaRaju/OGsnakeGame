const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// Game constants
const gridSize = 20;
const canvasSize = 400;
const tileCount = canvasSize / gridSize;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0; // direction x
let dy = 0; // direction y
let score = 0;
let isGameOver = false;
let gameLoopInterval;

// --- Game Logic ---

function gameLoop() {
    if (isGameOver) {
        clearInterval(gameLoopInterval);
        showGameOver();
        return;
    }

    clearCanvas();
    moveSnake();
    checkCollision();
    if (isGameOver) return; // Stop drawing if collision happened

    drawFood();
    drawSnake();
}

function startGame() {
    // Reset state
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    isGameOver = false;
    updateScore();
    generateFood();
    
    gameOverModal.style.display = 'none';

    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 200); // Speed of the game
}

function clearCanvas() {
    ctx.fillStyle = '#8bac0f'; // Nokia screen green
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#3b82f6'; // Blue color for snake
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });
}

function moveSnake() {
    if (dx === 0 && dy === 0) return; // Don't move if not started

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    // Ensure food doesn't spawn on the snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function drawFood() {
    ctx.fillStyle = '#ef4444'; // Red color for food
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize -1, gridSize -1);
}

function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        isGameOver = true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            isGameOver = true;
            break;
        }
    }
}

function updateScore() {
    scoreElement.textContent = score;
}

function showGameOver() {
    finalScoreElement.textContent = score;
    gameOverModal.style.display = 'flex';
}

// --- Event Listeners ---

function handleKeyPress(e) {
    const keyPressed = e.key;
    
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if ((keyPressed === 'ArrowLeft' || keyPressed.toLowerCase() === 'a') && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if ((keyPressed === 'ArrowUp' || keyPressed.toLowerCase() === 'w') && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if ((keyPressed === 'ArrowRight' || keyPressed.toLowerCase() === 'd') && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if ((keyPressed === 'ArrowDown' || keyPressed.toLowerCase() === 's') && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

document.addEventListener('keydown', handleKeyPress);

// On-screen controls
document.getElementById('up-btn').addEventListener('click', () => { if(dy !== 1) { dx = 0; dy = -1; } });
document.getElementById('down-btn').addEventListener('click', () => { if(dy !== -1) { dx = 0; dy = 1; } });
document.getElementById('left-btn').addEventListener('click', () => { if(dx !== 1) { dx = -1; dy = 0; } });
document.getElementById('right-btn').addEventListener('click', () => { if(dx !== -1) { dx = 1; dy = 0; } });

restartButton.addEventListener('click', startGame);

// --- Initial Load ---
window.onload = () => {
     startGame();
}