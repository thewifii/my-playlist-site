import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-16 text-center">
      <div>
        <p className="font-heading text-[28vw] leading-none font-bold text-highlight sm:text-[180px]">404</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">This page isn&rsquo;t in rotation.</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">The link may be old or the post may have been unpublished.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-12 px-6 text-base font-bold">
            <Link href="/home">Go to the home page</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base font-bold">
            <Link href="/iamtheculture/culture-lives-here">Read the latest</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
