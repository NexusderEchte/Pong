// ========== Klassen und Grundstruktur ==========

class Rechteck {
    constructor(x, y, breite, hoehe, farbe) {
        this.x = x;
        this.y = y;
        this.breite = breite;
        this.hoehe = hoehe;
        this.farbe = farbe;
    }

    // Zeichnet das Rechteck (Balken oder Ball) auf dem Canvas
    zeichnen(ctx) {
        ctx.fillStyle = this.farbe;
        ctx.fillRect(this.x, this.y, this.breite, this.hoehe);
    }
}

// ========== Spielfeld und Konstanten ==========

const spielfeld = {
    breite: 800,
    hoehe: 500
};

// ========== Spielobjekte ==========

const spieler1 = {
    breite: 12,
    hoehe: 120,
    x: 10,
    y: spielfeld.hoehe / 2 - 60,
    farbe: '#ffffff',
    score: 0,
    geschwindigkeit: 7
};

const spieler2 = {
    breite: 12,
    hoehe: 120,
    x: spielfeld.breite - 22,
    y: spielfeld.hoehe / 2 - 60,
    farbe: '#ffffff',
    score: 0,
    geschwindigkeit: 7
};

const ball = {
    x: spielfeld.breite / 2,
    y: spielfeld.hoehe / 2,
    radius: 8,
    farbe: '#ffffff',
    geschwindigkeit: 5,
    speedX: 5,
    speedY: 5
};

// ========== Tastatureingaben ==========

const taste = {};

window.addEventListener('keydown', (event) => {
    taste[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    taste[event.key] = false;
});

// ========== Hilfsfunktionen ==========

// Kollision zwischen zwei Rechtecken erkennen
function kollision(a, b) {
    const naehenRechts = a.x + a.breite > b.x;
    const naehenLinks = a.x < b.x + b.breite;
    const naehenOben = a.y < b.y + b.hoehe;
    const naehenUnten = a.y + a.hoehe > b.y;
    return naehenRechts && naehenLinks && naehenOben && naehenUnten;
}

// ========== Ball-Logik ==========

function ballZurücksetzen() {
    ball.x = spielfeld.breite / 2;
    ball.y = spielfeld.hoehe / 2;
    ball.geschwindigkeit = 5;
    ball.speedX = -ball.speedX;
    ball.speedY = 5;
}

function ballBewegen() {
    ball.x += ball.speedX * ball.geschwindigkeit;
    ball.y += ball.speedY * ball.geschwindigkeit;
}

// ========== Kollisionen prüfen ==========

function kollisionenPrüfen() {
    // Obere und untere Spielfeldgrenzen
    if (ball.y + ball.radius > spielfeld.hoehe || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }

    // Ball als Rechteck für Kollision
    const spielerBall = { x: ball.x, y: ball.y, breite: ball.radius * 2, hoehe: ball.radius * 2 };

    // Ball trifft auf Spieler2 (rechts)
    const spieler2Rect = { x: spieler2.x, y: spieler2.y, breite: spieler2.breite, hoehe: spieler2.hoehe };
    if (kollision(spielerBall, spieler2Rect)) {
        ball.x = spieler2.x - ball.radius * 2;
        ball.speedX = -ball.speedX;
        ball.geschwindigkeit *= 1.05;
    }

    // Ball trifft auf Spieler1 (links)
    const spieler1Rect = { x: spieler1.x, y: spieler1.y, breite: spieler1.breite, hoehe: spieler1.hoehe };
    if (kollision(spielerBall, spieler1Rect)) {
        ball.x = spieler1.x + spieler1.breite + ball.radius * 2;
        ball.speedX = -ball.speedX;
        ball.geschwindigkeit *= 1.05;
    }
}

// ========== Punkte prüfen ==========

function punktePrüfen() {
    // Ball ging links aus -> Spieler 2 bekommt Punkt
    if (ball.x + ball.radius < 0) {
        spieler2.score++;
        ballZurücksetzen();
    }
    // Ball ging rechts aus -> Spieler 1 bekommt Punkt
    else if (ball.x - ball.radius > spielfeld.breite) {
        spieler1.score++;
        ballZurücksetzen();
    }
}

// ========== Spielerbewegung ==========

function spielerBewegen() {
    // Spieler 1: W / S-Tasten (gedrückt gehalten)
    if (taste['w'] || taste['W']) {
        spieler1.y -= spieler1.geschwindigkeit;
    }
    if (taste['s'] || taste['S']) {
        spieler1.y += spieler1.geschwindigkeit;
    }

    // Spieler 2: Pfeiltasten hoch / runter (gedrückt gehalten)
    if (taste['ArrowUp']) {
        spieler2.y -= spieler2.geschwindigkeit;
    }
    if (taste['ArrowDown']) {
        spieler2.y += spieler2.geschwindigkeit;
    }

    // Balken dürfen das Spielfeld nicht nach oben / unten verlassen
    spieler1.y = Math.max(0, Math.min(spielfeld.hoehe - spieler1.hoehe, spieler1.y));
    spieler2.y = Math.max(0, Math.min(spielfeld.hoehe - spieler2.hoehe, spieler2.y));
}

// ========== Rendern ==========

function spielfeldZeichnen(ctx) {
    // Dunkler Hintergrund
    const hintergrund = new Rechteck(0, 0, spielfeld.breite, spielfeld.hoehe, '#1a1a1a');
    hintergrund.zeichnen(ctx);

    // Mittellinie
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(spielfeld.breite / 2 - 2, 0, 4, spielfeld.hoehe);
}

function rendern() {
    // Hintergrund und Mittellinie
    spielfeldZeichnen(ctx);

    // Spielerbalken zeichnen
    const p1 = new Rechteck(spieler1.x, spieler1.y, spieler1.breite, spieler1.hoehe, spieler1.farbe);
    const p2 = new Rechteck(spieler2.x, spieler2.y, spieler2.breite, spieler2.hoehe, spieler2.farbe);
    p1.zeichnen(ctx);
    p2.zeichnen(ctx);

    // Ball zeichnen
    ctx.fillStyle = ball.farbe;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fill();

    // Punktestand aktualisieren
    document.getElementById('score-p1').textContent = spieler1.score;
    document.getElementById('score-p2').textContent = spieler2.score;
}

// ========== Spiele-Setup ==========

const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');

// Pixelige Optik für Retro-Look
ctx.imageSmoothingEnabled = false;

// ========== Haupt-Spielschleife ==========

let spielLäuft = false;

function spielSchleife() {
    if (!spielLäuft) return;

    // Eingaben verarbeiten, Ball bewegen und Kollisionen prüfen
    spielerBewegen();
    ballBewegen();
    kollisionenPrüfen();
    punktePrüfen();

    // Alles zeichnen
    rendern();

    requestAnimationFrame(spielSchleife);
}

// ========== Spiel starten ==========

function starteSpiel() {
    startScreen.style.display = 'none';
    spielLäuft = true;
    ball.speedX = 5;
    ball.geschwindigkeit = 5;
    requestAnimationFrame(spielSchleife);
}

// Klick auf Startbildschirm startet das Spiel
startScreen.addEventListener('click', starteSpiel);

// Leertaste startet das Spiel, wenn es noch läuft
document.addEventListener('keydown', function(event) {
    if (!spielLäuft && event.code === 'Space') {
        event.preventDefault();
        starteSpiel();
    }
});
