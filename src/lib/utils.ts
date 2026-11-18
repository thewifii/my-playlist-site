export { cn } from "cn";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** 245 -> "4:05", 3725 -> "1:02:05" */
export function formatDuration(totalSeconds?: number | null): string {
  if (!totalSeconds || totalSeconds < 0 || !Number.isFinite(totalSeconds)) return "0:00";
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export function formatPrice(amount?: number | null): string {
  if (amount == null) return "";
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

export function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}
