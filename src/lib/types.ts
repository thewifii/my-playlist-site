export type Status = "draft" | "published";

interface Base {
  id: string;
  status: Status;
  created_at?: string;
  updated_at?: string;
}

/** Culture Lives Here articles + reviews, and Creator Corner posts. */
export interface Post extends Base {
  title: string;
  slug: string;
  /** article/review live under Culture Lives Here; creator lives under Creator Corner */
  type: "article" | "review" | "creator";
  format: "blog" | "vlog";
  category: string;
  review_kind: "" | "music" | "fashion" | "movie";
  /** 5 Flame Burn Notice Score, 0.0–5.0 (reviews only) */
  flame_score: number | null;
  excerpt: string;
  body: string;
  cover_image: string;
  author: string;
  tags: string[];
  /** Media URLs (YouTube, Vimeo, TikTok, Instagram, Spotify, Apple Music, SoundCloud, mp3) */
  embeds: string[];
  read_time: number;
  featured: boolean;
  published_at: string;
}

export interface Episode extends Base {
  show: "culture-lives-here" | "culturally-inappropriate";
  number: number;
  title: string;
  description: string;
  show_notes: string;
  audio_url: string;
  duration: number;
  cover_image: string;
  /** "Name | avatar url" */
  guests: string[];
  tags: string[];
  spotify_url: string;
  apple_url: string;
  youtube_url: string;
  published_at: string;
}

export interface PortfolioItem extends Base {
  title: string;
  client: string;
  category: "tiktok-shop-ugc" | "brand-campaign" | "viral";
  media_type: "video" | "youtube" | "tiktok" | "instagram";
  media_url: string;
  thumbnail: string;
  stats: string;
  description: string;
  sort: number;
}

export interface Track extends Base {
  kind: "beat" | "reference" | "cml";
  title: string;
  artist: string;
  bpm: number;
  musical_key: string;
  genre: string;
  moods: string[];
  audio_url: string;
  cover_image: string;
  duration: number;
  price_mp3: number | null;
  price_wav: number | null;
  price_stems: number | null;
  tiktok_url: string;
  usage_tip: string;
  description: string;
  sort: number;
}

export interface Playlist extends Base {
  title: string;
  description: string;
  /** Spotify playlist id, e.g. 37i9dQZF1DX0XUsuxWHRQd */
  spotify_id: string;
  moods: string[];
  /** "Track — Artist" */
  highlights: string[];
  cover_image: string;
  curator: string;
  sort: number;
}

export interface Product extends Base {
  name: string;
  slug: string;
  price: number;
  category: string;
  badge: string;
  description: string;
  image: string;
  gallery: string[];
  sizes: string[];
  in_stock: boolean;
  sort: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "contributor";
  password_hash: string;
  created_at: string;
}

export interface Submission {
  id: string;
  kind: "brand-inquiry" | "contact" | "beat-inquiry" | "newsletter" | "merch-order";
  name: string;
  email: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface CollectionTypes {
  posts: Post;
  episodes: Episode;
  portfolio: PortfolioItem;
  tracks: Track;
  playlists: Playlist;
  products: Product;
}

export type CollectionKey = keyof CollectionTypes;
