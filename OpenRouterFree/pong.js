const readline = require("readline");

// Konfiguration
const BREITE = 50;
const HOEHE = 15;
const BALL_GESCHWINDIGKEIT_X = 1;
const BALL_GESCHWINDIGKEIT_Y = 1;

// Spielfeld: Array von Arrays (Leerzeichen = leer, '=' = Balken, 'O' = Ball, '.' = Wand)
let feld = [];

// Balkenpositionen (Y-Index)
let balkenLinks = Math.floor(HOEHE / 2);
let balkenRechts = Math.floor(HOEHE / 2);

// Ballposition und Richtung
let ballX = Math.floor(BREITE / 2);
let ballY = Math.floor(HOEHE / 2);
let ballDirX = BALL_GESCHWINDIGKEIT_X;
let ballDirY = BALL_GESCHWINDIGKEIT_Y;

// Punktestand
let punktLinks = 0;
let punktRechts = 0;

// Steuerung
let obenLinks = false;
let untenLinks = false;

// Initialisiere das Spielfeld mit richtiger Dimension
function feldInitialisieren() {
    feld = [];
    for (let y = 0; y < HOEHE; y++) {
        let zeile = [];
        for (let x = 0; x < BREITE; x++) {
            zeile.push(" ");
        }
        feld.push(zeile);
    }
    // Oben und unten als Wand markieren
    for (let x = 0; x < BREITE; x++) {
        feld[0][x] = "─";
        feld[HOEHE - 1][x] = "─";
    }
    // Mittige Linie
    for (let y = 1; y < HOEHE - 1; y++) {
        feld[y][Math.floor(BREITE / 2)] = "│";
    }
}

function balkenZeichnen() {
    // Linker Balken (3 Blöcke hoch)
    for (let dy = -1; dy <= 1; dy++) {
        let y = balkenLinks + dy;
        if (y >= 1 && y < HOEHE - 1) {
            feld[y][1] = "▓";
            feld[y][2] = "▓";
            feld[y][3] = "▓";
        }
    }
    // Rechter Balken (3 Blöcke hoch)
    for (let dy = -1; dy <= 1; dy++) {
        let y = balkenRechts + dy;
        if (y >= 1 && y < HOEHE - 1) {
            feld[y][BREITE - 2] = "▓";
            feld[y][BREITE - 3] = "▓";
            feld[y][BREITE - 4] = "▓";
        }
    }
}

function ballZeichnen() {
    if (ballY >= 0 && ballY < HOEHE && ballX >= 0 && ballX < BREITE) {
        feld[ballY][ballX] = "O";
    }
}

function feldAufbauen() {
    // Alles zurücksetzen
    for (let y = 0; y < HOEHE; y++) {
        for (let x = 0; x < BREITE; x++) {
            if (y === 0 || y === HOEHE - 1) {
                feld[y][x] = "─";
            } else if (x === Math.floor(BREITE / 2)) {
                feld[y][x] = "│";
            } else {
                feld[y][x] = " ";
            }
        }
    }
    balkenZeichnen();
    ballZeichnen();
}

function punktestandAnzeigen() {
    console.log(`\n┏━ Spieler: LINKS ${punktLinks} : ${punktRechts} RECHT ━┓`);
}

function ballBewegen() {
    // Alte Position wird beim nächsten Aufbau überschrieben, also einfach bewegen
    ballX += ballDirX;
    ballY += ballDirY;

    // Abprallen oben/unten an Wand
    if (ballY <= 1 || ballY >= HOEHE - 2) {
        ballDirY *= -1;
        // Korrigiere Position falls außerhalb
        if (ballY <= 1) ballY = 2;
        if (ballY >= HOEHE - 2) ballY = HOEHE - 3;
    }

    // Balken Links: Balken nimmt die Y-Position ein (3 Balkenblöcke)
    let yBalkenLinksOben = balkenLinks - 1;
    let yBalkenLinksUnten = balkenLinks + 1;
    if (ballX === 3 && ballY >= yBalkenLinksOben && ballY <= yBalkenLinksUnten) {
        ballDirX *= -1;
        ballX += ballDirX * 2;
    }

    // Balken Rechts
    let yBalkenRechtsOben = balkenRechts - 1;
    let yBalkenRechtsUnten = balkenRechts + 1;
    if (ballX === BREITE - 4 && ballY >= yBalkenRechtsOben && ballY <= yBalkenRechtsUnten) {
        ballDirX *= -1;
        ballX += ballDirX * 2;
    }

    // Ball aus dem Spielfeld (Punkt für anderen Spieler)
    if (ballX < 0) {
        punktRechts++;
        punktZuruecksetzen();
    } else if (ballX >= BREITE) {
        punktLinks++;
        punktZuruecksetzen();
    }
}

function punktZuruecksetzen() {
    punktestandAnzeigen();
    ballX = Math.floor(BREITE / 2);
    ballY = Math.floor(HOEHE / 2);
    ballDirX = -ballDirX;
    balkenLinks = Math.floor(HOEHE / 2);
    balkenRechts = Math.floor(HOEHE / 2);
    // Kurze Pause für Rückgabe (nicht nötig, da Schleife läuft)
}

function steuerung() {
    if (obenLinks && balkenLinks > 1) balkenLinks--;
    if (untenLinks && balkenLinks < HOEHE - 2) balkenLinks++;
}

function inputHandler(eingabe, key) {
    if (!key) return;

    // Linker Spieler: W / S
    if (key.name === "w" || key.name === "W") obenLinks = true;
    if (key.name === "s" || key.name === "S") untenLinks = true;

    // Rechter Spieler: Pfeil hoch / Pfeil runter
    if (key.name === "up") {
        if (balkenRechts > 1) balkenRechts--;
    }
    if (key.name === "down") {
        if (balkenRechts < HOEHE - 2) balkenRechts++;
    }

    // Beenden mit q oder Q
    if (key.name === "q" || key.name === "Q") {
        console.log("\nSpiel beendet. Danke fürs Spielen!");
        process.exit(0);
    }
}

function beendeEingabe(key) {
    if (key.name === "w" || key.name === "W") obenLinks = false;
    if (key.name === "s" || key.name === "S") untenLinks = false;
}

function spiel() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (data) => {
        // data ist ein Buffer, wir nehmen das erste Zeichen
        const ch = data.toString()[0];
        // Für Pfeiltasten brauchen wir keypress Event, hier nur Buchstaben
        if (ch === 'w' || ch === 'W') obenLinks = true;
        if (ch === 's' || ch === 'S') untenLinks = true;
        if (ch === 'q' || ch === 'Q') {
            console.log("\nSpiel beendet. Danke fürs Spielen!");
            process.exit(0);
        }
    });

    // Tastaturereignisse (für Pfeiltasten)
    process.stdin.on("keypress", (str, key) => {
        inputHandler(str, key);
    });

    process.stdin.on("keyrelease", (str, key) => {
        beendeEingabe(key);
    });

    feldInitialisieren();

    let letzteZeit = Date.now();
    let zeitenProSekunde = 12; // Game-Takt
    let zeitZwischen = 1000 / zeitenProSekunde;

    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║              P O N G   K O N S O L E             ║");
    console.log("║════════════════════════════════════════════════════");
    console.log("║ Steuerung:                                        ║");
    console.log("║   Links:  W (hoch) / S (runter)                   ║");
    console.log("║   Rechts: ↑ (hoch) / ↓ (runter)                   ║");
    console.log("║   Q zum Beenden                                   ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    function schleife() {
        let jetzt = Date.now();
        if (jetzt - letzteZeit >= zeitZwischen) {
            letzteZeit = jetzt;

            feldAufbauen();
            steuerung();
            ballBewegen();

            // Clear console (optional)
            // process.stdout.write('\x1b[2J\x1b[0f');

            punktestandAnzeigen();

            // Feld ausgeben (jeweils eine Zeile)
            for (let y = 0; y < HOEHE; y++) {
                console.log(feld[y].join(""));
            }
        }

        setImmediate(schleife);
    }

    schleife();
}

spiel();
