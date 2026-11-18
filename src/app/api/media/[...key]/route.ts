import { cfEnv } from "@/lib/cf";

type Ctx = { params: Promise<{ key: string[] }> };

/** Public, read-only access to files uploaded to R2. Supports Range requests so audio and video can seek. */
export async function GET(request: Request, { params }: Ctx) {
  const bucket = cfEnv().BUCKET;
  if (!bucket) return new Response("File storage is not configured.", { status: 404 });

  const key = (await params).key.map(decodeURIComponent).join("/");
  if (!/^(image|audio|video)\/[\w\-./]+$/.test(key) || key.includes("..")) return new Response("Not found", { status: 404 });

  const rangeHeader = request.headers.get("range");
  const match = rangeHeader?.match(/^bytes=(\d*)-(\d*)$/);
  let range: { offset: number; length?: number } | { suffix: number } | undefined;
  if (match && (match[1] || match[2])) {
    if (match[1]) {
      const offset = Number(match[1]);
      range = match[2] ? { offset, length: Number(match[2]) - offset + 1 } : { offset };
    } else {
      range = { suffix: Number(match[2]) };
    }
  }

  const object = await bucket.get(key, range ? { range } : undefined);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "content-type": object.httpMetadata?.contentType || "application/octet-stream",
    "cache-control": "public, max-age=31536000, immutable",
    "accept-ranges": "bytes",
    etag: object.httpEtag,
    "x-content-type-options": "nosniff",
  });

  const body = object.body as unknown as BodyInit;
  if (range && object.range) {
    const r = object.range as { offset?: number; length?: number; suffix?: number };
    const start = r.offset ?? (r.suffix != null ? object.size - r.suffix : 0);
    const length = r.length ?? object.size - start;
    headers.set("content-range", `bytes ${start}-${start + length - 1}/${object.size}`);
    headers.set("content-length", String(length));
    return new Response(body, { status: 206, headers });
  }
  headers.set("content-length", String(object.size));
  return new Response(body, { headers });
}
