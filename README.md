# Weather Alert Bot

Get Telegram alerts when rain, storms, high winds, or extreme temperatures are forecast — no server needed, runs entirely in your browser.

**[Live Demo on GitHub Pages](https://elesiaann.github.io/weather-alert-bot/)**

## Features

- **Real-time weather** via OpenWeatherMap (current conditions + 5-day forecast)
- **Telegram alerts** sent directly from your browser via the Bot API
- **Configurable thresholds** — rain probability %, wind speed, min/max temperature
- **Alert types** — Rain/Snow, High Winds, Freezing temps, Extreme heat, Severe weather (storms, tornadoes, fog, etc.)
- **Auto-check schedule** — every 30 min / 1 h / 3 h / 6 h with live countdown
- **GPS location** — use your browser's geolocation instead of typing a city
- **Alert history log** — persisted to localStorage, shows last 100 events
- **Dark / Light theme** toggle
- **All keys stored locally** — your API key and Telegram token never leave your browser
- Zero build step — pure HTML / CSS / JavaScript

## Quick Setup

### 1. Get an OpenWeatherMap API key
Sign up at [openweathermap.org](https://openweathermap.org/api) → **Free** tier is enough (1,000 calls/day).

### 2. Create a Telegram Bot
1. Open Telegram and message **[@BotFather](https://t.me/BotFather)**
2. Send `/newbot` and follow the prompts
3. Copy the **Bot Token** (looks like `123456789:ABC-DEF…`)

### 3. Get your Chat ID
1. Start your new bot (send it any message)
2. Open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser
3. Find `result[0].message.chat.id` in the JSON response

### 4. Configure the app
Open the live site, paste in your API key, Bot Token, Chat ID, and city name, then click **Save Settings** → **Check Now**.

## Deployment

### GitHub Pages
Pushes to `main` deploy automatically via the included GitHub Actions workflow.
Enable Pages in: **Settings → Pages → Source: GitHub Actions**

### Vercel
```bash
vercel --prod
```
A `vercel.json` is included with security headers configured.

## Local Development

No build step needed — just open `index.html` in a browser.

```bash
git clone https://github.com/elesiaann/weather-alert-bot
cd weather-alert-bot
open index.html   # macOS
start index.html  # Windows
```

## Tech Stack

| Layer | Tool |
|---|---|
| Weather data | OpenWeatherMap REST API (free tier) |
| Messaging | Telegram Bot API (`/sendMessage`) |
| Frontend | Vanilla HTML / CSS / JavaScript (ES2020) |
| Hosting | GitHub Pages (Actions) or Vercel |
| Storage | `localStorage` (all data stays in your browser) |
