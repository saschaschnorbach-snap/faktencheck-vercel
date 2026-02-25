# FaktenCheck - Erkenne Manipulation

Ein interaktives Spiel zum Erkennen von Desinformation und Fake News. Inspiriert von [Harmony Square](https://harmonysquare.game) und [VoteGuard](https://misinfo-game2-0.vercel.app/).

## Features

- 🎮 **Social-Media-inspiriertes Gameplay** - Bewerte Posts wie in echten sozialen Medien
- 📊 **Gamification** - Follower, Network Vibe, Streaks und Badges
- 🎯 **4 Level** - Steigende Schwierigkeit
- 📰 **10+ Stories** - Echte vs. Fake News aus der Politik
- 🔧 **Admin-Interface** - Stories einfach verwalten
- 📱 **Responsive** - Funktioniert auf allen Geräten

## Schnellstart

### Option 1: Vercel Deploy (empfohlen)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/faktencheck)

1. Klicke auf "Deploy with Vercel"
2. Verbinde dein GitHub-Repository
3. Setze die Environment Variable `ADMIN_PASSWORD` auf ein sicheres Passwort
4. Fertig!

### Option 2: Lokal entwickeln

```bash
# Repository klonen
git clone <repository-url>
cd faktencheck-vercel

# Vercel CLI installieren (falls noch nicht installiert)
npm i -g vercel

# Lokal starten
vercel dev
```

Das Spiel ist dann unter `http://localhost:3000` verfügbar.

## Admin-Interface

Das Admin-Interface ist unter `/admin` erreichbar.

**Standard-Passwort:** `admin123`

⚠️ **Wichtig:** Ändere das Passwort vor dem Deployment über die Environment Variable `ADMIN_PASSWORD`.

### Stories verwalten

Im Admin-Interface kannst du:
- Neue Stories erstellen
- Bestehende Stories bearbeiten
- Stories aktivieren/deaktivieren
- Manipulationstricks hinzufügen

## Persistenz einrichten (Vercel KV)

Ohne Vercel KV werden Änderungen an Stories nicht persistiert. Um Stories dauerhaft zu speichern:

1. Gehe zu deinem Vercel-Projekt
2. Klicke auf "Storage" → "Create Database" → "KV"
3. Verbinde die KV-Datenbank mit deinem Projekt
4. Die Umgebungsvariablen werden automatisch gesetzt

[Vercel KV Dokumentation](https://vercel.com/docs/storage/vercel-kv)

## Projektstruktur

```
faktencheck-vercel/
├── index.html          # Hauptseite (Spiel)
├── style.css           # Styles
├── game.js             # Spiellogik
├── stories.js          # Default-Stories (Fallback)
├── admin/
│   └── index.html      # Admin-Interface
├── api/
│   ├── stories.js      # GET/POST Stories
│   ├── stories/
│   │   └── [id].js     # PUT/DELETE einzelne Story
│   └── admin/
│       └── stories.js  # Admin-Endpunkt (alle Stories)
├── vercel.json         # Vercel-Konfiguration
└── package.json
```

## API-Endpunkte

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| GET | `/api/stories` | Aktive Stories abrufen | Nein |
| POST | `/api/stories` | Neue Story erstellen | Ja |
| PUT | `/api/stories/:id` | Story aktualisieren | Ja |
| DELETE | `/api/stories/:id` | Story löschen | Ja |
| GET | `/api/admin/stories` | Alle Stories (inkl. inaktive) | Ja |

**Authentifizierung:** `Authorization: Bearer <ADMIN_PASSWORD>`

## Anpassung

### Neue Stories hinzufügen

Über das Admin-Interface oder direkt in `stories.js`:

```javascript
{
    id: 11,
    headline: "Deine Schlagzeile",
    source: "Quelle",
    content: "Der vollständige Text...",
    isTrue: false, // true = vertrauenswürdig, false = Fake
    explanation: "Erklärung warum...",
    tricks: ["Panikmache", "Emotionale Sprache"]
}
```

### Styling anpassen

Alle CSS-Variablen befinden sich am Anfang von `style.css`:

```css
:root {
    --primary: #7c3aed;
    --success: #10b981;
    --danger: #ef4444;
    /* ... */
}
```

## Lizenz

MIT License

## Credits

- Inspiriert von [Harmony Square](https://harmonysquare.game) (Cambridge University)
- Inspiriert von [VoteGuard](https://misinfo-game2-0.vercel.app/)
- Basierend auf der Inokulationstheorie gegen Desinformation
