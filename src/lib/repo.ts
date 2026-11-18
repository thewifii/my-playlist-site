// Content repository. Reads and writes Cloudflare D1 through the `DB` binding.
// If `DB` is not bound, or the schema has not been applied yet, it falls back
// automatically to an in-memory copy of the seed data so the whole site
// (including the dashboard) still works during local preview.
import type { D1Database } from "@cloudflare/workers-types";
import { cfEnv } from "./cf";
import { collections, isJsonField, type Collection } from "./collections.ts";
import { seed } from "./seed-data.ts";
import type { CollectionKey, CollectionTypes, Submission, User } from "./types.ts";
import { slugify } from "./utils";

type Row = Record<string, unknown>;

interface MemoryStore {
  content: Record<CollectionKey, Row[]>;
  users: User[];
  submissions: Submission[];
  settings: Record<string, string>;
}

const g = globalThis as unknown as { __wifiiStore?: MemoryStore; __wifiiD1?: { ok: boolean; at: number } };

function memory(): MemoryStore {
  if (!g.__wifiiStore) {
    g.__wifiiStore = {
      content: structuredClone(seed) as unknown as Record<CollectionKey, Row[]>,
      users: [],
      submissions: [],
      settings: {},
    };
  }
  return g.__wifiiStore;
}

/** Returns the D1 database when it is bound and the schema exists, otherwise null. */
async function d1(): Promise<D1Database | null> {
  const db = cfEnv().DB;
  if (!db) return null;
  const cached = g.__wifiiD1;
  // Re-check a failed probe every 15s so the site picks up the database right after `wrangler d1 execute`.
  if (cached && (cached.ok || Date.now() - cached.at < 15_000)) return cached.ok ? db : null;
  try {
    const probe = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'posts'").first();
    g.__wifiiD1 = { ok: Boolean(probe), at: Date.now() };
  } catch {
    g.__wifiiD1 = { ok: false, at: Date.now() };
  }
  return g.__wifiiD1.ok ? db : null;
}

export async function dataSource(): Promise<"d1" | "memory"> {
  return (await d1()) ? "d1" : "memory";
}

// ───────── row <-> object mapping ─────────

function decode(c: Collection, row: Row): Row {
  const out: Row = { id: row.id, created_at: row.created_at, updated_at: row.updated_at };
  for (const f of c.fields) {
    const v = row[f.name];
    if (isJsonField(f)) {
      if (Array.isArray(v)) out[f.name] = v;
      else {
        try {
          const parsed = JSON.parse(String(v ?? "[]"));
          out[f.name] = Array.isArray(parsed) ? parsed : [];
        } catch {
          out[f.name] = [];
        }
      }
    } else if (f.type === "boolean") out[f.name] = v === true || v === 1 || v === "1";
    else if (f.type === "number" || f.type === "flame") out[f.name] = v == null || v === "" ? null : Number(v);
    else out[f.name] = v == null ? "" : String(v);
  }
  return out;
}

/** Normalises untrusted input to the collection's fields. Unknown keys are dropped. */
function normalise(c: Collection, input: Row): Row {
  const out: Row = {};
  for (const f of c.fields) {
    const v = input[f.name];
    if (isJsonField(f)) {
      out[f.name] = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];
    } else if (f.type === "boolean") out[f.name] = v === true || v === 1 || v === "true";
    else if (f.type === "number" || f.type === "flame") {
      const n = v == null || v === "" ? null : Number(v);
      out[f.name] = n == null || Number.isNaN(n) ? null : f.type === "flame" ? Math.min(5, Math.max(0, Math.round(n * 10) / 10)) : n;
    } else if (f.type === "select") {
      const allowed = (f.options ?? []).map((o) => o.value);
      const s = v == null ? "" : String(v);
      out[f.name] = allowed.includes(s) ? s : f.required ? allowed[0] : "";
    } else out[f.name] = v == null ? "" : String(v);
  }
  return out;
}

function sortRows(c: Collection, rows: Row[]): Row[] {
  const { field, dir } = c.orderBy;
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[field] ?? "";
    const y = b[field] ?? "";
    if (typeof x === "number" && typeof y === "number") return (x - y) * sign;
    return String(x).localeCompare(String(y)) * sign;
  });
}

// ───────── content ─────────

export async function listAll<K extends CollectionKey>(key: K): Promise<CollectionTypes[K][]> {
  const c = collections[key];
  const db = await d1();
  let rows: Row[];
  if (db) {
    const res = await db.prepare(`SELECT * FROM ${c.table}`).all<Row>();
    rows = (res.results ?? []).map((r) => decode(c, r));
  } else {
    rows = memory().content[key].map((r) => decode(c, r));
  }
  return sortRows(c, rows) as unknown as CollectionTypes[K][];
}

export async function listPublished<K extends CollectionKey>(key: K): Promise<CollectionTypes[K][]> {
  return (await listAll(key)).filter((item) => item.status === "published");
}

export async function getById<K extends CollectionKey>(key: K, id: string): Promise<CollectionTypes[K] | null> {
  const c = collections[key];
  const db = await d1();
  if (db) {
    const row = await db.prepare(`SELECT * FROM ${c.table} WHERE id = ?`).bind(id).first<Row>();
    return row ? (decode(c, row) as unknown as CollectionTypes[K]) : null;
  }
  const row = memory().content[key].find((r) => r.id === id);
  return row ? (decode(c, row) as unknown as CollectionTypes[K]) : null;
}

export async function saveItem<K extends CollectionKey>(key: K, input: Row): Promise<CollectionTypes[K]> {
  const c = collections[key];
  const data = normalise(c, input);
  const now = new Date().toISOString();
  const existing = typeof input.id === "string" && input.id ? await getById(key, input.id) : null;

  for (const f of c.fields) {
    if (f.required && (data[f.name] == null || data[f.name] === "")) throw new Error(`${f.label} is required.`);
  }
  if ("slug" in data && !data.slug) data.slug = slugify(String(data[c.titleField] ?? ""));
  if ("published_at" in data && !data.published_at) data.published_at = now;

  const record: Row = {
    ...data,
    id: existing?.id ?? (typeof input.id === "string" && /^[a-z0-9-]{3,80}$/.test(input.id) ? input.id : crypto.randomUUID()),
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };

  const db = await d1();
  if (db) {
    const cols = ["id", ...c.fields.map((f) => f.name), "created_at", "updated_at"];
    const values = cols.map((col) => {
      const f = c.fields.find((x) => x.name === col);
      const v = record[col];
      if (f && isJsonField(f)) return JSON.stringify(v ?? []);
      if (f?.type === "boolean") return v ? 1 : 0;
      return v ?? null;
    });
    await db
      .prepare(`INSERT OR REPLACE INTO ${c.table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`)
      .bind(...values)
      .run();
  } else {
    const list = memory().content[key];
    const i = list.findIndex((r) => r.id === record.id);
    if (i >= 0) list[i] = record;
    else list.push(record);
  }
  return decode(c, record) as unknown as CollectionTypes[K];
}

export async function deleteItem(key: CollectionKey, id: string): Promise<void> {
  const c = collections[key];
  const db = await d1();
  if (db) await db.prepare(`DELETE FROM ${c.table} WHERE id = ?`).bind(id).run();
  else memory().content[key] = memory().content[key].filter((r) => r.id !== id);
}

// ───────── contributor accounts ─────────

export async function listUsers(): Promise<User[]> {
  const db = await d1();
  if (!db) return [...memory().users];
  const res = await db.prepare("SELECT * FROM users ORDER BY created_at ASC").all<User>();
  return res.results ?? [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const needle = email.trim().toLowerCase();
  const db = await d1();
  if (!db) return memory().users.find((u) => u.email === needle) ?? null;
  return (await db.prepare("SELECT * FROM users WHERE email = ?").bind(needle).first<User>()) ?? null;
}

export async function saveUser(user: User): Promise<void> {
  const record = { ...user, email: user.email.trim().toLowerCase() };
  const db = await d1();
  if (!db) {
    const users = memory().users.filter((u) => u.id !== record.id);
    users.push(record);
    memory().users = users;
    return;
  }
  await db
    .prepare("INSERT OR REPLACE INTO users (id, name, email, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(record.id, record.name, record.email, record.role, record.password_hash, record.created_at)
    .run();
}

export async function deleteUser(id: string): Promise<void> {
  const db = await d1();
  if (!db) memory().users = memory().users.filter((u) => u.id !== id);
  else await db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
}

// ───────── form submissions (brand inquiries, contact, newsletter…) ─────────

export async function addSubmission(input: Omit<Submission, "id" | "created_at">): Promise<Submission> {
  const record: Submission = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  const db = await d1();
  if (!db) memory().submissions.unshift(record);
  else {
    await db
      .prepare("INSERT INTO submissions (id, kind, name, email, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(record.id, record.kind, record.name, record.email, JSON.stringify(record.payload), record.created_at)
      .run();
  }
  return record;
}

export async function listSubmissions(): Promise<Submission[]> {
  const db = await d1();
  if (!db) return [...memory().submissions];
  const res = await db.prepare("SELECT * FROM submissions ORDER BY created_at DESC LIMIT 200").all<Row>();
  return (res.results ?? []).map((r) => {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(String(r.payload ?? "{}"));
    } catch {}
    return { ...(r as unknown as Submission), payload };
  });
}

// ───────── key/value settings (e.g. the Spotify refresh token) ─────────

export async function getSetting(key: string): Promise<string | null> {
  const db = await d1();
  if (!db) return memory().settings[key] ?? null;
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await d1();
  if (!db) memory().settings[key] = value;
  else await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(key, value).run();
}
