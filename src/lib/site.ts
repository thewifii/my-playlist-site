// Brand-level settings: names, links, navigation and the About page copy.
// The numbers and brand names below are SAMPLE PLACEHOLDERS: replace them with real ones.

/**
 * PRE-LAUNCH SWITCH.
 * true  = visitors see only the temporary "Coming soon" page at "/" (every other public page
 *         redirects there). Signed-in admins and contributors still see the full site.
 * false = the full site is live.
 */
export const COMING_SOON = true;

export const site = {
  name: "The Wifii",
  wordmark: "THE WIFII",
  network: "Culture Lives Here",
  networkWordmark: "CULTURE LIVES HERE",
  url: process.env.SITE_URL || "https://thewifii.com",
  tagline: "Creator. Curator. Producer. Culture lives here.",
  description:
    "The Wifii is a creator, cultural curator and producer, and the founder of Culture Lives Here: a media network for music, fashion, film and the creator economy.",
  email: "hello@thewifii.com",
  pressEmail: "press@thewifii.com",
  bookingEmail: "collabs@thewifii.com",
};

export const socials = [
  { handle: "@thewifii_", label: "The Wifii on TikTok", platform: "TikTok", url: "https://www.tiktok.com/@thewifii_" },
  { handle: "@cultureliveshere", label: "Culture Lives Here on TikTok", platform: "TikTok", url: "https://www.tiktok.com/@cultureliveshere" },
] as const;

export const cultureLinks = [
  { title: "Culture Lives Here", href: "/iamtheculture/culture-lives-here", description: "Editorial, reviews and the 5 Flame Burn Notice Score." },
  { title: "Podcasts", href: "/iamtheculture/podcasts", description: "Culture Lives Here Podcast and Culturally Inappropriate Podcast." },
  { title: "Music", href: "/iamtheculture/music", description: "Beats, reference tracks and commercial sounds for TikTok Shop creators." },
  { title: "Merch", href: "/iamtheculture/merch", description: "Streetwear and creator merch from the network." },
  { title: "Playlists", href: "/iamtheculture/playlists", description: "Editorial playlists curated by tempo, key and mood." },
] as const;

export const mainNav = [
  { title: "Home", href: "/home" },
  { title: "About", href: "/about" },
  { title: "Portfolio", href: "/portfolio" },
  { title: "Creator Corner", href: "/creator-corner" },
  { title: "Iamtheculture", href: "/iamtheculture", children: cultureLinks },
  { title: "Contact", href: "/contact" },
] as const;

export const audienceStats = [
  { value: "1.2M+", label: "Followers across platforms" },
  { value: "85M", label: "Video views in the last 12 months" },
  { value: "6.8%", label: "Average engagement rate" },
  { value: "40+", label: "Brand partnerships delivered" },
];

export const brandHighlights = ["Halo Audio", "Northside Supply", "Glow Theory", "Stride Lab", "Deskline", "Culture Weekly"];

export const pressHighlights = [
  { outlet: "Culture Weekly", quote: "One of the creators redefining what a media brand looks like.", year: "2026" },
  { outlet: "Creator Journal", quote: "A producer's ear and an editor's eye, in the same feed.", year: "2026" },
  { outlet: "The Sound Report", quote: "The commercial sounds every TikTok Shop seller is using.", year: "2025" },
];

export const SHOWS = {
  "culture-lives-here": {
    name: "Culture Lives Here Podcast",
    tagline: "Conversations with the people building the culture: producers, designers, founders and creators.",
    cadence: "New episodes every other Wednesday",
  },
  "culturally-inappropriate": {
    name: "Culturally Inappropriate Podcast",
    tagline: "Hot takes, bad ideas and the group chat out loud. Listener discretion is a suggestion.",
    cadence: "New episodes every other Friday",
  },
} as const;

export type ShowKey = keyof typeof SHOWS;
