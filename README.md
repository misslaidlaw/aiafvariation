# Storyboard Studio

A filmmaking app that walks one idea through the whole pipeline:

1. **Idea** – describe your film
2. **Screenplay** – Claude writes it scene by scene; you can edit every line
3. **Shot prompts** – each scene becomes 1–3 shots with image prompts
4. **Characters / 5. Locations / 6. Props** – reference sheets with their own image prompts, reused word for word in every shot so the look stays consistent
7. **Video** – each shot is animated from its keyframe image

| Step | Powered by | Server file |
|---|---|---|
| Screenplay, prompts, sheets | Claude (`claude-opus-5-5`) | `server/writer.js` |
| Images, video | Pika | `server/pika.js` (not wired yet – waiting on the Pika spec) |

## Run it on your own computer

1. Install **Node.js** (version 20 or newer) from https://nodejs.org – the "LTS" download.
2. Download this project: on GitHub click **Code → Download ZIP** and unzip it
   (or `git clone` it if you use git).
3. Open a terminal in the project folder and run:
   ```bash
   npm install
   npm start
   ```
4. Open http://localhost:3000 in your browser.
5. Click **🔑 API keys**, paste your Anthropic and Pika keys, and press Save.

To stop the app, press `Ctrl+C` in the terminal. Next time, just run `npm start` again.

## Bring your own keys

Every visitor enters their own keys in the **🔑 API keys** panel:

- Keys stay in that person's browser (forgotten when the tab closes, unless they tick
  "Remember on this device").
- They are sent to the app's server with each request and used only for that request –
  never saved or logged.
- Each person's storyboard is saved in their own browser. Use **Export project** to keep a
  copy or move it to another computer, and **Import project** to open it again.

If you'd rather put your own keys in a `.env` file (copy `.env.example`), set
`ALLOW_SERVER_KEYS=true` there. Never do that on a public server, or anyone who visits
could spend your credits. Never commit `.env`.
