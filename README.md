# Skyjo Scorekeeper 🃏

A mobile-first scorekeeper for Kyle and Nicole's Skyjo games.

## Features

- 10-key score entry per round
- Auto-advances between players each round
- Running "X pts to 100" countdown in the round table
- Score totals shrink as rounds pile up to save space
- Tap any score to correct a typo
- Game auto-saves every round — pick up where you left off
- Dealer tracker — asks who dealt first, then alternates automatically
- Win announcement with confetti
- Color-coded history (green = Kyle won, orange = Nicole won)
- Dates recorded on all new games
- Full game history (41 pre-loaded from spreadsheet)
- Works offline as an installable PWA

## Hosting on GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Save — your app will be live at `https://yourusername.github.io/skyjo`

## Installing on your phone

**iPhone (Safari):**
1. Open the GitHub Pages URL in Safari
2. Tap the Share button → **Add to Home Screen**
3. Tap **Add** — it'll appear as a full-screen app

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap the three-dot menu → **Add to Home screen**

## Icons

The `icons/` folder needs two PNG files:
- `icon-192.png` — 192×192px app icon
- `icon-512.png` — 512×512px app icon

You can create a simple teal square with "SKY" text, or use any image you like.
A quick free option: [https://favicon.io](https://favicon.io)

## Files

| File | Purpose |
|------|---------|
| `index.html` | App structure and markup |
| `style.css` | All styles (Skyjo teal theme, Nunito + Righteous fonts) |
| `app.js` | All game logic, state, history |
| `manifest.json` | PWA manifest for installability |
| `sw.js` | Service worker for offline support |
| `icons/` | App icons (you supply these) |
