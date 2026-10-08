# Pong - Browser Game

Ein klassisches Pong-Spiel implementiert mit HTML, CSS und Vanilla JavaScript.

## 📁 Projektstruktur

```
PongKi/
├── README.md                 # Diese Datei
└── Nemotron3UltraFree/       # Spiel-Verzeichnis
    ├── index.html            # Haupt-HTML-Datei
    ├── style.css             # Styling (Retro-Design)
    └── script.js             # Spiellogik
```

## 🚀 Installation & Start

### Voraussetzungen
- Node.js (für `http-server`) oder Python 3
- Moderner Browser (Chrome, Firefox, Edge, Safari)

### Variante 1: Mit Node.js (empfohlen)

```bash
# 1. Ins Projektverzeichnis wechseln
cd C:\Users\rober\Desktop\PongKi\Nemotron3UltraFree

# 2. http-server installieren (falls noch nicht global installiert)
npm install -g http-server
# oder einmalig ohne Installation:
npx http-server

# 3. Server starten
http-server

# 4. Im Browser öffnen
# http://localhost:8080
```

### Variante 2: Mit Python 3

```bash
# 1. Ins Projektverzeichnis wechseln
cd C:\Users\rober\Desktop\PongKi\Nemotron3UltraFree

# 2. Python HTTP Server starten
python -m http.server 8080

# 3. Im Browser öffnen
# http://localhost:8080
```

### Variante 3: Direkt im Browser (ohne Server)

Einfach `index.html` doppelklicken oder per Drag & Drop in den Browser ziehen.
> ⚠️ Hinweis: Bei manchen Browsern können CORS-Restriktionen auftreten. Ein lokaler Server (Variante 1/2) wird empfohlen.

## 🎮 Spielanleitung

### Ziel
Verhindere, dass der Ball an deiner Seite das Spielfeld verlässt. Der Gegner bekommt einen Punkt, wenn du den Ball verpasst.

### Steuerung

| Spieler | Position | Hoch | Runter |
|---------|----------|------|--------|
| Spieler 1 | Links | **W** | **S** |
| Spieler 2 | Rechts | **Pfeil ↑** | **Pfeil ↓** |

### Spielstart
1. Seite laden → Startmeldung "Drücke Leertaste zum Starten" erscheint
2. **Leertaste** drücken → Spiel beginnt
3. Nach jedem Punkt: Ball startet automatisch neu aus der Mitte

### Spielmechanik
- Ball prallt an oberer/unterer Wand ab
- Ball prallt an Paddles ab (Winkel hängt von Treffpunkt ab)
- Nach jedem Paddle-Treffer wird der Ball **leicht schneller** (max. 12)
- Nach Punktgewinn: Ball-Geschwindigkeit wird **zurückgesetzt**
- Paddles können das Spielfeld **nicht verlassen**

## ⚙️ Technische Details

- **Canvas-Größe:** 800 × 500 px
- **Paddle-Größe:** 15 × 100 px
- **Ball-Größe:** 12 px (Kreis)
- **Start-Geschwindigkeit:** 5 px/Frame
- **Max-Geschwindigkeit:** 12 px/Frame
- **Beschleunigung pro Treffer:** ×1.08

## 🎨 Design

- Dunkler Hintergrund (`#1a1a1a` / `#000`)
- Weiße Elemente (`#fff`)
- Retro-Monospace-Schrift (`Courier New`)
- Zentrierte Darstellung, keine Scrollbars
- Blinkender Doppelpunkt im Score
- Pulsierende Startmeldung

## 🛠️ Entwicklung

### Dateien bearbeiten
- `index.html` – Struktur, Canvas, UI-Elemente
- `style.css` – Aussehen, Animationen, Layout
- `script.js` – Spiellogik, Physik, Input-Handling

### Konfiguration anpassen (in `script.js`)
```javascript
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
```

## 📋 Checkliste für Abnahme

- [ ] `http-server` startet ohne Fehler
- [ ] Spiel lädt unter `http://localhost:8080`
- [ ] Startmeldung sichtbar
- [ ] Leertaste startet Spiel
- [ ] Spieler 1: W/S funktioniert (gehalten)
- [ ] Spieler 2: Pfeiltasten funktionieren (gehalten)
- [ ] Ball prallt an Wänden ab
- [ ] Ball prallt an Paddles ab (inkl. Winkel)
- [ ] Ball wird nach Treffern schneller
- [ ] Punkte werden gezählt & angezeigt
- [ ] Ball reset nach Punkt (Normalspeed)
- [ ] Paddles verlassen Spielfeld nicht
- [ ] Kein Flackern, keine Scrollbars
- [ ] Ball hängt nicht im Paddle fest

## 🐛 Bekannte Limitierungen

- Keine KI / Einzelspielermodus
- Keine Pause-Funktion
- Keine Sound-Effekte
- Keine mobilen Touch-Controls

## 📄 Lizenz

Frei für private und Bildungszwecke.