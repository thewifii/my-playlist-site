"use client";

import { ExternalLink, Loader2, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { FlameBadge, FlameSlider } from "@/components/flame-meter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { collections, type Field } from "@/lib/collections";
import type { CollectionKey } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Item = Record<string, unknown>;

function blank(fields: Field[], authorName: string): Item {
  const item: Item = {};
  for (const f of fields) {
    if (f.type === "tags" || f.type === "lines") item[f.name] = [];
    else if (f.type === "boolean") item[f.name] = f.name === "in_stock";
    else if (f.type === "flame") item[f.name] = 3;
    else if (f.type === "number") item[f.name] = f.name === "sort" ? 99 : null;
    else if (f.type === "select") item[f.name] = f.name === "status" ? "draft" : (f.options?.[0]?.value ?? "");
    else item[f.name] = f.name === "author" || f.name === "artist" || f.name === "curator" ? authorName : "";
  }
  return item;
}

function toLocalInput(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/** URL field with an upload button that sends the file to R2 through /api/upload. */
function MediaField({ field, id, value, onChange }: { field: Field; id: string; value: string; onChange: (v: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const accept = field.type === "image" ? "image/*" : field.type === "audio" ? "audio/*" : "video/*,audio/*,image/*";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) onChange(data.url);
      else setError(data.error || "Upload failed. Try again or paste a URL.");
    } catch {
      setError("Upload failed. Check your connection and try again.");
    }
    setBusy(false);
  }

  const isImage = field.type === "image" || /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(value) || value.includes("picsum.photos");
  const isAudio = field.type === "audio" || /\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input id={id} type="url" inputMode="url" placeholder="https://… or upload a file" value={value} onChange={(e) => onChange(e.target.value)} className="h-10" />
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onFile} tabIndex={-1} aria-hidden="true" />
        <Button type="button" variant="outline" className="h-10 shrink-0 gap-2" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {value && field.type !== "audio" && isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Preview" className="h-28 rounded-md border border-border object-cover" />
      ) : null}
      {value && isAudio && field.type !== "image" ? <audio controls preload="none" src={value} className="h-10 w-full" /> : null}
    </div>
  );
}

function FieldEditor({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = `field-${field.name}`;
  const label = (
    <Label htmlFor={id} className="font-bold">
      {field.label}
      {field.required ? <span className="text-destructive"> *</span> : null}
    </Label>
  );
  const help = field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null;

  switch (field.type) {
    case "flame":
      return (
        <div className="rounded-lg border border-border bg-card p-5">
          <FlameSlider value={typeof value === "number" ? value : 0} onChange={onChange} label={field.label} compact />
        </div>
      );
    case "boolean":
      return (
        <div className="flex items-center gap-3">
          <Checkbox id={id} checked={value === true} onCheckedChange={(c) => onChange(c === true)} />
          <Label htmlFor={id} className="font-bold">
            {field.label}
          </Label>
        </div>
      );
    case "select":
      return (
        <div className="space-y-2">
          {label}
          <Select value={String(value ?? "")} onValueChange={onChange}>
            <SelectTrigger id={id} className="h-10 w-full">
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {help}
        </div>
      );
    case "textarea":
    case "markdown":
      return (
        <div className="space-y-2">
          {label}
          <Textarea id={id} rows={field.type === "markdown" ? 14 : 3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={field.type === "markdown" ? "font-mono text-sm leading-relaxed" : undefined} />
          {help}
        </div>
      );
    case "lines":
      return (
        <div className="space-y-2">
          {label}
          <Textarea id={id} rows={4} value={Array.isArray(value) ? value.join("\n") : ""} onChange={(e) => onChange(e.target.value.split("\n"))} />
          {help}
        </div>
      );
    case "tags":
      return (
        <div className="space-y-2">
          {label}
          <Input id={id} className="h-10" value={Array.isArray(value) ? value.join(", ") : ""} onChange={(e) => onChange(e.target.value.split(",").map((s) => s.replace(/^\s+/, "")))} placeholder="Comma, separated, values" />
          {help}
        </div>
      );
    case "image":
    case "audio":
    case "media":
      return (
        <div className="space-y-2">
          {label}
          <MediaField field={field} id={id} value={String(value ?? "")} onChange={onChange} />
          {help}
        </div>
      );
    case "number":
      return (
        <div className="space-y-2">
          {label}
          <Input id={id} type="number" inputMode="decimal" step="any" className="h-10" value={value == null ? "" : String(value)} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
          {help}
        </div>
      );
    case "datetime":
      return (
        <div className="space-y-2">
          {label}
          <Input id={id} type="datetime-local" className="h-10" value={toLocalInput(value)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")} />
          {help}
        </div>
      );
    default:
      return (
        <div className="space-y-2">
          {label}
          <Input id={id} className="h-10" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
          {help}
        </div>
      );
  }
}

function cell(field: Field, value: unknown): React.ReactNode {
  if (value == null || value === "") return <span className="text-muted-foreground">—</span>;
  if (field.name === "status") return <Badge variant={value === "published" ? "default" : "outline"}>{value === "published" ? "Published" : "Draft"}</Badge>;
  if (field.type === "flame") return <FlameBadge score={Number(value)} />;
  if (field.type === "datetime") return formatDate(String(value));
  if (field.type === "select") return field.options?.find((o) => o.value === value)?.label ?? String(value);
  return String(value);
}

export function CollectionManager({ collectionKey, items, canDelete, authorName }: { collectionKey: CollectionKey; items: Item[]; canDelete: boolean; authorName: string }) {
  const c = collections[collectionKey];
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [deleting, setDeleting] = React.useState<Item | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const columns = c.fields.filter((f) => f.column);
  const visible = items.filter((item) => !query || String(item[c.titleField] ?? "").toLowerCase().includes(query.toLowerCase()));
  const isNew = editing !== null && !editing.id;
  const shown = (f: Field) => !f.showWhen || f.showWhen.in.includes(String(editing?.[f.showWhen.field] ?? ""));

  async function save(statusOverride?: "draft" | "published") {
    if (!editing) return;
    setBusy(true);
    setError("");
    const payload = statusOverride ? { ...editing, status: statusOverride } : editing;
    try {
      const res = await fetch(`/api/admin/${collectionKey}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error || "Couldn't save. Try again.");
      else {
        setEditing(null);
        router.refresh();
      }
    } catch {
      setError("Couldn't reach the server. Your changes are still here; try again.");
    }
    setBusy(false);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    const res = await fetch(`/api/admin/${collectionKey}/${encodeURIComponent(String(deleting.id))}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    setDeleting(null);
    if (res?.ok) router.refresh();
    else setError("Couldn't delete that item.");
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{c.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {c.description}{" "}
            <a href={c.publicPath} target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-bold text-foreground underline underline-offset-4">
              View on site <ExternalLink className="size-3" />
            </a>
          </p>
        </div>
        <Button size="lg" className="h-11 gap-2 px-5 font-bold" onClick={() => { setError(""); setEditing(blank(c.fields, authorName)); }}>
          <Plus className="size-4" /> New {c.singular}
        </Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Label htmlFor="collection-search" className="sr-only">
          Search {c.label}
        </Label>
        <Input id="collection-search" type="search" placeholder={`Search ${c.label.toLowerCase()}…`} className="h-10 pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {error && !editing ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((f) => (
                <TableHead key={f.name} className="kicker whitespace-nowrap text-muted-foreground">
                  {f.label}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center text-muted-foreground">
                  {items.length === 0 ? `Nothing here yet. Create your first ${c.singular}.` : "No matches. Try a different search."}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((item) => (
                <TableRow key={String(item.id)}>
                  {columns.map((f) => (
                    <TableCell key={f.name} className={f.name === c.titleField ? "max-w-[420px] min-w-56 font-bold whitespace-normal" : "whitespace-nowrap"}>
                      {f.name === c.titleField ? (
                        <button type="button" className="text-left hover:text-highlight focus-visible:underline focus-visible:outline-none" onClick={() => { setError(""); setEditing({ ...item }); }}>
                          {String(item[f.name] ?? "Untitled")}
                        </button>
                      ) : (
                        cell(f, item[f.name])
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon-lg" aria-label={`Edit ${String(item[c.titleField])}`} onClick={() => { setError(""); setEditing({ ...item }); }}>
                      <Pencil className="size-4" />
                    </Button>
                    {canDelete ? (
                      <Button variant="ghost" size="icon-lg" aria-label={`Delete ${String(item[c.titleField])}`} onClick={() => setDeleting(item)}>
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Editor */}
      <Sheet open={editing !== null} onOpenChange={(o) => !o && !busy && setEditing(null)}>
        <SheetContent side="right" className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="font-heading text-2xl font-bold">{isNew ? `New ${c.singular}` : `Edit ${c.singular}`}</SheetTitle>
            <SheetDescription>{editing?.status === "published" ? "Published: changes go live when you save." : "Draft: not visible on the site until you publish."}</SheetDescription>
          </SheetHeader>
          <form
            id="collection-editor"
            className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            {editing ? c.fields.filter(shown).map((f) => <FieldEditor key={f.name} field={f} value={editing[f.name]} onChange={(v) => setEditing((prev) => (prev ? { ...prev, [f.name]: v } : prev))} />) : null}
          </form>
          <SheetFooter className="border-t border-border">
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)} disabled={busy}>
                Cancel
              </Button>
              {editing?.status !== "published" ? (
                <Button type="button" variant="outline" className="h-10" onClick={() => save("draft")} disabled={busy}>
                  Save draft
                </Button>
              ) : (
                <Button type="button" variant="outline" className="h-10" onClick={() => save("draft")} disabled={busy}>
                  Unpublish
                </Button>
              )}
              <Button type="button" className="h-10 gap-2 px-5 font-bold" onClick={() => save("published")} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing?.status === "published" ? "Save changes" : "Publish"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{String(deleting?.[c.titleField] ?? "")}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This removes it from the site and the database. It can&rsquo;t be undone. To hide it instead, edit it and choose Unpublish.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete {c.singular}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
