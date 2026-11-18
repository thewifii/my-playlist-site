import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/article";
import { listPublished } from "@/lib/repo";

async function load(slug: string) {
  const posts = (await listPublished("posts")).filter((p) => p.type !== "creator");
  const post = posts.find((p) => p.slug === slug);
  return { post, posts };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { post } = await load((await params).slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/iamtheculture/culture-lives-here/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: post.cover_image ? [post.cover_image] : undefined, publishedTime: post.published_at },
  };
}

export default async function CulturePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { post, posts } = await load((await params).slug);
  if (!post) notFound();
  const related = posts.filter((p) => p.id !== post.id).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 3);
  return <ArticleView post={post} related={related} backHref="/iamtheculture/culture-lives-here" backLabel="Culture Lives Here" />;
}
