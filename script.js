const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverModal = document.getElementById('game-over-modal');
const startModal = document.getElementById('start-modal');
const finalScoreElement = document.getElementById('finalScore');
const pauseButton = document.getElementById('pauseButton');

// Game constants
const gridSize = 20;
const canvasSize = 400;
const tileCount = canvasSize / gridSize;

// Modes
const modes = {
    easy: { speed: 225, showGrid: true },
    medium: { speed: 175, showGrid: true },
    hard: { speed: 115, showGrid: false }
};

let currentMode = null;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let isGameOver = false;
let isPaused = false;
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
    if (isGameOver) return;

    drawFood();
    drawSnake();
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    isGameOver = false;
    isPaused = false;
    updateScore();
    generateFood();
    gameOverModal.style.display = 'none';
    startModal.style.display = 'none';
    pauseButton.textContent = "PAUSE";

    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, modes[currentMode].speed);
}

function clearCanvas() {
    // Background always black
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid only for Easy/Medium
    if (currentMode === "easy" || currentMode === "medium") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)"; // brighter white lines
        ctx.lineWidth = 1;

        for (let i = 0; i < tileCount; i++) {
            // Vertical
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();

            // Horizontal
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }
}



function drawSnake() {
    // Draw body
    ctx.fillStyle = '#3b82f6';
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#1d4ed8'; // darker blue head
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);

            // Add eyes
            ctx.fillStyle = 'white';
            let eyeSize = 4;
            let offset = 3;

            if (dx === 1) { // moving right
                ctx.fillRect(segment.x * gridSize + gridSize - eyeSize - offset, segment.y * gridSize + offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeSize - offset, segment.y * gridSize + gridSize - eyeSize - offset, eyeSize, eyeSize);
            } else if (dx === -1) { // moving left
                ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + gridSize - eyeSize - offset, eyeSize, eyeSize);
            } else if (dy === -1) { // moving up
                ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeSize - offset, segment.y * gridSize + offset, eyeSize, eyeSize);
            } else { // moving down
                ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + gridSize - eyeSize - offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeSize - offset, segment.y * gridSize + gridSize - eyeSize - offset, eyeSize, eyeSize);
            }

        } else {
            // Body
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        }
    });
}


function moveSnake() {
    if (dx === 0 && dy === 0) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

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

    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function drawFood() {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        isGameOver = true;
    }
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
        dx = -1; dy = 0;
    }
    if ((keyPressed === 'ArrowUp' || keyPressed.toLowerCase() === 'w') && !goingDown) {
        dx = 0; dy = -1;
    }
    if ((keyPressed === 'ArrowRight' || keyPressed.toLowerCase() === 'd') && !goingLeft) {
        dx = 1; dy = 0;
    }
    if ((keyPressed === 'ArrowDown' || keyPressed.toLowerCase() === 's') && !goingUp) {
        dx = 0; dy = 1;
    }
}

document.addEventListener('keydown', handleKeyPress);

// On-screen controls
document.getElementById('up-btn').addEventListener('click', () => { if (dy !== 1) { dx = 0; dy = -1; } });
document.getElementById('down-btn').addEventListener('click', () => { if (dy !== -1) { dx = 0; dy = 1; } });
document.getElementById('left-btn').addEventListener('click', () => { if (dx !== 1) { dx = -1; dy = 0; } });
document.getElementById('right-btn').addEventListener('click', () => { if (dx !== -1) { dx = 1; dy = 0; } });

// Pause/Resume
function togglePause() {
    if (!currentMode || isGameOver) return; // Can't pause before game start
    if (isPaused) {
        gameLoopInterval = setInterval(gameLoop, modes[currentMode].speed);
        pauseButton.textContent = "PAUSE";
    } else {
        clearInterval(gameLoopInterval);
        pauseButton.textContent = "RESUME";
    }
    isPaused = !isPaused;
}
pauseButton.addEventListener('click', togglePause);

// Mode select buttons (both Start & Game Over menus)
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentMode = btn.textContent.toLowerCase();
        startGame();
    });
});

// --- Initial Load ---
// Do not auto-start, just show start modal
