import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionManager } from "@/components/dashboard/collection-manager";
import { getSession } from "@/lib/auth";
import { collections, isCollectionKey } from "@/lib/collections";
import { listAll } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollectionKey(collection) ? collections[collection].label : "Not found" };
}

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!isCollectionKey(collection)) notFound();
  const [items, session] = await Promise.all([listAll(collection), getSession()]);
  return (
    <CollectionManager
      collectionKey={collection}
      items={items as unknown as Record<string, unknown>[]}
      canDelete={session?.role === "admin"}
      authorName={session?.name ?? ""}
    />
  );
}
