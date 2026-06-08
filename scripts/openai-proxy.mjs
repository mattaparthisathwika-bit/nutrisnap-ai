/**
 * Local proxy for HuggingFace vision API (no CORS on web).
 * Run: npm run proxy  (keep this running alongside expo start --web)
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

loadEnv();

const HF_API_KEY = process.env.EXPO_PUBLIC_HF_API_KEY;
const PORT = Number(process.env.PROXY_PORT || 3001);
const HF_VISION_MODEL =
  process.env.EXPO_PUBLIC_HF_VISION_MODEL || "CohereLabs/aya-vision-32b";
const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_VISION_PROMPT =
  "What food dish is shown in this image? Answer with only the food name in 5 words or less.";

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function toImageDataUrl(base64Image) {
  return base64Image.startsWith("data:")
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;
}

function extractChatText(data) {
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

function formatHFError(status, body) {
  const message =
    typeof body?.error === "string"
      ? body.error
      : body?.error?.message || `HuggingFace error ${status}`;

  if (status === 403 && String(message).includes("sufficient permissions")) {
    return (
      "HuggingFace token lacks Inference permission. Create a new token at " +
      "huggingface.co/settings/tokens with 'Make calls to Inference Providers' enabled, " +
      "update .env, then restart npm start and npm run proxy."
    );
  }

  if (status === 400 && String(message).includes("not supported by provider")) {
    return (
      `Vision model "${HF_VISION_MODEL}" is not available. ` +
      "Set EXPO_PUBLIC_HF_VISION_MODEL=CohereLabs/aya-vision-32b in .env and restart."
    );
  }

  if (status === 400 && String(message).includes("not supported by any provider")) {
    return (
      "No vision provider enabled on your HuggingFace account. " +
      "Enable Cohere at huggingface.co/settings/inference-providers."
    );
  }

  if (status === 401) return "Invalid HuggingFace token. Check EXPO_PUBLIC_HF_API_KEY in .env.";
  if (status === 503) return "HuggingFace model is loading. Wait 30 seconds and try again.";
  return message;
}

function formatFetchError(error) {
  const cause = error?.cause?.code || error?.cause?.message || "";
  if (error.message === "fetch failed" || String(cause).includes("ENOTFOUND")) {
    return "Cannot reach HuggingFace API. Check your internet connection and restart npm run proxy.";
  }
  return error.message || "Proxy request failed.";
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "")) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(
      "NutriSnap HuggingFace proxy is running.\n\n" +
        "Open the Expo app at http://localhost:8081 (not this port).\n" +
        `Vision model: ${HF_VISION_MODEL}\n` +
        "This server handles POST /analyze for food photos."
    );
    return;
  }

  if (req.method !== "POST" || req.url !== "/analyze") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use POST /analyze" }));
    return;
  }

  if (!HF_API_KEY || HF_API_KEY.includes("your_")) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Set EXPO_PUBLIC_HF_API_KEY in .env" }));
    return;
  }

  try {
    const raw = await readBody(req);
    const { base64Image } = JSON.parse(raw);

    if (!base64Image) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing base64Image" }));
      return;
    }

    let upstream;
    try {
      upstream = await fetch(HF_CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: HF_VISION_MODEL,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: HF_VISION_PROMPT },
                { type: "image_url", image_url: { url: toImageDataUrl(base64Image) } },
              ],
            },
          ],
          max_tokens: 32,
        }),
      });
    } catch (fetchError) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: formatFetchError(fetchError) }));
      return;
    }

    let data;
    try {
      data = await upstream.json();
    } catch {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "HuggingFace returned a non-JSON response." }));
      return;
    }

    if (!upstream.ok) {
      res.writeHead(upstream.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: formatHFError(upstream.status, data) }));
      return;
    }

    const text = extractChatText(data);
    if (!text) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No food description returned from HuggingFace." }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ text }));
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message || "Proxy failed" }));
  }
});

server.listen(PORT, () => {
  console.log(`NutriSnap HuggingFace proxy at http://localhost:${PORT}`);
  console.log(`Vision model: ${HF_VISION_MODEL}`);
  console.log("Keep this open while using food analysis in the browser.");
});
