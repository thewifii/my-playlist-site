"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cultureLinks, mainNav, site, socials } from "@/lib/site";
import { cn } from "@/lib/utils";

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.6 2h-3.2v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.3a6.1 6.1 0 1 0 5.2 6V8.7a7.6 7.6 0 0 0 4.4 1.4V6.9A4.5 4.5 0 0 1 16.6 2Z" />
    </svg>
  );
}

export function Wordmark({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <Link href="/" className={cn("group flex flex-col leading-none", className)} aria-label={`${site.name} — ${site.network}, landing page`}>
      <span className={cn("font-heading font-bold tracking-tight", size === "lg" ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl")}>
        THE <span className="text-highlight">WIFII</span>
      </span>
      <span className={cn("mt-1 font-bold uppercase text-muted-foreground transition-colors group-hover:text-foreground", size === "lg" ? "text-xs tracking-[0.34em]" : "text-[0.58rem] tracking-[0.3em]")}>
        Culture Lives Here
      </span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClass =
  "inline-flex h-9 items-center whitespace-nowrap rounded-md px-3 text-[0.8rem] font-bold uppercase tracking-wider text-foreground/75 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[active=true]:text-highlight";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <NavigationMenu viewport={false} className="hidden lg:flex" aria-label="Main">
          <NavigationMenuList className="gap-0.5">
            {mainNav.map((item) =>
              "children" in item ? (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuTrigger className={cn(linkClass, "bg-transparent")} data-active={isActive(pathname, item.href)}>
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="md:right-0 md:left-auto">
                    <div className="grid w-[640px] grid-cols-[1.1fr_2fr] gap-2 p-2">
                      <NavigationMenuLink asChild>
                        <Link href={item.href} className="flex h-full flex-col justify-end rounded-md bg-gold p-5 text-ink hover:bg-gold-bright focus:bg-gold-bright">
                          <span className="kicker">The Hub</span>
                          <span className="mt-1 font-heading text-2xl leading-tight font-bold">Iamtheculture</span>
                          <span className="mt-2 text-sm leading-snug text-ink/80">Editorial, podcasts, music, merch and playlists from the network.</span>
                        </Link>
                      </NavigationMenuLink>
                      <ul className="grid grid-cols-2 gap-1">
                        {cultureLinks.map((link) => (
                          <li key={link.href}>
                            <NavigationMenuLink asChild>
                              <Link href={link.href} className="block rounded-md p-3 hover:bg-muted focus:bg-muted">
                                <span className="block text-sm font-bold">{link.title}</span>
                                <span className="mt-1 block text-xs leading-snug text-muted-foreground">{link.description}</span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link href={item.href} className={linkClass} data-active={isActive(pathname, item.href)} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1">
          {socials.map((s) => (
            <Button key={s.handle} asChild variant="ghost" size="lg" className="hidden gap-1.5 px-2 text-xs font-bold sm:inline-flex">
              <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <TikTokIcon className="size-3.5" />
                <span className="hidden 2xl:inline">{s.handle}</span>
              </a>
            </Button>
          ))}
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-lg" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] overflow-y-auto sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="font-heading text-xl font-bold">
                  THE <span className="text-highlight">WIFII</span>
                </SheetTitle>
                <SheetDescription>Culture Lives Here</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col px-4 pb-8">
                {mainNav.map((item) => (
                  <div key={item.href} className="border-b border-border py-1">
                    <Link href={item.href} className={cn("block py-3 font-heading text-2xl font-bold", isActive(pathname, item.href) && "text-highlight")}>
                      {item.title}
                    </Link>
                    {"children" in item ? (
                      <ul className="mb-3 space-y-1 border-l-2 border-gold pl-4">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link href={child.href} className="block py-1.5 text-sm font-bold text-foreground/80">
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
                <div className="mt-6 flex flex-col gap-2">
                  {socials.map((s) => (
                    <Button key={s.handle} asChild variant="outline" size="lg" className="h-11 justify-start gap-2">
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        <TikTokIcon className="size-4" /> {s.handle}
                      </a>
                    </Button>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
