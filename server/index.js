import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";

// Minimal .env loader; real environment variables win.
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const { generateImage, generateVideo, pikaConfigured } = await import("./pika.js");
const { writeScreenplay, breakDown, writerConfigured } = await import("./writer.js");

const PROJECT_FILE = "data/project.json";

const json = (res, code, body) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || "{}");
}

const routes = {
  "GET /api/status": async () => ({ writer: writerConfigured(), pika: pikaConfigured() }),
  "GET /api/project": async () =>
    existsSync(PROJECT_FILE) ? JSON.parse(await readFile(PROJECT_FILE, "utf8")) : {},
  "PUT /api/project": async (body) => {
    await mkdir("data", { recursive: true });
    await writeFile(PROJECT_FILE, JSON.stringify(body, null, 2));
    return { ok: true };
  },
  "POST /api/screenplay": async ({ idea, scenes }) => {
    if (!idea) throw Object.assign(new Error("idea required"), { status: 400 });
    return writeScreenplay({ idea, scenes });
  },
  "POST /api/breakdown": async ({ screenplay }) => {
    if (!screenplay) throw Object.assign(new Error("screenplay required"), { status: 400 });
    return breakDown({ screenplay });
  },
  "POST /api/image": async ({ prompt }) => {
    if (!prompt) throw Object.assign(new Error("prompt required"), { status: 400 });
    return generateImage({ prompt });
  },
  "POST /api/video": async ({ prompt, imageUrl }) => {
    if (!prompt) throw Object.assign(new Error("prompt required"), { status: 400 });
    return generateVideo({ prompt, imageUrl });
  },
};

http
  .createServer(async (req, res) => {
    try {
      const route = routes[`${req.method} ${req.url}`];
      if (route) {
        const body = req.method === "GET" ? {} : await readBody(req);
        return json(res, 200, await route(body));
      }
      if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        res.writeHead(200, { "content-type": "text/html" });
        return res.end(await readFile("public/index.html"));
      }
      json(res, 404, { error: "not found" });
    } catch (e) {
      console.error(e);
      json(res, e.status || 500, { error: e.message });
    }
  })
  .listen(process.env.PORT || 3000, () =>
    console.log(`Storyboard Studio on http://localhost:${process.env.PORT || 3000}`),
  );
