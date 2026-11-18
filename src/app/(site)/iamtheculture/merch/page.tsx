import type { Metadata } from "next";
import { PageHero } from "@/components/site/cards";
import { MerchStore } from "@/components/site/merch-store";
import { listPublished } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Merch",
  description: "Streetwear and creator merch from The Wifii and Culture Lives Here.",
  alternates: { canonical: "/iamtheculture/merch" },
};

export default async function MerchPage() {
  const products = await listPublished("products");
  return (
    <>
      <PageHero kicker="The shop" title="Wear the culture" description="Heavyweight basics and limited drops from the Culture Lives Here network. Pick a size, add to cart and request checkout." />
      <section className="container-site py-10 lg:py-14">
        <MerchStore products={products} />
      </section>
    </>
  );
}
