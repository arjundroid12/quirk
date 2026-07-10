# QUIRK

> Find your quirk. Ship it.

QUIRK is the AI-native workspace for content creators who'd rather create than juggle 5 tools. Plan, script, optimize, and grow — all in one place. Built by creators, for creators.

## Features (v1)

Three AI tools, one workspace:

| Tool | What it does | Status |
|------|--------------|--------|
| **Script Studio** | AI scripts for Reels, Shorts, TikTok, long-form. Platform-native hooks, pacing, CTAs. Inline AI improve (Hook/Body/CTA). | ✅ Live |
| **Idea Engine** | Generate 4-10 scroll-stopping content ideas per batch. Save to idea bank, mark as Idea / Filmed / Published / Killed. Filter by status. | ✅ Live |
| **Thumbnail Tester** | Upload 2-3 thumbnails. AI scores on composition / emotion / text legibility / predicted CTR. Picks winner with reasoning. | ✅ Live |

Plus: landing page with waitlist capture, magic-link auth, dashboard with stats.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Turbopack)
- **Styling**: Tailwind CSS 4 + shadcn/ui (full New York set)
- **Database**: Prisma ORM + SQLite (local dev) → Turso libsql (prod, edge-compatible)
- **Auth**: NextAuth.js v4 (email magic link + dev bypass)
- **AI**: z-ai-web-dev-sdk (GLM-4.6 chat + GLM-4.6 Vision for thumbnails)
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **Toasts**: sonner
- **Deploy**: Cloudflare Pages (via @cloudflare/next-on-pages)

## Local Dev Setup

```bash
# 1. Install deps
bun install

# 2. Set up env
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL + NEXTAUTH_SECRET + NEXTAUTH_URL + DEV_AUTO_SIGNIN=1

# 3. Push DB schema
bun run db:push

# 4. Start dev server
bun run dev
# → http://localhost:3000
```

In dev mode (`DEV_AUTO_SIGNIN=1`), you can sign in with any email instantly — no SMTP needed. To test the real magic-link flow, unset `DEV_AUTO_SIGNIN` and configure Resend.

## Project Structure

```
prisma/
  schema.prisma           # 7 models: User, Account, Session, VerificationToken, Script, Idea, Thumbnail, Waitlist
src/
  app/
    layout.tsx            # Root layout (fonts, theme, CF Web Analytics beacon)
    page.tsx              # Landing page
    opengraph-image.tsx   # Dynamic OG image (1200x630)
    not-found.tsx         # Custom 404
    globals.css           # Tailwind v4 theme + brand tokens
    signin/page.tsx       # Auth page (magic link / dev bypass)
    api/
      auth/[...nextauth]/ # NextAuth handler
      waitlist/           # POST join waitlist, GET count
      scripts/            # CRUD + /improve endpoint
      ideas/              # POST generate, GET list, /[id] PATCH/DELETE
      thumbnails/         # POST analyze (vision), GET batches, /[id] DELETE
    app/                  # Protected app shell
      layout.tsx          # Auth check + AppShell (sidebar)
      page.tsx            # Dashboard (quick actions, recent scripts, stats)
      loading.tsx         # Skeleton
      error.tsx           # Error boundary
      scripts/            # Script Studio (list, new, [id] editor)
      ideas/              # Idea Engine
      thumbnails/         # Thumbnail Tester
      settings/           # Account + plan info
  components/
    landing/              # navbar, hero, waitlist-form, signin-card
    app/                  # shell, script-list
    script-studio/        # new-script-form, script-editor
    idea-engine/          # idea-engine (form + bank + cards)
    thumbnail-tester/     # thumbnail-tester (upload + results + past batches)
    logo.tsx              # LogoMark + Logo components
    providers.tsx         # SessionProvider
    theme-provider.tsx    # next-themes
    ui/                   # shadcn/ui (full New York set)
  lib/
    auth.ts               # NextAuth config (EmailProvider + CredentialsProvider dev bypass)
    session.ts            # getSession helper
    zai.ts                # Z.AI SDK — generateScript, improveScriptSection, generateIdeas, analyzeThumbnail
    db.ts                 # Prisma client singleton
    utils.ts              # cn, formatDate, relativeTime, initials
public/
  quirk/                  # logo.svg, favicon.svg, logo-mark.svg
```

## Deploy to Cloudflare Pages

**Requires**: Turso DB account + Resend account (for prod magic links).

```bash
# 1. Set up Turso DB
#    Sign up at https://turso.tech → create DB → get URL + token
#    Set DATABASE_URL=libsql://... and LIBSQL_TOKEN=... in .env

# 2. Set up Resend
#    Sign up at https://resend.com → verify sending domain → get API key
#    Set RESEND_API_KEY=... and SMTP_FROM="QUIRK <noreply@yourdomain.com>"

# 3. Add `export const runtime = 'edge'` to every dynamic route
#    (Required by @cloudflare/next-on-pages)

# 4. Build for Cloudflare
npx next-on-pages

# 5. Create CF Pages project (one-time)
npx wrangler pages project create quirk --production-branch=main

# 6. Deploy
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
  npx wrangler pages deploy .vercel/output/static --project-name=quirk

# 7. Set production env vars in Cloudflare dashboard
#    (NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL, LIBSQL_TOKEN, RESEND_API_KEY, SMTP_FROM)
#    DO NOT set DEV_AUTO_SIGNIN in production
```

## Brand

- **Name**: QUIRK
- **Tagline**: "Find your quirk. Ship it."
- **Logo**: SVG "C" = play button + spark, gradient purple→pink
- **Palette**: deep purple `#7C3AED`, electric pink `#EC4899`, cream `#FAFAF7`, dark `#0F0F1A`
- **Typography**: Inter (body), Plus Jakarta Sans (display), JetBrains Mono (code)
- **Voice**: Confident, creator-first, slightly playful. Not corporate.

## License

Private project. All rights reserved © 2026 QUIRK.
