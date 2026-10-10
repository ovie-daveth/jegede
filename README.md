# Micheal Jegede — Engineering Portfolio

A standard Next.js portfolio for Vercel, Supabase PostgreSQL + Auth, and Cloudflare R2. The ivory/navy design, video player, project gallery, resume link and admin dashboard are preserved.

## Architecture

- **Vercel / Next.js:** public portfolio, admin pages, metadata APIs and signed-URL endpoints.
- **Supabase PostgreSQL:** project details, publication state and file records.
- **Supabase Auth:** email/password sign-in restricted to the server-side `ADMIN_EMAILS` allowlist.
- **Cloudflare R2:** videos, images, PDFs, CAD files and archives, in a private bucket.

Uploads go directly from the browser to R2 using a 15-minute signed PUT URL, never through Vercel Functions. The server checks uploaded size/type before marking a file ready. Maximum: 250 MB per file. MP4/WebM play in the embedded HTML video player; native engineering files are downloaded. Media is served via one-hour signed GET URLs, supporting video seeking directly from R2.

## Setup

Follow [DEPLOYMENT.md](DEPLOYMENT.md) in order. Credentials and live services are not preconfigured.

```sh
npm ci
cp .env.example .env.local
# Fill .env.local and apply the Supabase SQL migration.
npm run dev
```

Open http://localhost:3000. Create the administrator user in Supabase, sign in at `/login`, and manage projects at `/admin`.

```sh
npm run typecheck
npm test
npm run build
```

Vercel: **Next.js** preset, `npm ci`, `npm run build`, default output directory, Node.js 22 or later supported runtime. Do not use static export or GitHub Pages.

## Security and publication

Apply `supabase/migrations/001_portfolio.sql` once on a new PostgreSQL database. RLS is enabled; browser `anon`/`authenticated` roles have no direct table access. A server-only service-role client queries the database. Public reads explicitly filter published work. Mutations and draft reads require a validated Supabase user and the administrator allowlist. Writes also check the request origin. Executable, HTML and SVG uploads are excluded.

Publishing shows verified files to visitors. Pending files and drafts stay hidden. Previously issued viewing links can remain valid for up to one hour after unpublishing; downloaded files cannot be recalled. Failed uploads attempt cleanup. Interrupted uploads can leave pending records; see maintenance guidance.

## Migration scope

This repository replaces Vinext, Cloudflare Workers/D1 and ChatGPT sign-in. It does not modify the previously deployed ChatGPT Site or automatically copy its records/files. Export or re-upload existing projects before retiring the old deployment. The default drawing is labelled illustrative; actual candidate design files need uploading.
