import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

declare global {
  /** Cloudflare bindings declared in wrangler.toml. Both are optional so local preview works without them. */
  interface CloudflareEnv {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}

export {};
