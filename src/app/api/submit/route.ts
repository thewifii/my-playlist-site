import { NextResponse } from "next/server";
import { addSubmission } from "@/lib/repo";
import type { Submission } from "@/lib/types";

const KINDS: Submission["kind"][] = ["brand-inquiry", "contact", "beat-inquiry", "newsletter", "merch-order"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public endpoint for site forms. Stores the submission for the dashboard inbox. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 20_000) return NextResponse.json({ error: "That message is too long." }, { status: 413 });

  let body: { kind?: string; name?: string; email?: string; payload?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const kind = KINDS.find((k) => k === body.kind);
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!kind) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (!EMAIL.test(email) || email.length > 200) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const payload = body.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? (body.payload as Record<string, unknown>) : {};
  await addSubmission({ kind, name: String(body.name ?? "").trim().slice(0, 200), email, payload });
  return NextResponse.json({ ok: true });
}
