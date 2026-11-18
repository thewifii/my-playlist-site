// Sample content for V1. This is the in-memory fallback when D1 is not bound,
// and the source for `seed.sql` (run `npm run db:generate` after editing).
// Everything here is placeholder content: replace it from the dashboard.
import type { Episode, Playlist, PortfolioItem, Post, Product, Track } from "./types.ts";

const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const audio = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
const day = (d: string) => `${d}T15:00:00.000Z`;

const SAMPLE_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const YT_A = "https://www.youtube.com/watch?v=aqz-KE-bpKQ";
const YT_B = "https://www.youtube.com/watch?v=ScMzIvxBSi4";
const VIMEO = "https://vimeo.com/76979871";
const SPOTIFY_PLAYLIST = "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd";
const SPOTIFY_RNB = "https://open.spotify.com/playlist/37i9dQZF1DX4SBhb3fqCJd";

function post(p: Partial<Post> & Pick<Post, "id" | "title" | "type" | "category" | "excerpt" | "body" | "published_at">): Post {
  return {
    slug: p.id,
    format: "blog",
    review_kind: "",
    flame_score: null,
    cover_image: img(p.id),
    author: "The Wifii",
    tags: [],
    embeds: [],
    read_time: 5,
    featured: false,
    status: "published",
    ...p,
  };
}

export const posts: Post[] = [
  // ───────── Culture Lives Here: reviews (5 Flame Burn Notice Score) ─────────
  post({
    id: "midnight-in-the-a-album-review",
    title: "“Midnight in the A” Is the Rare Sequel Album That Outruns the Original",
    type: "review",
    review_kind: "music",
    flame_score: 4.6,
    category: "Music",
    featured: true,
    read_time: 7,
    tags: ["Album Review", "Hip-Hop", "Atlanta"],
    embeds: [SPOTIFY_PLAYLIST, YT_A],
    excerpt: "Fourteen tracks, zero skips, and a back half that sounds like a victory lap in slow motion. Sample review copy.",
    published_at: day("2026-11-12"),
    body: `Sequels are supposed to play it safe. This one doesn't. From the first 808 it is clear the budget went up and the hunger didn't go down, which almost never happens at the same time.

## The production is the headline

Every beat leaves room. The drums hit hard but the low end never crowds the vocal, and the transitions between tracks are sequenced like a DJ set: tempo climbs through the first six songs, then eases down across the back half.

> The best albums don't ask for your attention. They take it and give it back better.

## Where it slips

Two features feel like label requests rather than creative choices, and the interlude at track nine runs a minute too long. Small dents on a very clean ride.

## The verdict

Run it top to bottom on a night drive. It earns the Burn Notice.`,
  }),
  post({
    id: "neon-saints-film-review",
    title: "“Neon Saints” Review: A Heist Movie With a Real Heartbeat",
    type: "review",
    review_kind: "movie",
    flame_score: 3.8,
    category: "Film & TV",
    read_time: 6,
    tags: ["Movie Review", "Heist", "Soundtrack"],
    embeds: [VIMEO],
    excerpt: "Gorgeous to look at, tighter than it needs to be, and carried by a soundtrack that deserves its own release. Sample review copy.",
    published_at: day("2026-11-10"),
    body: `The plot is one you have seen before: one last job, one crew member you shouldn't trust. What you haven't seen is a heist film this patient with its characters.

## What works

The first forty minutes are all setup and they fly. The score leans on live drums and tape-saturated keys, and the needle drops are chosen by someone who actually listens to music.

## What doesn't

The third act rushes a betrayal the movie spent an hour earning. A longer cut probably exists and is probably better.

Still worth the ticket, and worth staying through the credits for the closing track.`,
  }),
  post({
    id: "fall-capsule-fit-check",
    title: "Fit Check: The Fall Capsule Everyone Is Trying to Copy",
    type: "review",
    review_kind: "fashion",
    flame_score: 4.2,
    category: "Fashion",
    read_time: 4,
    tags: ["Fashion Review", "Streetwear", "Capsule"],
    excerpt: "Heavyweight fleece, washed espresso tones, and cuts that finally fit real shoulders. Sample review copy.",
    published_at: day("2026-11-07"),
    body: `Eleven pieces, four colors, one clear point of view. The espresso and sand palette photographs better than it has any right to and the fleece weight is the real thing.

## Standouts

- The boxy zip hoodie: best piece in the drop.
- The double-knee work pant: runs long, size down.
- The cap: fine, but you already own three.

## Price check

It isn't cheap. The outerwear justifies it. The tees do not.`,
  }),
  post({
    id: "soft-power-ep-review",
    title: "“Soft Power” Is Twenty Minutes of R&B With Nothing to Prove",
    type: "review",
    review_kind: "music",
    flame_score: 3.4,
    category: "Music",
    read_time: 4,
    tags: ["EP Review", "R&B"],
    embeds: [SPOTIFY_RNB],
    excerpt: "Six songs, feather-light vocals, and one undeniable single. Pleasant, but it never quite catches fire. Sample review copy.",
    published_at: day("2026-11-03"),
    body: `This is a mood record. It knows it, and it never pretends to be more. The writing is sharp, the harmonies are stacked beautifully, and the single belongs on every late-night playlist this winter.

The problem is tempo. Five of six songs sit in the same pocket, and by the end the EP blurs. A warm flame, not a blaze.`,
  }),
  post({
    id: "low-end-theory-doc-review",
    title: "The Producer Documentary That Finally Gets the Studio Right",
    type: "review",
    review_kind: "movie",
    flame_score: 4.9,
    category: "Film & TV",
    read_time: 8,
    format: "vlog",
    tags: ["Documentary", "Producers", "Beatmaking"],
    embeds: [YT_B],
    excerpt: "No fake drama, no manufactured beef. Just ninety minutes of people who love drums. Sample review copy.",
    published_at: day("2026-10-29"),
    body: `Most music documentaries are about fame. This one is about work. Long takes of sessions, arguments about a snare, the quiet after a take everyone knows is the one.

## Why it lands

It trusts the audience. Nobody explains what a sampler is. The edit lets a beat build in real time, and when the drop comes the theater moves.

Near perfect. Bring a notebook.`,
  }),
  post({
    id: "runway-to-timeline",
    title: "The Runway Show That Was Really Built for Your Timeline",
    type: "review",
    review_kind: "fashion",
    flame_score: 2.3,
    category: "Fashion",
    read_time: 5,
    tags: ["Runway", "Fashion Review"],
    excerpt: "Big moments, small ideas. A collection designed to be clipped, not worn. Sample review copy.",
    published_at: day("2026-10-21"),
    body: `Every look was a screenshot. That was the point, and that is the problem. Strip away the staging and you are left with familiar silhouettes and a logo doing most of the lifting.

Two coats were great. The rest will live for a weekend in your feed and then disappear.`,
  }),

  // ───────── Culture Lives Here: articles ─────────
  post({
    id: "tiktok-is-the-new-ar",
    title: "TikTok Is the New A&R, and the Labels Know It",
    type: "article",
    category: "Culture",
    read_time: 9,
    tags: ["Music Business", "TikTok", "A&R"],
    embeds: [YT_A],
    excerpt: "Fifteen seconds now decides what gets a budget. Inside the pipeline from sound page to signed deal. Sample article copy.",
    published_at: day("2026-11-14"),
    body: `A song used to need a radio run to matter. Now it needs a sound page with momentum. Scouts watch creation counts the way they once watched spins.

## The new signal

Views are noise. Creations are signal. When thousands of people choose to build their own video on your sound, that is intent, and intent is what labels pay for.

## What it means for independent artists

You do not need permission anymore. You need a hook in the first three seconds, a clean upload to a commercial library, and the patience to post through the quiet weeks.

> Culture doesn't trickle down anymore. It bubbles up, fifteen seconds at a time.`,
  }),
  post({
    id: "sneaker-resale-cooldown",
    title: "The Sneaker Resale Cooldown Is Good for Everybody (Except Resellers)",
    type: "article",
    category: "Fashion",
    read_time: 6,
    tags: ["Sneakers", "Resale", "Streetwear"],
    excerpt: "Shelves are full, prices are falling, and people are wearing their pairs again. Sample article copy.",
    published_at: day("2026-11-09"),
    body: `For a decade the fun was the chase. Then the chase became a job. With resale margins shrinking, something healthy is happening: people are buying shoes to wear.

Brands are restocking classics, raffles are winnable, and the conversation is shifting back to design. The culture is better when the shoes touch pavement.`,
  }),
  post({
    id: "regional-sounds-2026",
    title: "Five Regional Sounds Running the Country Right Now",
    type: "article",
    category: "Music",
    read_time: 7,
    tags: ["Regional", "Hip-Hop", "Scenes"],
    embeds: [SPOTIFY_PLAYLIST],
    excerpt: "From bounce flips to Detroit punch-ins, the local scenes setting the national tempo. Sample article copy.",
    published_at: day("2026-11-05"),
    body: `The monoculture is gone, and the map is more interesting for it. Here are five scenes worth your headphones this month.

- New Orleans bounce, rebuilt for 2026 with half-time bridges.
- Detroit, still punching in and still undefeated on punchlines.
- The Bay, quietly making the best party records in the country.
- Houston, slowed down and louder than ever.
- Atlanta, because of course.

Each one has its own tempo range, and each one is worth a playlist of its own.`,
  }),
  post({
    id: "creator-economy-grows-up",
    title: "The Creator Economy Finally Grew Up. Here's What Changed.",
    type: "article",
    category: "Culture",
    read_time: 8,
    format: "vlog",
    tags: ["Creator Economy", "Business"],
    embeds: [YT_B],
    excerpt: "Brand deals got smarter, affiliate got bigger, and audiences got pickier. Sample article copy.",
    published_at: day("2026-10-30"),
    body: `The easy money is gone and the real money showed up. Brands stopped paying for follower counts and started paying for conversion, which rewards creators who actually know their audience.

## Three shifts

- Affiliate income now outpaces flat-fee deals for mid-size creators.
- Long-form is back because trust is built in minutes, not seconds.
- Owning your audience (email, community, site) is the only real insurance.`,
  }),
  post({
    id: "why-the-mixtape-still-matters",
    title: "Why the Mixtape Still Matters in the Playlist Era",
    type: "article",
    category: "Music",
    read_time: 5,
    tags: ["Mixtapes", "DJ Culture"],
    excerpt: "Sequencing is an art. The algorithm can't do what a great DJ does in one blend. Sample article copy.",
    published_at: day("2026-10-24"),
    body: `A playlist is a list. A mixtape is an argument. The order matters, the transitions matter, and the tempo tells a story from the first track to the last.

That is the whole idea behind how we build playlists here: by BPM, by key, by feel. Culture lives in the blend.`,
  }),
  post({
    id: "sports-tunnel-fits",
    title: "The Tunnel Walk Is the New Red Carpet",
    type: "article",
    category: "Sports",
    read_time: 4,
    tags: ["Sports", "Style"],
    excerpt: "Stylists, sponsorships and seven seconds of camera time: how the pregame walk became fashion week. Sample article copy.",
    published_at: day("2026-10-18"),
    body: `Before tip-off there is a runway. Athletes have stylists on retainer and brands plan drops around game schedules.

It works because it is real. These are people with taste, money and an audience, walking to work.`,
  }),

  // ───────── Creator Corner ─────────
  post({
    id: "tiktok-shop-first-1000",
    title: "How to Make Your First $1,000 on TikTok Shop Without Going Viral",
    type: "creator",
    category: "TikTok Shop",
    read_time: 8,
    featured: true,
    tags: ["TikTok Shop", "Affiliate", "Beginner"],
    excerpt: "You don't need a million views. You need three products, a repeatable format, and thirty days. Sample post copy.",
    published_at: day("2026-11-13"),
    body: `Viral is a lottery ticket. Consistency is a paycheck. Here is the plan I would follow if I were starting from zero today.

## Step 1: pick three products you would actually use

Request samples for products in one niche. Selling what you understand shows on camera.

## Step 2: build one format and repeat it

Hook, problem, demo, proof, call to action. Film five versions of the same structure before you change anything.

## Step 3: post daily for thirty days

Review your numbers weekly, not hourly. Double down on the product that converts, not the video with the most views.`,
  }),
  post({
    id: "hook-formulas-that-work",
    title: "7 Hook Formulas That Stop the Scroll in Under 3 Seconds",
    type: "creator",
    category: "Creator Tips",
    read_time: 5,
    format: "vlog",
    tags: ["Hooks", "Scripting"],
    embeds: [YT_A],
    excerpt: "Copy these, change the nouns, and film today. Sample post copy.",
    published_at: day("2026-11-11"),
    body: `The first three seconds decide everything. These are the seven structures I keep coming back to.

- "Stop buying ___ until you see this."
- "I tested ___ so you don't have to."
- "Nobody tells you this about ___."
- "The ___ I wish I had a year ago."
- "This is why your ___ isn't working."
- "Three things I'd never do as a ___."
- "POV: you finally found ___."

Say the hook to camera and put it on screen as text. Do both, every time.`,
  }),
  post({
    id: "ugc-rate-card",
    title: "What to Charge for UGC in 2026: A Real Rate Card",
    type: "creator",
    category: "Monetization",
    read_time: 7,
    tags: ["UGC", "Rates", "Brand Deals"],
    excerpt: "Base rates, usage rights, whitelisting and the add-ons most creators forget to bill. Sample post copy.",
    published_at: day("2026-11-08"),
    body: `Pricing is a skill. Underpricing is a habit. Start with a base rate per deliverable, then add for everything that extends the brand's use of your work.

## The add-ons that matter

- Usage rights: charge per 30 days of paid usage.
- Whitelisting: your handle is an asset, price it like one.
- Raw footage: it has value, so it has a price.
- Rush fees: under 72 hours costs more.

Send a rate card as a PDF, not a paragraph in an email.`,
  }),
  post({
    id: "my-2026-filming-kit",
    title: "My 2026 Filming Kit: Everything in the Bag",
    type: "creator",
    category: "Gear & Workflow",
    read_time: 6,
    format: "vlog",
    tags: ["Gear", "Camera", "Audio"],
    embeds: [YT_B],
    excerpt: "One camera, two lights, one mic. The whole setup and what I would cut first. Sample post copy.",
    published_at: day("2026-11-04"),
    body: `Gear doesn't make the video, but bad audio will ruin it. If you only upgrade one thing, upgrade the mic.

## The kit

- A pocket gimbal camera for anything handheld.
- A wireless lav set that lives in my jacket.
- Two small LED panels with diffusion.
- A phone, still the best B-camera there is.

## What I would cut

The second light. Window light and one panel covers most days.`,
  }),
  post({
    id: "batch-filming-workflow",
    title: "The Batch Filming Workflow That Gave Me My Weekends Back",
    type: "creator",
    category: "Gear & Workflow",
    read_time: 5,
    tags: ["Workflow", "Productivity"],
    excerpt: "Script Monday, film Tuesday, edit Wednesday. A week of content in three working days. Sample post copy.",
    published_at: day("2026-10-31"),
    body: `Posting daily doesn't mean filming daily. Split the week by task, not by video.

Monday is for writing hooks and shot lists. Tuesday is for filming everything in one setup. Wednesday is for editing with templates. Thursday and Friday are for community and brand work.`,
  }),
  post({
    id: "commercial-sounds-explained",
    title: "Commercial Sounds Explained: Keep Your TikTok Shop Videos Safe",
    type: "creator",
    category: "TikTok Shop",
    read_time: 6,
    tags: ["Commercial Sounds", "TikTok Shop", "Music Licensing"],
    excerpt: "Why trending audio can get a shoppable video muted, and what to use instead. Sample post copy.",
    published_at: day("2026-10-27"),
    body: `If your video sells a product, it is commercial content, and commercial content needs commercially cleared music. That is what the Commercial Music Library is for.

## The short version

- Use sounds from the Commercial Music Library on shoppable videos.
- Trending sounds can get a video muted or removed.
- Original audio you record yourself is always safe.

I keep a full directory of my own cleared sounds on the Music page so you can grab one and go.`,
  }),
  post({
    id: "affiliate-vs-brand-deals",
    title: "Affiliate vs. Brand Deals: Where the Money Really Is",
    type: "creator",
    category: "Monetization",
    read_time: 6,
    tags: ["Affiliate", "Brand Deals", "Income"],
    excerpt: "One pays today. The other pays every day. How I split my time between them. Sample post copy.",
    published_at: day("2026-10-22"),
    body: `A brand deal is a paycheck. Affiliate is a pipeline. You want both, in a ratio that matches your audience size.

Under fifty thousand followers, lean affiliate. Past that, flat fees start to make sense, but keep commission in every contract you can.`,
  }),
  post({
    id: "lighting-on-a-budget",
    title: "Lighting on a Budget: The $60 Setup",
    type: "creator",
    category: "Creator Tips",
    read_time: 4,
    tags: ["Lighting", "Budget"],
    excerpt: "A window, a white sheet and one clamp light. That's it. Sample post copy.",
    published_at: day("2026-10-16"),
    body: `Face the window. Hang a white sheet if the sun is direct. Put one warm clamp light behind you for separation.

That is the entire setup, and it will beat a ring light every time.`,
  }),
  post({
    id: "reading-your-analytics",
    title: "The Only Four Analytics Numbers That Matter",
    type: "creator",
    category: "Creator Tips",
    read_time: 5,
    tags: ["Analytics", "Growth"],
    excerpt: "Ignore the vanity metrics. Watch these four and your content gets better every week. Sample post copy.",
    published_at: day("2026-10-12"),
    body: `Views are the result, not the lever. These four numbers are the levers.

- Three-second hold: is the hook working?
- Average watch time: is the middle working?
- Completion rate: did you earn the ending?
- Shares: did anyone care enough to send it?`,
  }),
];

function episode(e: Partial<Episode> & Pick<Episode, "id" | "show" | "number" | "title" | "description" | "published_at">): Episode {
  return {
    show_notes: "",
    audio_url: audio(e.number),
    duration: 2400,
    cover_image: img(e.id, 800, 800),
    guests: [],
    tags: [],
    spotify_url: "https://open.spotify.com/",
    apple_url: "https://podcasts.apple.com/",
    youtube_url: "https://www.youtube.com/",
    status: "published",
    ...e,
  };
}

const NOTES = `## In this episode

- Cold open and what we've been listening to this week
- The main conversation
- Listener questions

## Links

Everything mentioned is linked on the Culture Lives Here blog.`;

export const episodes: Episode[] = [
  episode({
    id: "clh-004",
    show: "culture-lives-here",
    number: 4,
    title: "Who Owns a Sound? Sampling, Credit and the Culture",
    description: "A producer and an entertainment lawyer walk into a studio. We talk clearances, interpolations and why credit matters more than ever.",
    duration: 3540,
    guests: [`Maya Reyes | ${img("guest-maya", 200, 200)}`, `Dre Lawson | ${img("guest-dre", 200, 200)}`],
    tags: ["Sampling", "Music Business", "Producers"],
    show_notes: NOTES,
    published_at: day("2026-11-11"),
  }),
  episode({
    id: "clh-003",
    show: "culture-lives-here",
    number: 3,
    title: "Streetwear After the Hype",
    description: "What happens to a scene when the lines disappear? A designer on building a brand people wear instead of flip.",
    duration: 3120,
    guests: [`Jordan Okafor | ${img("guest-jordan", 200, 200)}`],
    tags: ["Fashion", "Streetwear", "Founders"],
    show_notes: NOTES,
    published_at: day("2026-10-28"),
  }),
  episode({
    id: "clh-002",
    show: "culture-lives-here",
    number: 2,
    title: "The Creator Middle Class",
    description: "You don't need ten million followers to make a living. Real numbers from creators doing it full time.",
    duration: 2880,
    guests: [`Tasha Bell | ${img("guest-tasha", 200, 200)}`],
    tags: ["Creator Economy", "Money"],
    show_notes: NOTES,
    published_at: day("2026-10-14"),
  }),
  episode({
    id: "clh-001",
    show: "culture-lives-here",
    number: 1,
    title: "Culture Lives Here: The Mission",
    description: "Episode one. Why this network exists, who it's for, and what we're building.",
    duration: 1980,
    tags: ["Intro", "The Wifii"],
    show_notes: NOTES,
    published_at: day("2026-09-30"),
  }),
  episode({
    id: "ci-004",
    show: "culturally-inappropriate",
    number: 4,
    title: "Unpopular Opinions: Album Rollouts Are Too Long",
    description: "Hot takes only. Six singles before an album is five too many, and we will not be taking questions.",
    duration: 2640,
    guests: [`Chris Monroe | ${img("guest-chris", 200, 200)}`],
    tags: ["Hot Takes", "Music"],
    show_notes: NOTES,
    published_at: day("2026-11-06"),
  }),
  episode({
    id: "ci-003",
    show: "culturally-inappropriate",
    number: 3,
    title: "The Group Chat Reads Your Comments",
    description: "We read the wildest comments from the week and rank them. Nobody is safe, including us.",
    duration: 2280,
    tags: ["Comedy", "Internet Culture"],
    show_notes: NOTES,
    published_at: day("2026-10-23"),
  }),
  episode({
    id: "ci-002",
    show: "culturally-inappropriate",
    number: 2,
    title: "Is It a Classic or Are You Just Nostalgic?",
    description: "We put ten beloved albums on trial. The verdicts will upset you.",
    duration: 3300,
    guests: [`Nia Carter | ${img("guest-nia", 200, 200)}`, `Sam Ortiz | ${img("guest-sam", 200, 200)}`],
    tags: ["Debate", "Albums"],
    show_notes: NOTES,
    published_at: day("2026-10-09"),
  }),
  episode({
    id: "ci-001",
    show: "culturally-inappropriate",
    number: 1,
    title: "Welcome to the Show Nobody Approved",
    description: "The pilot. Ground rules, bad ideas, and a segment we already regret.",
    duration: 1860,
    tags: ["Intro", "Comedy"],
    show_notes: NOTES,
    published_at: day("2026-09-25"),
  }),
];

function work(p: Partial<PortfolioItem> & Pick<PortfolioItem, "id" | "title" | "client" | "category" | "stats" | "description" | "sort">): PortfolioItem {
  return { media_type: "video", media_url: SAMPLE_VIDEO, thumbnail: img(p.id, 720, 1280), status: "published", ...p };
}

export const portfolio: PortfolioItem[] = [
  work({ id: "pf-wireless-mic", sort: 1, title: "Wireless Mic Unboxing & Sound Test", client: "Halo Audio", category: "tiktok-shop-ugc", stats: "1.8M views · 4.2K orders", description: "Shoppable demo built around a single hook: “your videos sound bad and this is why.”" }),
  work({ id: "pf-fall-capsule", sort: 2, title: "Fall Capsule Launch Film", client: "Northside Supply", category: "brand-campaign", media_type: "youtube", media_url: YT_A, thumbnail: img("pf-fall-capsule", 1280, 720), stats: "620K views · 3 deliverables", description: "A 45-second launch film plus cutdowns for paid social." }),
  work({ id: "pf-day-in-life", sort: 3, title: "Day in the Life: Studio Edition", client: "Original", category: "viral", stats: "5.1M views · 410K likes", description: "Organic vlog-style piece that became the most shared video on the page." }),
  work({ id: "pf-skincare-ugc", sort: 4, title: "3-Step Routine UGC Package", client: "Glow Theory", category: "tiktok-shop-ugc", stats: "6 videos · 3.1x ROAS", description: "Six-video UGC package with hook variations for creative testing." }),
  work({ id: "pf-headphone-campaign", sort: 5, title: "“Hear the Culture” Campaign", client: "Halo Audio", category: "brand-campaign", media_type: "youtube", media_url: YT_B, thumbnail: img("pf-headphone-campaign", 1280, 720), stats: "2.3M impressions", description: "Hero spot and podcast read across both shows." }),
  work({ id: "pf-beat-challenge", sort: 6, title: "The 60-Second Beat Challenge", client: "Original", category: "viral", stats: "8.7M views · 22K creations", description: "A beat made live in one minute. The sound was used in over twenty thousand videos." }),
  work({ id: "pf-desk-setup", sort: 7, title: "Creator Desk Setup Tour", client: "Deskline", category: "tiktok-shop-ugc", stats: "940K views · 1.9K orders", description: "Five products, one tour, every item tagged." }),
  work({ id: "pf-sneaker-drop", sort: 8, title: "Sneaker Drop Countdown Series", client: "Stride Lab", category: "brand-campaign", stats: "4-part series · 1.4M views", description: "Daily countdown content leading into a regional release." }),
  work({ id: "pf-street-interview", sort: 9, title: "What Song Is Stuck in Your Head?", client: "Original", category: "viral", stats: "3.4M views", description: "Street interview format that doubles as a playlist discovery series." }),
];

function track(t: Partial<Track> & Pick<Track, "id" | "kind" | "title" | "bpm" | "musical_key" | "genre" | "sort">): Track {
  const priced = t.kind !== "cml";
  return {
    artist: "The Wifii",
    moods: [],
    audio_url: audio(((t.sort - 1) % 16) + 1),
    cover_image: img(t.id, 600, 600),
    duration: 180,
    price_mp3: priced ? 35 : null,
    price_wav: priced ? 60 : null,
    price_stems: priced ? 150 : null,
    tiktok_url: "",
    usage_tip: "",
    description: "",
    status: "published",
    ...t,
  };
}

const TIKTOK_SOUND = "https://www.tiktok.com/@thewifii_";

export const tracks: Track[] = [
  track({ id: "beat-gold-rush", sort: 1, kind: "beat", title: "Gold Rush", bpm: 142, musical_key: "F minor", genre: "Trap", moods: ["Dark", "Hard"], duration: 172, description: "Sliding 808s and a haunted bell lead." }),
  track({ id: "beat-espresso", sort: 2, kind: "beat", title: "Espresso", bpm: 96, musical_key: "A minor", genre: "Boom Bap", moods: ["Warm", "Soulful"], duration: 198, description: "Dusty keys, swung drums, room for a storyteller." }),
  track({ id: "beat-after-hours", sort: 3, kind: "beat", title: "After Hours", bpm: 108, musical_key: "D♭ major", genre: "R&B", moods: ["Smooth", "Late Night"], duration: 204, description: "Glassy Rhodes and a slow-burn bassline." }),
  track({ id: "beat-block-party", sort: 4, kind: "beat", title: "Block Party", bpm: 100, musical_key: "G minor", genre: "Bounce", moods: ["Upbeat", "Party"], duration: 165, description: "Call-and-response chops built for a crowd." }),
  track({ id: "beat-sand-dunes", sort: 5, kind: "beat", title: "Sand Dunes", bpm: 124, musical_key: "E minor", genre: "Afrobeats", moods: ["Sunny", "Groove"], duration: 188, description: "Log drums and a guitar loop that won't leave your head." }),
  track({ id: "beat-pressure", sort: 6, kind: "beat", title: "Pressure", bpm: 150, musical_key: "C minor", genre: "Drill", moods: ["Aggressive", "Energy"], duration: 160, description: "Sliding bass and choir stabs.", price_mp3: 40, price_wav: 70, price_stems: 175 }),

  track({ id: "ref-say-less", sort: 7, kind: "reference", title: "Say Less (Reference)", bpm: 92, musical_key: "B♭ minor", genre: "R&B", moods: ["Female Vocal", "Hook + 2 Verses"], duration: 196, description: "Full vocal demo with stacked harmonies. Topline and lyrics included.", price_mp3: 250, price_wav: 400, price_stems: 750 }),
  track({ id: "ref-city-lights", sort: 8, kind: "reference", title: "City Lights (Reference)", bpm: 118, musical_key: "F♯ minor", genre: "Pop", moods: ["Male Vocal", "Radio Ready"], duration: 184, description: "Up-tempo pop demo written for a crossover single.", price_mp3: 250, price_wav: 400, price_stems: 750 }),
  track({ id: "ref-no-days-off", sort: 9, kind: "reference", title: "No Days Off (Reference)", bpm: 140, musical_key: "D minor", genre: "Hip-Hop", moods: ["Hook Only", "Anthem"], duration: 96, description: "Hook-only reference for an artist to write verses around.", price_mp3: 150, price_wav: 250, price_stems: 500 }),
  track({ id: "ref-slow-dance", sort: 10, kind: "reference", title: "Slow Dance (Reference)", bpm: 72, musical_key: "E♭ major", genre: "Soul", moods: ["Duet", "Ballad"], duration: 221, description: "Duet ballad demo with live keys.", price_mp3: 300, price_wav: 450, price_stems: 800 }),

  track({ id: "cml-add-to-cart", sort: 11, kind: "cml", title: "Add to Cart", bpm: 120, musical_key: "C major", genre: "Upbeat Pop", moods: ["Unboxing", "Hauls"], duration: 62, tiktok_url: TIKTOK_SOUND, usage_tip: "The drop lands at 0:07. Time your product reveal to it.", description: "Bright, bouncy and built for product reveals." }),
  track({ id: "cml-clean-girl", sort: 12, kind: "cml", title: "Soft Reset", bpm: 88, musical_key: "G major", genre: "Lo-fi", moods: ["Skincare", "Routines"], duration: 58, tiktok_url: TIKTOK_SOUND, usage_tip: "Works under voiceover: no lead melody for the first 20 seconds.", description: "Calm lo-fi bed for routines and get-ready-with-me videos." }),
  track({ id: "cml-flash-sale", sort: 13, kind: "cml", title: "Flash Sale", bpm: 128, musical_key: "A minor", genre: "House", moods: ["Deals", "Countdown"], duration: 45, tiktok_url: TIKTOK_SOUND, usage_tip: "Cut on every fourth beat for fast deal lists.", description: "Four-on-the-floor energy for urgency and countdowns." }),
  track({ id: "cml-desk-setup", sort: 14, kind: "cml", title: "Night Shift", bpm: 100, musical_key: "D minor", genre: "Chill Trap", moods: ["Tech", "Desk Setups"], duration: 60, tiktok_url: TIKTOK_SOUND, usage_tip: "Great for slow pans and B-roll. Loop point at 0:30.", description: "Moody, clean and made for tech and desk content." }),
  track({ id: "cml-kitchen-hack", sort: 15, kind: "cml", title: "Sunday Kitchen", bpm: 112, musical_key: "F major", genre: "Funk", moods: ["Cooking", "Home"], duration: 54, tiktok_url: TIKTOK_SOUND, usage_tip: "The bass break at 0:15 is a natural spot for a before/after cut.", description: "Feel-good funk groove for kitchen and home finds." }),
  track({ id: "cml-fit-check", sort: 16, kind: "cml", title: "Fit Check", bpm: 98, musical_key: "E minor", genre: "Hip-Hop", moods: ["Fashion", "Try-Ons"], duration: 48, tiktok_url: TIKTOK_SOUND, usage_tip: "Change outfits on the snare. It hits on beats two and four.", description: "Head-nod drums for try-ons and outfit transitions." }),
];

export const playlists: Playlist[] = [
  { id: "pl-culture-rotation", sort: 1, status: "published", title: "Culture Rotation", description: "What's in heavy rotation at Culture Lives Here this week. Updated every Friday.", spotify_id: "37i9dQZF1DX0XUsuxWHRQd", moods: ["Hip-Hop", "New Music", "Energy"], highlights: ["Sample Track One — Artist A", "Sample Track Two — Artist B", "Sample Track Three — Artist C"], cover_image: img("pl-rotation", 800, 800), curator: "The Wifii" },
  { id: "pl-after-hours", sort: 2, status: "published", title: "After Hours R&B", description: "Slow tempos and soft keys for when the group chat goes quiet.", spotify_id: "37i9dQZF1DX4SBhb3fqCJd", moods: ["R&B", "Late Night", "70–95 BPM"], highlights: ["Sample Slow Jam — Artist D", "Sample Ballad — Artist E", "Sample Groove — Artist F"], cover_image: img("pl-afterhours", 800, 800), curator: "The Wifii" },
  { id: "pl-live-warmup", sort: 3, status: "published", title: "TikTok Live Warmup", description: "The set that opens every live: steady 98–115 BPM so the room builds without rushing.", spotify_id: "37i9dQZF1DXcBWIGoYBM5M", moods: ["Warmup", "98–115 BPM", "Feel Good"], highlights: ["Sample Opener — Artist G", "Sample Builder — Artist H", "Sample Peak — Artist I"], cover_image: img("pl-warmup", 800, 800), curator: "The Wifii" },
  { id: "pl-studio-focus", sort: 4, status: "published", title: "Studio Focus", description: "Instrumentals for editing days and long sessions. No lyrics, no distractions.", spotify_id: "37i9dQZF1DWWQRwui0ExPn", moods: ["Lo-fi", "Focus", "Instrumental"], highlights: ["Sample Loop — Producer J", "Sample Tape — Producer K", "Sample Keys — Producer L"], cover_image: img("pl-focus", 800, 800), curator: "Culture Lives Here" },
  { id: "pl-sunday-reset", sort: 5, status: "published", title: "Sunday Reset", description: "Soul, gospel chords and easy grooves to start the week right.", spotify_id: "37i9dQZF1DX4dyzvuaRJ0n", moods: ["Soul", "Easy", "Weekend"], highlights: ["Sample Hymn — Artist M", "Sample Groove — Artist N", "Sample Closer — Artist O"], cover_image: img("pl-sunday", 800, 800), curator: "Culture Lives Here" },
];

function product(p: Partial<Product> & Pick<Product, "id" | "name" | "price" | "category" | "description" | "sort">): Product {
  return {
    slug: p.id,
    badge: "",
    image: img(p.id, 900, 1125),
    gallery: [img(`${p.id}-b`, 900, 1125), img(`${p.id}-c`, 900, 1125)],
    sizes: ["S", "M", "L", "XL"],
    in_stock: true,
    status: "published",
    ...p,
  };
}

export const products: Product[] = [
  product({ id: "culture-lives-here-hoodie", sort: 1, name: "Culture Lives Here Heavyweight Hoodie", price: 85, category: "Hoodies", badge: "New Drop", description: "14oz brushed fleece, boxy fit, puff-print wordmark across the chest." }),
  product({ id: "wifii-wordmark-tee", sort: 2, name: "THE WIFII Wordmark Tee", price: 38, category: "Tees", badge: "Best Seller", description: "Garment-dyed heavyweight cotton with a tonal front print." }),
  product({ id: "iamtheculture-crewneck", sort: 3, name: "Iamtheculture Crewneck", price: 70, category: "Crewnecks", description: "Espresso crewneck with sand chain-stitch embroidery." }),
  product({ id: "burn-notice-tee", sort: 4, name: "Burn Notice Flame Tee", price: 40, category: "Tees", badge: "Limited", description: "Five flames on the back. Wear it when the album is good." }),
  product({ id: "culture-dad-cap", sort: 5, name: "Culture Dad Cap", price: 32, category: "Headwear", sizes: ["One Size"], description: "Unstructured six-panel in washed black with gold embroidery." }),
  product({ id: "studio-sweatpants", sort: 6, name: "Studio Sweatpants", price: 68, category: "Bottoms", description: "Relaxed open-hem sweats made for long sessions." }),
  product({ id: "tour-tote", sort: 7, name: "Record Store Tote", price: 24, category: "Accessories", sizes: ["One Size"], description: "Heavy canvas tote sized for twelve-inch records." }),
  product({ id: "culturally-inappropriate-tee", sort: 8, name: "Culturally Inappropriate Podcast Tee", price: 38, category: "Tees", in_stock: false, badge: "Sold Out", description: "The shirt the show's lawyers asked us not to make." }),
];

export const seed = { posts, episodes, portfolio, tracks, playlists, products };
