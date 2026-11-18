import type { MetadataRoute } from "next";
import { postHref } from "@/components/site/cards";
import { listPublished } from "@/lib/repo";
import { COMING_SOON, site } from "@/lib/site";

export const dynamic = "force-dynamic";

// Public pages only. /dj-builder, /dashboard and /login are deliberately left out.
const STATIC_PATHS = [
  "/",
  "/home",
  "/about",
  "/portfolio",
  "/creator-corner",
  "/contact",
  "/iamtheculture",
  "/iamtheculture/culture-lives-here",
  "/iamtheculture/podcasts",
  "/iamtheculture/music",
  "/iamtheculture/merch",
  "/iamtheculture/playlists",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pre-launch: only the coming-soon page is public.
  if (COMING_SOON) return [{ url: `${site.url}/`, changeFrequency: "weekly", priority: 1 }];
  const posts = await listPublished("posts").catch(() => []);
  return [
    ...STATIC_PATHS.map((path) => ({ url: `${site.url}${path}`, changeFrequency: "weekly" as const, priority: path === "/" || path === "/home" ? 1 : 0.7 })),
    ...posts.map((post) => ({ url: `${site.url}${postHref(post)}`, lastModified: post.updated_at || post.published_at, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
