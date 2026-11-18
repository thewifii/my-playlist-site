import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { cfEnv } from "@/lib/cf";

const MAX_BYTES = 40 * 1024 * 1024; // 40 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * Dashboard uploads to Cloudflare R2 (`BUCKET` binding): cover images, merch photos, audio previews, videos.
 * Files are served back through /api/media/<key>. Without the binding the editor falls back to pasting a URL.
 */
export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const bucket = cfEnv().BUCKET;
  if (!bucket) {
    return NextResponse.json({ error: "File storage (R2) isn't connected yet. Paste a media URL instead, or bind the BUCKET in wrangler.toml." }, { status: 501 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Send the file as multipart form data." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file was attached." }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Upload a JPG, PNG, WebP, AVIF or GIF image, an MP3, WAV, M4A, AAC or OGG audio file, or an MP4, WebM or MOV video." }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That file is larger than 40 MB. Compress it or host it elsewhere and paste the URL." }, { status: 413 });

  const kind = file.type.split("/")[0];
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
  const key = `${kind}/${new Date().getUTCFullYear()}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { uploadedBy: auth.session.email, originalName: file.name.slice(0, 200) },
  });

  return NextResponse.json({ url: `/api/media/${key}`, key, size: file.size, contentType: file.type });
}
