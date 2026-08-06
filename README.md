# GenValue Academy

Marketing and course site for **GenValue Academy** - a practical AI tools program (syllabus, enrollment CTAs, instructor profile, contact form, and SEO-friendly metadata).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_ORG%2Fgenvalue-academy&env=NEXT_PUBLIC_SITE_URL,CONTACT_EMAIL&envDescription=See%20.env.example%20in%20the%20repository.)

Replace `YOUR_ORG/genvalue-academy` in the button URL with your Git repository path after you push this project to GitHub (or use **Import Project** in the [Vercel dashboard](https://vercel.com/new) and paste your repo URL).

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com) 4 |
| Motion | [Framer Motion](https://www.framer.com/motion/) |
| Forms | [react-hook-form](https://react-hook-form.com), [Zod](https://zod.dev) |
| Icons | [react-icons](https://react-icons.github.io/react-icons/) |
| Images | `next/image` (with `sharp`) |
| Hosting | [Vercel](https://vercel.com) (recommended) |

## Prerequisites

- **Node.js** 20+ (matches `@types/node` in `package.json`)
- **npm** 10+ (or compatible package manager)

## Local setup

```bash
git clone <your-repo-url>
cd genvalue-academy
npm install
cp .env.example .env.local
# Edit .env.local - see Environment variables below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | ESLint |

## Environment variables

Copy `.env.example` to `.env.local` for local development. On Vercel, add the same keys under **Project → Settings → Environment Variables**.

| Variable | Scope | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical site origin (no trailing slash). Powers `src/lib/site.ts`, `src/lib/constants.ts`, sitemap, and robots. Falls back to `https://genvalue.academy` if unset. |
| `CONTACT_EMAIL` | Server | Intended recipient when you connect the contact API (`src/app/api/contact/route.ts`) to email. Currently optional; set before enabling transactional email. |

No other environment variables are required for a basic static deploy.

## Deployment (Vercel)

1. Push the repository to GitHub (or GitLab / Bitbucket supported by Vercel).
2. Import the project in Vercel (**Add New → Project**).
3. **Framework Preset:** Next.js (default when `package.json` includes `next`).
4. **Build Command:** `npm run build` (already set in [`vercel.json`](./vercel.json)).
5. **Install Command:** `npm install` (default).
6. **Output:** For Next.js, Vercel uses the framework builder and deploys from the Next.js build output (`.next`). You do **not** need a custom output directory unless you switch to static export (`output: "export"` → `out/`).
7. Add `NEXT_PUBLIC_SITE_URL` and `CONTACT_EMAIL` in the Vercel UI (or use the Deploy button above with your repo URL).
8. Deploy.

Production URL: set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://www.genvalue.academy`) so Open Graph, canonical URLs, and `sitemap.xml` stay correct.

### `vercel.json` notes

- **`buildCommand` / `installCommand`:** Explicit defaults for reproducible CI-style builds.
- **`framework`:** `nextjs` so Vercel selects the correct build pipeline.
- **Rewrites:** Not required for this app; add `rewrites` in [`vercel.json`](./vercel.json) if you later proxy paths or merge APIs. Next.js API routes under `src/app/api/` work without rewrites.

## Folder structure

```
genvalue-academy/
├── public/                 # Static assets (favicons, images, SVG)
├── src/
│   ├── app/                # App Router: pages, layouts, API routes, metadata
│   │   ├── api/contact/    # POST /api/contact
│   │   ├── about/
│   │   ├── contact/
│   │   ├── courses/
│   │   ├── instructors/
│   │   ├── syllabus/
│   │   ├── layout.tsx      # Root layout, fonts, skip link, cookie banner
│   │   ├── page.tsx        # Home
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── opengraph-image.tsx
│   ├── components/         # UI sections, layout, SEO helpers, providers
│   ├── data/               # Course copy / structured data
│   ├── hooks/              # Client hooks (e.g. reduced motion)
│   └── lib/                # Site URL, SEO helpers, Zod schemas
├── .env.example
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── vercel.json
```

## License

Private / All rights reserved unless otherwise specified by the project owner.
