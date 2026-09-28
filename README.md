# Storyboard Studio

A filmmaking app: write scenes, generate a frame for each with the Pika API.

- `public/index.html` – storyboard UI
- `server/index.js` – tiny Node server (no dependencies)
- `server/pika.js` – the only file that calls Pika; reads `PIKA_API_KEY` server-side

Run: `cp .env.example .env`, add your key, then `npm start` (http://localhost:3000).
Never commit `.env`.
