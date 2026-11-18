"use client";

import { Check, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { Img } from "@/components/media";
import { submitForm } from "@/components/site/forms";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

interface CartLine {
  productId: string;
  size: string;
  qty: number;
}

function SizePills({ product, value, onChange, idPrefix }: { product: Product; value: string; onChange: (size: string) => void; idPrefix: string }) {
  return (
    <div role="radiogroup" aria-label={`Size for ${product.name}`} className="flex flex-wrap gap-1.5">
      {product.sizes.map((size) => (
        <button
          key={size}
          id={`${idPrefix}-${size}`}
          type="button"
          role="radio"
          aria-checked={value === size}
          disabled={!product.in_stock}
          onClick={() => onChange(size)}
          className={cn(
            "h-9 min-w-10 rounded-full border border-border px-3 text-xs font-bold transition-colors hover:border-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
            value === size && "border-foreground bg-foreground text-background",
          )}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

export function MerchStore({ products }: { products: Product[] }) {
  const byId = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const categories = React.useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);
  const [category, setCategory] = React.useState("All");
  const [sizes, setSizes] = React.useState<Record<string, string>>({});
  const [quick, setQuick] = React.useState<Product | null>(null);
  const [quickImage, setQuickImage] = React.useState(0);
  const [cartOpen, setCartOpen] = React.useState(false);
  // The cart starts with sample items so the drawer looks complete in V1.
  const [cart, setCart] = React.useState<CartLine[]>(() =>
    products.filter((p) => p.in_stock).slice(0, 2).map((p, i) => ({ productId: p.id, size: p.sizes[Math.min(i + 1, p.sizes.length - 1)], qty: 1 })),
  );
  const [email, setEmail] = React.useState("");
  const [checkout, setCheckout] = React.useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = React.useState("");

  const sizeOf = (p: Product) => sizes[p.id] ?? (p.sizes.includes("M") ? "M" : p.sizes[0]);
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = cart.reduce((sum, l) => sum + (byId.get(l.productId)?.price ?? 0) * l.qty, 0);
  const visible = category === "All" ? products : products.filter((p) => p.category === category);

  function add(p: Product, size: string) {
    setCart((lines) => {
      const i = lines.findIndex((l) => l.productId === p.id && l.size === size);
      if (i >= 0) return lines.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l));
      return [...lines, { productId: p.id, size, qty: 1 }];
    });
    setCheckout("idle");
    setQuick(null);
    setCartOpen(true);
  }

  function setQty(index: number, qty: number) {
    setCart((lines) => (qty <= 0 ? lines.filter((_, i) => i !== index) : lines.map((l, i) => (i === index ? { ...l, qty } : l))));
  }

  async function onCheckout(e: React.FormEvent) {
    e.preventDefault();
    setCheckout("sending");
    setError("");
    const res = await submitForm("merch-order", "", email, {
      items: cart.map((l) => ({ product: byId.get(l.productId)?.name, size: l.size, qty: l.qty, price: byId.get(l.productId)?.price })),
      subtotal,
    });
    if (res.ok) {
      setCheckout("done");
      setCart([]);
    } else {
      setError(res.error ?? "Something went wrong.");
      setCheckout("idle");
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter by category">
          {categories.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn("kicker h-9 rounded-full border border-border px-4 whitespace-nowrap transition-colors hover:border-gold focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none", category === c && "border-gold bg-gold text-ink")}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="lg" className="h-11 gap-2 px-4 font-bold" onClick={() => setCartOpen(true)}>
          <ShoppingBag className="size-4" /> Cart
          <span className="grid size-6 place-items-center rounded-full bg-gold text-xs text-ink tabular-nums" aria-label={`${count} items`}>
            {count}
          </span>
        </Button>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6 2xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p) => (
            <motion.li key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-md bg-muted">
                <AspectRatio ratio={4 / 5}>
                  <Img src={p.image} alt={p.name} className={cn("transition-transform duration-700 group-hover:scale-105", !p.in_stock && "opacity-60 grayscale")} />
                  {p.badge ? <span className={cn("kicker absolute top-3 left-3 px-2 py-1", p.in_stock ? "bg-gold text-ink" : "bg-ink text-white")}>{p.badge}</span> : null}
                  <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
                    <Button variant="secondary" className="h-10 w-full bg-white font-bold text-ink hover:bg-gold" onClick={() => { setQuick(p); setQuickImage(0); }}>
                      Quick view
                    </Button>
                  </div>
                </AspectRatio>
              </div>
              <p className="kicker mt-4 text-muted-foreground">{p.category}</p>
              <h3 className="mt-1 leading-snug font-bold text-balance">{p.name}</h3>
              <p className="mt-1 font-bold tabular-nums">{formatPrice(p.price)}</p>
              <div className="mt-3">
                <SizePills product={p} value={sizeOf(p)} onChange={(s) => setSizes((prev) => ({ ...prev, [p.id]: s }))} idPrefix={`grid-${p.id}`} />
              </div>
              <Button className="mt-3 h-10 font-bold" disabled={!p.in_stock} onClick={() => add(p, sizeOf(p))}>
                {p.in_stock ? "Add to cart" : "Sold out"}
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Quick view */}
      <Dialog open={quick !== null} onOpenChange={(o) => !o && setQuick(null)}>
        <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-4xl">
          {quick ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="overflow-hidden rounded-md bg-muted">
                  <AspectRatio ratio={4 / 5}>
                    <Img src={[quick.image, ...quick.gallery][quickImage] ?? quick.image} alt={quick.name} />
                  </AspectRatio>
                </div>
                <div className="mt-3 flex gap-2">
                  {[quick.image, ...quick.gallery].map((src, i) => (
                    <button key={src} type="button" onClick={() => setQuickImage(i)} aria-label={`Photo ${i + 1}`} aria-pressed={quickImage === i} className={cn("w-16 overflow-hidden rounded border-2 border-transparent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none", quickImage === i && "border-gold")}>
                      <AspectRatio ratio={1}>
                        <Img src={src} alt="" />
                      </AspectRatio>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <DialogHeader className="text-left">
                  <p className="kicker text-highlight">{quick.badge || quick.category}</p>
                  <DialogTitle className="font-heading text-3xl leading-tight font-bold">{quick.name}</DialogTitle>
                  <DialogDescription className="text-base">{quick.description}</DialogDescription>
                </DialogHeader>
                <p className="mt-4 font-heading text-3xl font-bold tabular-nums">{formatPrice(quick.price)}</p>
                <p className="kicker mt-6 mb-2 text-muted-foreground">Size</p>
                <SizePills product={quick} value={sizeOf(quick)} onChange={(s) => setSizes((prev) => ({ ...prev, [quick.id]: s }))} idPrefix={`quick-${quick.id}`} />
                <Button size="lg" className="mt-8 h-12 text-base font-bold" disabled={!quick.in_stock} onClick={() => add(quick, sizeOf(quick))}>
                  {quick.in_stock ? `Add to cart · ${formatPrice(quick.price)}` : "Sold out"}
                </Button>
                <p className="mt-4 text-xs text-muted-foreground">Made to order. Ships in 7–10 business days.</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Cart drawer */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="font-heading text-2xl font-bold">Your cart</SheetTitle>
            <SheetDescription>{count === 0 ? "Nothing in here yet." : `${count} item${count === 1 ? "" : "s"}`}</SheetDescription>
          </SheetHeader>

          {checkout === "done" ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center" role="status">
              <span className="mb-4 grid size-14 place-items-center rounded-full bg-gold text-ink">
                <Check className="size-7" />
              </span>
              <p className="font-heading text-2xl font-bold">Order request received.</p>
              <p className="mt-2 text-sm text-muted-foreground">We&rsquo;ll email a secure payment link and shipping details to {email}.</p>
              <Button variant="outline" className="mt-6" onClick={() => setCartOpen(false)}>
                Keep shopping
              </Button>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y divide-border overflow-y-auto px-4">
                {cart.map((line, i) => {
                  const p = byId.get(line.productId);
                  if (!p) return null;
                  return (
                    <li key={`${line.productId}-${line.size}`} className="flex gap-4 py-4">
                      <div className="w-20 shrink-0 overflow-hidden rounded bg-muted">
                        <AspectRatio ratio={4 / 5}>
                          <Img src={p.image} alt="" />
                        </AspectRatio>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm leading-snug font-bold">{p.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Size {line.size}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-border">
                            <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-muted" aria-label={line.qty === 1 ? `Remove ${p.name}` : `Decrease quantity of ${p.name}`} onClick={() => setQty(i, line.qty - 1)}>
                              {line.qty === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                            </button>
                            <span className="w-6 text-center text-sm font-bold tabular-nums">{line.qty}</span>
                            <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-muted" aria-label={`Increase quantity of ${p.name}`} onClick={() => setQty(i, line.qty + 1)}>
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-bold tabular-nums">{formatPrice(p.price * line.qty)}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <SheetFooter className="border-t border-border">
                <div className="flex items-baseline justify-between">
                  <span className="kicker text-muted-foreground">Subtotal</span>
                  <span className="font-heading text-2xl font-bold tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <form onSubmit={onCheckout} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cart-email">Email for your payment link</Label>
                    <Input id="cart-email" type="email" required autoComplete="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} disabled={count === 0} />
                  </div>
                  {error ? (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={count === 0 || checkout === "sending"}>
                    {checkout === "sending" ? <Loader2 className="size-4 animate-spin" /> : null} Request checkout
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">No card needed here. Shipping and tax are calculated on the payment link.</p>
                </form>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
