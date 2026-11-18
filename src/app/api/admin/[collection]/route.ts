import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { isCollectionKey } from "@/lib/collections";
import { listAll, saveItem } from "@/lib/repo";

type Ctx = { params: Promise<{ collection: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { collection } = await params;
  if (!isCollectionKey(collection)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  return NextResponse.json({ items: await listAll(collection) });
}

/** Create or update. Send `id` to update an existing item. */
export async function POST(request: Request, { params }: Ctx) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { collection } = await params;
  if (!isCollectionKey(collection)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    return NextResponse.json({ item: await saveItem(collection, body) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Couldn't save." }, { status: 400 });
  }
}
