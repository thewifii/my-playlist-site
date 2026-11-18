import { NextResponse } from "next/server";
import { ADMIN_EMAIL_DEFAULT, requireSession } from "@/lib/auth";
import { envVar } from "@/lib/cf";
import { deleteUser, getUserByEmail, listUsers, saveUser } from "@/lib/repo";
import { hashPassword } from "@/lib/session";

// The users table key collides with the dynamic [collection] route on purpose:
// Next.js matches this static segment first, and "users" is not a content collection.

export async function GET() {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;
  const users = await listUsers();
  return NextResponse.json({ users: users.map(({ password_hash: _hash, ...u }) => u) });
}

/** Invite a contributor: the admin sets a starting password and shares it privately. */
export async function POST(request: Request) {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!name) return NextResponse.json({ error: "Enter the contributor's name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 10) return NextResponse.json({ error: "Use a password with at least 10 characters." }, { status: 400 });
  if (email === (envVar("ADMIN_EMAIL") || ADMIN_EMAIL_DEFAULT).toLowerCase()) return NextResponse.json({ error: "That email belongs to the admin account." }, { status: 400 });
  if (await getUserByEmail(email)) return NextResponse.json({ error: "A contributor with that email already exists." }, { status: 409 });

  await saveUser({ id: crypto.randomUUID(), name, email, role: "contributor", password_hash: await hashPassword(password), created_at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
