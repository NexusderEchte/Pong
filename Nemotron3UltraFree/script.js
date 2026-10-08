// Spielkonfiguration
const CONFIG = {
    canvasWidth: 800,
    canvasHeight: 500,
    paddleWidth: 15,
    paddleHeight: 100,
    ballSize: 12,
    paddleSpeed: 7,
    initialBallSpeed: 5,
    maxBallSpeed: 12,
    speedIncrease: 1.08
};

// Spielzustand
let canvas, ctx;
let paddle1, paddle2, ball;
let score1 = 0, score2 = 0;
let keys = {};
let gameRunning = false;
let animationId;

// Initialisierung
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Spieler 1 (links)
    paddle1 = {
        x: 20,
        y: (CONFIG.canvasHeight - CONFIG.paddleHeight) / 2,
        width: CONFIG.paddleWidth,
        height: CONFIG.paddleHeight,
        score: 0
    };

    // Spieler 2 (rechts)
    paddle2 = {
        x: CONFIG.canvasWidth - 20 - CONFIG.paddleWidth,
        y: (CONFIG.canvasHeight - CONFIG.paddleHeight) / 2,
        width: CONFIG.paddleWidth,
        height: CONFIG.paddleHeight,
        score: 0
    };

    // Ball
    resetBall();

    // Event Listener
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ' && !gameRunning) {
            startGame();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Erste Zeichnung
    draw();
}

// Ball zurücksetzen
function resetBall() {
    ball = {
        x: CONFIG.canvasWidth / 2,
        y: CONFIG.canvasHeight / 2,
        size: CONFIG.ballSize,
        speedX: CONFIG.initialBallSpeed * (Math.random() > 0.5 ? 1 : -1),
        speedY: CONFIG.initialBallSpeed * (Math.random() * 2 - 1),
        maxSpeed: CONFIG.maxBallSpeed
    };
}

// Spiel starten
function startGame() {
    gameRunning = true;
    document.getElementById('startMessage').classList.add('hidden');
    score1 = 0;
    score2 = 0;
    updateScoreDisplay();
    resetBall();
    gameLoop();
}

// Spiel-Schleife
function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Spiel-Logik aktualisieren
function update() {
    // Paddle 1 Bewegung (W/S)
    if (keys['w'] || keys['W']) {
        paddle1.y = Math.max(0, paddle1.y - CONFIG.paddleSpeed);
    }
    if (keys['s'] || keys['S']) {
        paddle1.y = Math.min(CONFIG.canvasHeight - paddle1.height, paddle1.y + CONFIG.paddleSpeed);
    }

    // Paddle 2 Bewegung (Pfeiltasten)
    if (keys['ArrowUp']) {
        paddle2.y = Math.max(0, paddle2.y - CONFIG.paddleSpeed);
    }
    if (keys['ArrowDown']) {
        paddle2.y = Math.min(CONFIG.canvasHeight - paddle2.height, paddle2.y + CONFIG.paddleSpeed);
    }

    // Ball bewegen
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Kollision mit oberer/unterer Wand
    if (ball.y - ball.size <= 0) {
        ball.y = ball.size;
        ball.speedY = Math.abs(ball.speedY);
    }
    if (ball.y + ball.size >= CONFIG.canvasHeight) {
        ball.y = CONFIG.canvasHeight - ball.size;
        ball.speedY = -Math.abs(ball.speedY);
    }

    // Kollision mit Paddle 1 (links)
    if (ball.x - ball.size <= paddle1.x + paddle1.width &&
        ball.x - ball.size >= paddle1.x &&
        ball.y + ball.size >= paddle1.y &&
        ball.y - ball.size <= paddle1.y + paddle1.height) {

        ball.x = paddle1.x + paddle1.width + ball.size;
        ball.speedX = Math.abs(ball.speedX);

        // Winkel basierend auf Treffpunkt
        const hitPos = (ball.y - (paddle1.y + paddle1.height / 2)) / (paddle1.height / 2);
        ball.speedY = hitPos * ball.maxSpeed * 0.75;

        // Ball leicht beschleunigen
        increaseBallSpeed();
    }

    // Kollision mit Paddle 2 (rechts)
    if (ball.x + ball.size >= paddle2.x &&
        ball.x + ball.size <= paddle2.x + paddle2.width &&
        ball.y + ball.size >= paddle2.y &&
        ball.y - ball.size <= paddle2.y + paddle2.height) {

        ball.x = paddle2.x - ball.size;
        ball.speedX = -Math.abs(ball.speedX);

        // Winkel basierend auf Treffpunkt
        const hitPos = (ball.y - (paddle2.y + paddle2.height / 2)) / (paddle2.height / 2);
        ball.speedY = hitPos * ball.maxSpeed * 0.75;

        // Ball leicht beschleunigen
        increaseBallSpeed();
    }

    // Punkt für Spieler 2 (Ball links raus)
    if (ball.x < 0) {
        score2++;
        updateScoreDisplay();
        resetBall();
    }

    // Punkt für Spieler 1 (Ball rechts raus)
    if (ball.x > CONFIG.canvasWidth) {
        score1++;
        updateScoreDisplay();
        resetBall();
    }
}

// Ball-Geschwindigkeit erhöhen
function increaseBallSpeed() {
    const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
    if (speed < ball.maxSpeed) {
        ball.speedX *= CONFIG.speedIncrease;
        ball.speedY *= CONFIG.speedIncrease;
    }
}

// Punktestand aktualisieren
function updateScoreDisplay() {
    document.getElementById('score1').textContent = score1;
    document.getElementById('score2').textContent = score2;
}

// Zeichnen
function draw() {
    // Canvas leeren
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    // Mittellinie
    drawCenterLine();

    // Paddles
    drawPaddle(paddle1);
    drawPaddle(paddle2);

    // Ball
    drawBall();
}

// Mittellinie zeichnen
function drawCenterLine() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(CONFIG.canvasWidth / 2, 0);
    ctx.lineTo(CONFIG.canvasWidth / 2, CONFIG.canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Paddle zeichnen
function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Ball zeichnen
function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

// Start
init();