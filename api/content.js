import { timingSafeEqual } from "node:crypto";
import { list, put } from "@vercel/blob";
import { DEFAULT_DATA } from "../src/content-store.js";

const CONTENT_PATH = "portfolio/content.json";

function authorized(header = "") {
  const supplied = String(header).replace(/^Bearer\s+/i, "");
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!supplied || !expected) return false;
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function validContent(value) {
  return value && typeof value === "object" && value.about && Array.isArray(value.work) && Array.isArray(value.experience) && Array.isArray(value.projects);
}

async function readContent() {
  const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1 });
  if (!blobs.length) return DEFAULT_DATA;
  const response = await fetch(blobs[0].url, { cache: "no-store" });
  if (!response.ok) throw new Error("stored content could not be read");
  return response.json();
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");

  if (request.method === "GET") {
    try {
      return response.status(200).json(await readContent());
    } catch {
      return response.status(200).json(DEFAULT_DATA);
    }
  }

  if (request.method === "PUT") {
    if (!authorized(request.headers.authorization)) return response.status(401).json({ error: "incorrect admin password." });
    try {
      const content = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
      if (!validContent(content)) return response.status(400).json({ error: "invalid portfolio content." });
      await put(CONTENT_PATH, JSON.stringify(content), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
      return response.status(200).json(content);
    } catch {
      return response.status(500).json({ error: "the hosted content could not be saved." });
    }
  }

  response.setHeader("Allow", "GET, PUT");
  return response.status(405).json({ error: "method not allowed." });
}
