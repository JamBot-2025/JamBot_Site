// api/github/webhook.ts
import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const SECRET = process.env.GH_WEBHOOK_SECRET!;

// Read RAW request body bytes (don’t JSON.parse before verifying)
async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function timingSafeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const signature = (req.headers["x-hub-signature-256"] as string) ?? "";
  const raw = await readRawBody(req);

  const expected = "sha256=" + crypto.createHmac("sha256", SECRET).update(raw).digest("hex");
  if (!signature || !timingSafeEqual(expected, signature)) {
    return res.status(401).send("invalid signature");
  }

  // ✅ ACK fast so GitHub marks the delivery successful
  res.status(204).end();

  // Do work asynchronously (queue/job):
  // const event = JSON.parse(raw.toString("utf8"));
  // console.log("Got event:", req.headers["x-github-event"], event.action);
}
