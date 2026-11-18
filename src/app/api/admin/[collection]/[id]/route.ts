import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { isCollectionKey } from "@/lib/collections";
import { deleteItem, getById } from "@/lib/repo";

type Ctx = { params: Promise<{ collection: string; id: string }> };

/** Deleting content is limited to the admin. Contributors can create, edit and unpublish. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;
  const { collection, id } = await params;
  if (!isCollectionKey(collection)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  if (!(await getById(collection, id))) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await deleteItem(collection, id);
  return NextResponse.json({ ok: true });
}
