"use client";

import { Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { Embed, Img } from "@/components/media";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PortfolioItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "tiktok-shop-ugc", label: "TikTok Shop & UGC" },
  { value: "brand-campaign", label: "Brand Campaigns" },
  { value: "viral", label: "Viral Videos" },
] as const;

const CATEGORY_LABEL: Record<PortfolioItem["category"], string> = {
  "tiktok-shop-ugc": "TikTok Shop & UGC",
  "brand-campaign": "Brand Campaign",
  viral: "Viral Video",
};

const SOURCE_LABEL: Record<PortfolioItem["media_type"], string> = { video: "Video", youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram" };

export function PortfolioShowcase({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = React.useState<string>("all");
  const [open, setOpen] = React.useState<PortfolioItem | null>(null);
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div>
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="no-scrollbar h-auto! w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
          {FILTERS.map((f) => (
            <TabsTrigger
              key={f.value}
              value={f.value}
              className="kicker h-12 flex-none rounded-none border-0 border-b-2 border-transparent px-4 text-muted-foreground data-active:border-gold! data-active:bg-transparent! data-active:text-foreground! data-active:shadow-none! dark:data-active:border-gold! dark:data-active:bg-transparent!"
            >
              {f.label}
              <span className="ml-2 text-muted-foreground tabular-nums">{f.value === "all" ? items.length : items.filter((i) => i.category === f.value).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ul className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => {
            const vertical = item.media_type === "video" || item.media_type === "tiktok" || item.media_type === "instagram";
            return (
              <motion.li key={item.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
                <button type="button" onClick={() => setOpen(item)} className="group block w-full text-left focus-visible:outline-none">
                  <div className="relative overflow-hidden rounded-md bg-ink group-focus-visible:ring-3 group-focus-visible:ring-ring/60">
                    <AspectRatio ratio={4 / 5}>
                      <Img src={item.thumbnail} alt="" className={cn("transition-transform duration-700 group-hover:scale-105", !vertical && "object-cover")} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      <span className="kicker absolute top-3 left-3 bg-gold px-2 py-1 text-ink">{CATEGORY_LABEL[item.category]}</span>
                      <span className="absolute top-3 right-3 rounded-sm bg-black/70 px-1.5 py-1 text-[0.65rem] font-bold text-white uppercase">{SOURCE_LABEL[item.media_type]}</span>
                      <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-ink transition-transform group-hover:scale-110">
                        <Play className="size-6 translate-x-px" fill="currentColor" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 p-4 text-sm font-bold text-white">{item.stats}</span>
                    </AspectRatio>
                  </div>
                  <p className="kicker mt-4 text-muted-foreground">{item.client}</p>
                  <h3 className="mt-1 text-xl leading-snug font-bold group-hover:text-highlight">{item.title}</h3>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-3xl">
          {open ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold">{open.title}</DialogTitle>
                <DialogDescription>
                  {open.client} · {CATEGORY_LABEL[open.category]} · {open.stats}
                </DialogDescription>
              </DialogHeader>
              {open.media_type === "video" ? (
                <video controls playsInline autoPlay muted poster={open.thumbnail} src={open.media_url} className="mx-auto max-h-[60svh] w-full rounded-md bg-black" />
              ) : (
                <Embed url={open.media_url} title={open.title} />
              )}
              <p className="text-sm leading-relaxed text-muted-foreground">{open.description}</p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
