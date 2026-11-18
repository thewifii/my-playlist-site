import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Remote sample media is served straight from its host; Cloudflare Images is not required.
  images: { unoptimized: true },
};

export default nextConfig;

// Makes the D1 (`DB`) and R2 (`BUCKET`) bindings from wrangler.toml available in `next dev`.
initOpenNextCloudflareForDev();
