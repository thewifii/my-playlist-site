# The Wifii / Culture Lives Here

The website for **The Wifii** (`@thewifii_`) and the **Culture Lives Here** media network (`@cultureliveshere`): editorial and reviews, podcasts, a beat store, merch, playlists, a CMS dashboard and a private AI DJ setlist builder.

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI + shadcn/ui, Motion and Lucide. It runs on Cloudflare with **D1** (database) and **R2** (file uploads) through [OpenNext for Cloudflare](https://opennext.js.org/cloudflare).

## What's in the box

| Area | Routes |
| --- | --- |
| Landing page | `/` |
| Main site | `/home`, `/about`, `/portfolio`, `/creator-corner`, `/contact` |
| Iamtheculture hub | `/iamtheculture`, `/culture-lives-here`, `/podcasts`, `/music`, `/merch`, `/playlists` |
| CMS | `/login` → `/dashboard` (content, inbox, contributors) |
| Private DJ builder | `/dj-builder` (admin password, not linked or indexed) |

Every page works out of the box with built-in sample content. Nothing needs to be configured to preview the site.

## Coming-soon mode (temporary)

The site ships with a pre-launch switch turned **on**: `COMING_SOON = true` in `src/lib/site.ts`.

- Visitors see only the "Coming soon" page at `/` (site name, newsletter signup, TikTok follow link and the GetSongBPM attribution link in the footer). Every other public page redirects there.
- Signed-in admins and contributors see the full site, so you can replace the sample content and preview it before launch. Sign in at `/login`.
- **To launch:** set `COMING_SOON` to `false`, commit and push. You can then delete `src/components/site/coming-soon.tsx` and the two lines that reference it in `src/app/(landing)/page.tsx`.

## Run it locally

Requires Node.js 22.18 or newer.

```bash
npm install
```

```bash
cp .env.example .env.local
```

Set at least `ADMIN_PASSWORD` in `.env.local`, then:

```bash
npm run dev
```

Open http://localhost:3000. Sign in at `/login` with `admin@thewifii.com` and your `ADMIN_PASSWORD`.

Until the database is initialised the site runs in **preview mode**: it serves the sample content from memory, and dashboard edits reset when the server restarts. To use a real local database instead:

```bash
npm run db:init:local
```

## Go live on Cloudflare

You need a Cloudflare account and this repository on GitHub. Steps 1–3 are one-time setup from your computer.

### 1. Sign in to Cloudflare

```bash
npx wrangler login
```

### 2. Create the D1 database

```bash
npx wrangler d1 create thewifii-db
```

Copy the `database_id` it prints into `wrangler.toml`, replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`. Then create the tables and load the sample content in one command:

```bash
npm run db:init:remote
```

That runs `npx wrangler d1 execute thewifii-db --remote --file=./schema.sql` followed by the same for `seed.sql`. Both files are safe to re-run.

### 3. Create the R2 bucket

```bash
npx wrangler r2 bucket create thewifii-media
```

The bucket name already matches `wrangler.toml`. Uploaded files are served through `/api/media/...`, so the bucket does not need to be public.

### 4. Connect the GitHub repo

Commit and push the `wrangler.toml` change, then in the Cloudflare dashboard:

1. Go to **Workers & Pages → Create → Import a repository** and pick this repo.
2. Set the **build command** to `npx opennextjs-cloudflare build`.
3. Set the **deploy command** to `npx opennextjs-cloudflare deploy`.
4. Save and deploy. Every push to `main` now redeploys the site.

The project name in Cloudflare must match `name = "thewifii"` in `wrangler.toml`. If you are reusing an existing project, change `name` to match it.

> **Why Workers and not classic Pages?** Cloudflare now runs full-stack Next.js apps as a Worker with static assets, and `@cloudflare/next-on-pages` is deprecated. The GitHub-connected workflow, custom domains, D1 and R2 all work the same way. You can also deploy from your own machine at any time with `npm run deploy`.

### 5. Add your secrets

In the Cloudflare dashboard open the project, then **Settings → Variables and Secrets**, and add each one as a **Secret**. Or from the terminal:

```bash
npx wrangler secret put ADMIN_PASSWORD
```

| Secret | Needed for | Notes |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Dashboard and DJ builder | Required. Long and random. |
| `ANTHROPIC_API_KEY` | AI DJ chat | From console.anthropic.com |
| `SPOTIFY_CLIENT_ID` | DJ builder | From your Spotify Developer App |
| `SPOTIFY_CLIENT_SECRET` | DJ builder | From your Spotify Developer App |
| `SPOTIFY_REFRESH_TOKEN` | Pushing playlists | Created in step 7 |
| `GETSONGBPM_API_KEY` | Optional tempo fallback | See "Tempo data" below |

Optional overrides (`ADMIN_EMAIL`, `SESSION_SECRET`, `ANTHROPIC_MODEL`, `SPOTIFY_REDIRECT_URI`) are documented in `.env.example`.

### 6. Point thewifii.com at it

In the project, open **Settings → Domains & Routes → Add → Custom domain** and enter `thewifii.com`. If the domain's DNS is on Cloudflare this takes about a minute. `SITE_URL` in `wrangler.toml` is already set to `https://thewifii.com`.

### 7. Connect Spotify (one time)

1. In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), open your app and add the redirect URI `https://thewifii.com/api/spotify/callback`.
2. Sign in at `https://thewifii.com/dj-builder`, then click **Connect Spotify** (or open `/api/spotify/login`).
3. Approve access. The callback page saves the refresh token to D1 and shows it so you can also store it as the `SPOTIFY_REFRESH_TOKEN` secret.

For local development, add `http://127.0.0.1:3000/api/spotify/callback` as a second redirect URI and browse the site at `http://127.0.0.1:3000`. Spotify does not accept `localhost`.

## The dashboard

- **Sign in:** the footer's "Contributor Sign In" link, or `/login`. The admin uses `admin@thewifii.com` (change with `ADMIN_EMAIL`) and `ADMIN_PASSWORD`.
- **Content:** articles and 5 Flame reviews, podcast episodes, portfolio items, beats and TikTok CML sounds, playlists and merch. Each has a table, search, and an editor with draft and publish.
- **5 Flame Burn Notice Score:** set a post's section to "5 Flame Review" and the live 0.0–5.0 slider appears in the editor. The same animated meter is shown on the published review.
- **Uploads:** image, audio and video fields have an Upload button that stores the file in R2 (40 MB limit). You can always paste an external URL instead.
- **Inbox:** brand inquiries, contact messages, license requests, merch order requests and newsletter signups.
- **Contributors (admin only):** add a contributor with a starting password, or remove one. Contributors can create, edit and publish; only the admin can delete content, manage contributors or open the DJ builder.

## The DJ setlist builder

`/dj-builder` is protected by middleware that checks a signed session cookie issued only for the correct `ADMIN_PASSWORD`. The same check covers `/api/dj/*` and `/api/spotify/*`. The page is excluded from the navigation, footer, `sitemap.xml` and `robots.txt`, and is marked `noindex`.

- **Left panel:** streaming chat with Claude (`claude-sonnet-5-5` by default; change with `ANTHROPIC_MODEL`) and three quick prompts.
- **Right panel:** the staged setlist with cover art, BPM, key, Camelot code and duration. Remove or reorder tracks, rename the playlist, then **Push to Spotify**.
- **Claude's tools** (all run on the server): `search_spotify_tracks`, `get_track_tempo_and_key`, `stage_setlist` and `create_spotify_playlist`.

API keys and Spotify secrets are read only in server code. Nothing sensitive is sent to the browser.

### Tempo data

BPM and key come from MusicBrainz + AcousticBrainz by default, which needs no key. AcousticBrainz stopped adding new recordings in 2022, so recent releases often have no data. Setting `GETSONGBPM_API_KEY` adds [GetSongBPM](https://getsongbpm.com/api) as a fallback for those tracks. GetSongBPM requires a visible backlink, which is in the footer of every page: "Tempo data powered by GetSongBPM".

## Editing the site

| To change | Edit |
| --- | --- |
| Names, social links, emails, About-page stats, press and brand lists | `src/lib/site.ts` |
| Colours and fonts | `src/app/globals.css` |
| Content types and their dashboard fields | `src/lib/collections.ts` |
| Sample content | `src/lib/seed-data.ts` |

After changing `collections.ts` or `seed-data.ts`, regenerate the SQL files:

```bash
npm run db:generate
```

The About-page numbers, brand names and press quotes, and all posts, episodes, tracks, products and playlists, are **sample placeholders**. Replace them before launch.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production Next.js build |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Rebuild `schema.sql` and `seed.sql` |
| `npm run db:init:local` / `db:init:remote` | Apply schema and seed to local or live D1 |
| `npm run preview` | Build and run the Cloudflare Worker locally |
| `npm run deploy` | Build and deploy to Cloudflare from your machine |

## Security notes

- `.env`, `.env.local` and `.dev.vars` are gitignored. Only `.env.example` is committed.
- Sessions are HMAC-signed cookies (`HttpOnly`, `SameSite=Lax`, `Secure` on HTTPS) created with the Web Crypto API, so the same code runs in middleware and on Workers.
- Contributor passwords are stored as salted PBKDF2-SHA256 hashes.
- There is no login rate limiting yet. Add a Cloudflare rate limiting rule for `/api/auth/login` before sharing contributor accounts widely.
- Merch checkout and beat licensing collect a request and an email address; no payment is taken on the site in V1.
