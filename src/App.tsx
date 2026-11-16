import { Gauge, KeyRound, Lock, Music2, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  example: string
}

const features: Feature[] = [
  {
    icon: Gauge,
    title: 'BPM & Tempo Matching',
    description:
      'Set a target tempo or a range and get tracks that actually sit in it. Build a steady 172 BPM run mix or a set that climbs ten beats at a time.',
    example: '120 → 128 BPM',
  },
  {
    icon: KeyRound,
    title: 'Harmonic Key Mixing',
    description:
      'Songs are ordered by compatible keys, so every transition lands in tune. No more jarring clashes between tracks.',
    example: '8A → 9A → 9B',
  },
  {
    icon: Sparkles,
    title: 'Custom Mood Curation',
    description:
      'Describe the feeling in your own words and the curator translates it into energy, tempo and tone.',
    example: '“Late-night drive, windows down”',
  },
]

const sampleTracks = [
  { bpm: 122, key: '8A', height: 'h-8' },
  { bpm: 124, key: '8A', height: 'h-11' },
  { bpm: 124, key: '9A', height: 'h-9' },
  { bpm: 126, key: '9A', height: 'h-14' },
  { bpm: 126, key: '9B', height: 'h-12' },
  { bpm: 128, key: '9B', height: 'h-16' },
  { bpm: 128, key: '10B', height: 'h-20' },
]

const currentYear = new Date().getFullYear()

function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a href="/" className="flex flex-col leading-none" aria-label="The HOTSPOT Vibe Curator, home">
          <span className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            The <span className="text-primary">HOTSPOT</span>
          </span>
          <span className="mt-1.5 text-[0.7rem] font-medium tracking-[0.28em] text-muted-foreground uppercase sm:text-xs">
            Vibe Curator
          </span>
        </a>
        <Badge
          variant="outline"
          className="h-7 border-primary/40 bg-primary/10 px-3 text-primary"
        >
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          Coming Soon
        </Badge>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[28rem] max-w-3xl rounded-full bg-primary/20 blur-[120px]"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-24">
        <p className="mb-6 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          AI-powered playlists for Spotify
        </p>
        <h1 className="max-w-4xl font-heading text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Curate Playlists by Exact{' '}
          <span className="bg-gradient-to-r from-primary to-[oklch(0.7_0.2_10)] bg-clip-text text-transparent">
            Tempo, Key &amp; Vibe
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          Tell it the BPM you want and the mood you&rsquo;re in. The HOTSPOT
          builds a playlist where every track matches your tempo and flows
          into the next.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Button size="lg" disabled className="h-12 gap-2 px-6 text-base">
            <Music2 className="size-5" aria-hidden="true" />
            Connect Spotify
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" />
            Preview only. Sign-in opens at launch.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="mt-16 flex items-end justify-center gap-2 sm:gap-4"
        >
          {sampleTracks.map((track, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`w-8 rounded-md bg-gradient-to-t from-primary/20 to-primary sm:w-12 ${track.height}`}
              />
              <span className="font-mono text-[0.65rem] text-foreground tabular-nums sm:text-xs">
                {track.bpm}
              </span>
              <span className="font-mono text-[0.6rem] text-muted-foreground sm:text-[0.7rem]">
                {track.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <h2 className="sr-only">Features</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description, example }) => (
          <Card
            key={title}
            className="[--card-spacing:--spacing(6)] transition-colors hover:ring-primary/40"
          >
            <CardHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CardDescription className="leading-relaxed">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <span className="font-mono text-xs text-foreground/80">{example}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border">
      {/* The GetSongBPM attribution link is static HTML in index.html, below #root. */}
      <p className="px-4 pt-6 text-center text-sm text-muted-foreground">
        &copy; {currentYear} The HOTSPOT. Vibe Curator.
      </p>
    </footer>
  )
}

function App() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}

export default App
