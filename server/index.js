import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { generateImage, pikaConfigured } from "./pika.js";

// Minimal .env loader (no dependencies); real env vars win.
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const json = (res, code, body) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/status") {
      return json(res, 200, { pikaConfigured: pikaConfigured() });
    }
    if (req.method === "POST" && req.url === "/api/scenes/image") {
      let raw = "";
      for await (const c of req) raw += c;
      const { prompt } = JSON.parse(raw || "{}");
      if (!prompt) return json(res, 400, { error: "prompt required" });
      return json(res, 200, await generateImage({ prompt }));
    }
    const html = await readFile("public/index.html");
    res.writeHead(200, { "content-type": "text/html" });
    res.end(html);
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}).listen(process.env.PORT || 3000, () => console.log("Filmmaking app running"));
