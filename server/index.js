import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";

// Minimal .env loader; real environment variables win.
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const { generateImage, generateVideo } = await import("./pika.js");
const { writeScreenplay, breakDown } = await import("./writer.js");

// Visitors send their own keys on each request (x-anthropic-key / x-pika-key).
// The server only uses them for that request: never stored, never logged.
// The server's own keys are a fallback ONLY when ALLOW_SERVER_KEYS=true, so a
// public deployment can't spend the owner's credits by default.
const serverKeysAllowed = process.env.ALLOW_SERVER_KEYS === "true";
const keyFor = (req, header, envName) =>
  req.headers[header]?.trim() || (serverKeysAllowed ? process.env[envName] : undefined);

const MAX_BODY = 1_000_000;

const json = (res, code, body) => {
  res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw Object.assign(new Error("request too large"), { status: 413 });
  }
  return JSON.parse(raw || "{}");
}

const required = (value, name) => {
  if (!value) throw Object.assign(new Error(`${name} required`), { status: 400 });
};

const routes = {
  "GET /api/status": async () => ({
    serverKeys: {
      anthropic: serverKeysAllowed && Boolean(process.env.ANTHROPIC_API_KEY),
      pika: serverKeysAllowed && Boolean(process.env.PIKA_API_KEY),
    },
  }),
  "POST /api/screenplay": async (body, req) => {
    required(body.idea, "idea");
    return writeScreenplay(keyFor(req, "x-anthropic-key", "ANTHROPIC_API_KEY"), body);
  },
  "POST /api/breakdown": async (body, req) => {
    required(body.screenplay, "screenplay");
    return breakDown(keyFor(req, "x-anthropic-key", "ANTHROPIC_API_KEY"), body);
  },
  "POST /api/image": async (body, req) => {
    required(body.prompt, "prompt");
    return generateImage(keyFor(req, "x-pika-key", "PIKA_API_KEY"), body);
  },
  "POST /api/video": async (body, req) => {
    required(body.prompt, "prompt");
    return generateVideo(keyFor(req, "x-pika-key", "PIKA_API_KEY"), body);
  },
};

http
  .createServer(async (req, res) => {
    try {
      const route = routes[`${req.method} ${req.url}`];
      if (route) {
        const body = req.method === "GET" ? {} : await readBody(req);
        return json(res, 200, await route(body, req));
      }
      if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        res.writeHead(200, { "content-type": "text/html" });
        return res.end(await readFile("public/index.html"));
      }
      json(res, 404, { error: "not found" });
    } catch (e) {
      // Log the message only: never the request headers, which carry API keys.
      console.error(`${req.method} ${req.url}: ${e.message}`);
      json(res, e.status || 500, { error: e.message });
    }
  })
  .listen(process.env.PORT || 3000, () =>
    console.log(`Storyboard Studio on http://localhost:${process.env.PORT || 3000}`),
  );
