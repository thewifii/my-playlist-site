import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare bindings (D1, R2). Returns an empty object when not running on Cloudflare. */
export function cfEnv(): Partial<CloudflareEnv> {
  try {
    return (getCloudflareContext().env ?? {}) as Partial<CloudflareEnv>;
  } catch {
    return {};
  }
}

/** Reads a server-side environment variable or Cloudflare secret. Never call from client code. */
export function envVar(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  const fromBinding = (cfEnv() as Record<string, unknown>)[name];
  return typeof fromBinding === "string" && fromBinding ? fromBinding : undefined;
}
