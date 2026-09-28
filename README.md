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

## Run it

```bash
npm install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY and PIKA_API_KEY
npm start              # http://localhost:3000
```

API keys are read only on the server; the browser never sees them. Never commit `.env`.
Your project is autosaved to `data/project.json` (git-ignored).
