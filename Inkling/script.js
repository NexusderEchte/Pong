// Pong - Vanilla JavaScript
// Steuerung: W/S (Spieler 1), Pfeil hoch/runter (Spieler 2)

const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Spielfeld-Maße
const W = canvas.width;
const H = canvas.height;

// Spielzustand
let running = false;
let scores = { left: 0, right: 0 };

// Spieler-Balken
const paddleW = 15;
const paddleH = 100;
const paddleSpeed = 6;

let paddles = {
  left: { x: 30, y: H / 2 - paddleH / 2 },
  right: { x: W - 30 - paddleW, y: H / 2 - paddleH / 2 }
};

// Ball
let ball = {
  x: W / 2,
  y: H / 2,
  r: 10,
  dx: 5,
  dy: 3,
  speed: 5
};

// Eingabe
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  // Starten mit Leertaste
  if (e.key === ' ' && !running) {
    startGame();
  }
});
window.addEventListener('keyup', (e) => keys[e.key] = false);

function startGame() {
  running = true;
  document.getElementById('overlay').style.display = 'none';
  resetBall();
}

function resetBall() {
  ball.x = W / 2;
  ball.y = H / 2;
  ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * 3;
  ball.speed = 5;
}

function update() {
  if (!running) return;

  // Steuerung
  if (keys['w'] || keys['W']) {
    paddles.left.y -= paddleSpeed;
  }
  if (keys['s'] || keys['S']) {
    paddles.left.y += paddleSpeed;
  }
  if (keys['ArrowUp']) {
    paddles.right.y -= paddleSpeed;
  }
  if (keys['ArrowDown']) {
    paddles.right.y += paddleSpeed;
  }

  // Balken nicht über Rand
  paddles.left.y = Math.max(0, Math.min(H - paddleH, paddles.left.y));
  paddles.right.y = Math.max(0, Math.min(H - paddleH, paddles.right.y));

  // Ball bewegen
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Oben/Unten abprallen
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.dy = -ball.dy;
  }
  if (ball.y + ball.r > H) {
    ball.y = H - ball.r;
    ball.dy = -ball.dy;
  }

  // Kollisionsprüfung Balken
  // Linker Balken
  if (
    ball.x - ball.r <= paddles.left.x + paddleW &&
    ball.x + ball.r >= paddles.left.x &&
    ball.y >= paddles.left.y &&
    ball.y <= paddles.left.y + paddleH &&
    ball.dx < 0
  ) {
    ball.dx = -ball.dx * 1.1; // leicht schneller
    ball.dy += (Math.random() - 0.5) * 4; // leicht variieren
    ball.x = paddles.left.x + paddleW + ball.r;
  }

  // Rechter Balken
  if (
    ball.x + ball.r >= paddles.right.x &&
    ball.x - ball.r <= paddles.right.x + paddleW &&
    ball.y >= paddles.right.y &&
    ball.y <= paddles.right.y + paddleH &&
    ball.dx > 0
  ) {
    ball.dx = -ball.dx * 1.1;
    ball.dy += (Math.random() - 0.5) * 4;
    ball.x = paddles.right.x - ball.r;
  }

  // Punkte
  if (ball.x < 0) {
    scores.right++;
    updateScore();
    resetBall();
  }
  if (ball.x > W) {
    scores.left++;
    updateScore();
    resetBall();
  }
}

function updateScore() {
  document.getElementById('score-left').textContent = scores.left;
  document.getElementById('score-right').textContent = scores.right;
}

function draw() {
  // Hintergrund leeren
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Mittellinie gestrichelt
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Balken
  ctx.fillStyle = '#fff';
  ctx.fillRect(paddles.left.x, paddles.left.y, paddleW, paddleH);
  ctx.fillRect(paddles.right.x, paddles.right.y, paddleW, paddleH);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Starten
updateScore();
loop();
