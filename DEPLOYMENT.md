# Deploy on Vercel with Supabase and Cloudflare R2

## 1. Supabase database and administrator

1. Create a Supabase project.
2. In SQL Editor, run `supabase/migrations/001_portfolio.sql` **once on a new database**. It creates `projects` and `project_files` with RLS and server-only access.
3. Copy the project URL and publishable key from Project Settings / API. A legacy anon key also works in the publishable-key variable.
4. Copy the server-side `service_role` key. It bypasses RLS; never expose it to browsers or commit it.
5. In Authentication / Users, create `michealjegede3@gmail.com` with a strong password and confirmed email. Share the password privately with Micheal.
6. Disable public new-user signups. The app has no signup screen and restricts administration to `ADMIN_EMAILS`.
7. Set Auth Site URL to your eventual Vercel production origin. Add trusted redirect URLs if using dashboard password-reset emails. Normal login is email/password and needs no OAuth callback.

## 2. Private Cloudflare R2 bucket

1. Create a bucket, for example `jegede-portfolio`. Keep public access disabled; do not enable r2.dev or a public bucket domain.
2. Create an R2 API token with **Object Read & Write**, scoped to that bucket. Copy its Access Key ID, Secret Access Key and your Cloudflare Account ID.
3. In bucket CORS settings, paste `supabase/r2-cors.json`. Replace the example Vercel origin with the exact production origin, with no path or trailing slash. Add your exact custom domain if used. Keep localhost only for local development; add individual preview origins if needed.
4. Allow PUT, GET and HEAD, the listed headers, and the listed exposed headers. These support browser uploads and media playback/seek requests.

## 3. Vercel deployment

1. Import `ovie-daveth/jegede` into Vercel, with repository root as Root Directory.
2. Framework: **Next.js**. Install: `npm ci`. Build: `npm run build`. Output Directory: default. Node.js: 22 or a later supported runtime.
3. Set these environment variables in Production (and Preview/Development if desired):

| Variable | Value source | Public? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable / legacy anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key | No |
| `ADMIN_EMAILS` | `michealjegede3@gmail.com`, or comma-separated authorised emails | No |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | No |
| `R2_ACCESS_KEY_ID` | Bucket-scoped R2 Access Key ID | No |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Access Key | No |
| `R2_BUCKET_NAME` | Exact bucket name | No |

4. Deploy. Update R2 CORS and Supabase Auth Site URL with the final production origin.
5. Redeploy after changing environment values. Public Supabase values are compiled into the browser bundle.
6. Ensure production deployment protection is disabled when sharing the portfolio with employers. Supabase login independently protects administration.

## 4. Live verification

1. Open the portfolio in incognito. Published work should be visible without login.
2. Visit `/admin`; confirm it redirects to `/login`.
3. Sign in using the admin user created in Supabase. Create a project with its real title, year, tools and description.
4. Upload an MP4, image and CAD/PDF file. Save as a draft and confirm it stays hidden in incognito.
5. Publish; confirm playback, video seeking, image/PDF preview and downloads in incognito.
6. Test editing, deleting a disposable file/project, and sign-out. Unauthenticated users must not access drafts or write APIs.

## Troubleshooting and maintenance

- **Gallery fails:** check environment values, SQL migration and Vercel logs. Do not expose credentials in logs or screenshots.
- **Login fails:** check the Supabase user is confirmed, its password is correct and its email matches `ADMIN_EMAILS`. The new app does not use ChatGPT sign-in.
- **R2 upload fails:** check exact CORS origins, bucket-scoped credentials, account/bucket names and network connectivity. A mismatched MIME header or expired signed URL also causes rejection.
- **File exceeds 250 MB:** compress/split it. Larger support needs a deliberate multipart-upload implementation.
- **Video playback after one hour:** reopen the project or refresh to obtain a fresh viewing URL.
- **Abandoned uploads:** errors attempt cleanup. A closed tab may leave a pending file. Review `project_files` entries with `status='pending'` older than a day; remove each matching R2 object, then its pending row. Do not purge ready files or the whole projects prefix.
- **Old data:** the ChatGPT-hosted D1/R2 deployment is separate. Export/copy it or re-upload the original files before retiring it. No automatic data migration is included.

## Official references

- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- https://developers.cloudflare.com/r2/buckets/cors/
