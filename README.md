# JOBLUX — Luxury Talents Society

> The private intelligence platform for luxury industry professionals.
> Est. Paris 2006 · Paris · London · New York · Dubai · Singapore

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js (LinkedIn + Google OAuth)
- **Email:** Resend
- **Hosting:** Vercel
- **Repo:** GitHub (private)

---

## Deployment — Step by Step

### STEP 1 — Clone the repository

```bash
git clone https://github.com/joblux/ClaudeCORE.git
cd ClaudeCORE
```

### STEP 2 — Install dependencies

```bash
npm install
```

### STEP 3 — Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://zspcmvdoqhvrcdynlriz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fhsMsiO8jJKAELhFWJGK5g_7X4mZ9fI
SUPABASE_SERVICE_ROLE_KEY=        ← get from Supabase → Settings → API → service_role key
NEXTAUTH_URL=http://localhost:3000 ← change to https://joblux.com in production
NEXTAUTH_SECRET=                   ← generate: openssl rand -base64 32
LINKEDIN_CLIENT_ID=                ← from LinkedIn Developer App
LINKEDIN_CLIENT_SECRET=            ← from LinkedIn Developer App
GOOGLE_CLIENT_ID=                  ← from Google Cloud Console
GOOGLE_CLIENT_SECRET=              ← from Google Cloud Console
RESEND_API_KEY=                    ← from resend.com
RESEND_FROM_EMAIL=hello@joblux.com
NEXT_PUBLIC_SITE_URL=https://joblux.com
```

### STEP 4 — Set up Supabase database

1. Go to **supabase.com** → your project (ClaudeCore)
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Open the file `supabase-schema.sql` from this repo
5. Copy all contents → paste into SQL Editor
6. Click **Run**
7. You should see: "Success. No rows returned."

### STEP 5 — Get your Supabase Service Role Key

1. Supabase Dashboard → **Settings** → **API**
2. Copy the **service_role** key (secret — never expose publicly)
3. Add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### STEP 6 — Test locally

```bash
npm run dev
```

Open **http://localhost:3000** — you should see the JOBLUX homepage.

### STEP 7 — Push to GitHub

```bash
git add .
git commit -m "JOBLUX v1.0 — initial build"
git push origin main
```

### STEP 8 — Deploy to Vercel

1. Go to **vercel.com**
2. Click **Add New Project**
3. Import from GitHub → select **joblux/ClaudeCORE**
4. Framework: **Next.js** (auto-detected)
5. Add all environment variables from `.env.local`
   - Change `NEXTAUTH_URL` to `https://joblux.com`
   - Change `NEXT_PUBLIC_SITE_URL` to `https://joblux.com`
6. Click **Deploy**
7. Vercel builds and deploys — takes ~2 minutes

### STEP 9 — Connect your domain

1. Vercel → your project → **Settings** → **Domains**
2. Add: `joblux.com`
3. Add: `www.joblux.com`
4. Vercel shows you DNS records to add
5. Go to your domain registrar → add the DNS records
6. Wait 15-60 minutes for propagation
7. JOBLUX is live at joblux.com ✅

---

## OAuth Setup

### LinkedIn OAuth

1. Go to **linkedin.com/developers**
2. Create a new app
3. Products → Add **Sign In with LinkedIn using OpenID Connect**
4. Auth → Authorized redirect URLs → add:
   - `http://localhost:3000/api/auth/callback/linkedin`
   - `https://joblux.com/api/auth/callback/linkedin`
5. Copy Client ID and Client Secret → add to `.env.local`

### Google OAuth

1. Go to **console.cloud.google.com**
2. Create new project: JOBLUX
3. APIs & Services → Credentials → Create OAuth 2.0 Client
4. Authorized redirect URIs → add:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://joblux.com/api/auth/callback/google`
5. Copy Client ID and Client Secret → add to `.env.local`

---

## Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Lint
npm run lint
```

### Deploying updates

```bash
git add .
git commit -m "Description of changes"
git push origin main
# Vercel auto-deploys in ~2 minutes
```

### Preview deployments

Every branch pushed to GitHub gets a unique preview URL from Vercel.
Test before merging to main.

---

## Project Structure

```
/app
  /page.tsx                    Homepage
  /wikilux/page.tsx            WikiLux index
  /wikilux/[slug]/page.tsx     Brand page
  /jobs/page.tsx               Job mandates
  /salaries/page.tsx           Salary intelligence
  /interviews/page.tsx         Industry interviews
  /bloglux/page.tsx            Blog index
  /bloglux/[slug]/page.tsx     Article page
  /travel/page.tsx             Travel magazine
  /the-brief/page.tsx          Newsletter
  /about/page.tsx              About JOBLUX
  /members/page.tsx            Sign in / Request access
  /api/subscribe/route.ts      Newsletter API

/components
  /layout/Header.tsx           Navigation
  /layout/Footer.tsx           Footer
  /home/SearchHero.tsx         Search box
  /home/Ticker.tsx             Industry ticker
  /home/FeaturedContent.tsx    Articles + interviews
  /home/SalarySnapshot.tsx     Salary sidebar
  /home/LatestJobs.tsx         Jobs sidebar
  /home/WikiLuxPreview.tsx     WikiLux sidebar
  /home/TheBriefSignup.tsx     Newsletter signup

/lib
  /supabase.ts                 Database client

/types
  /database.ts                 TypeScript types

supabase-schema.sql            Database schema
.env.example                   Environment variables template
```

---

## Support

Built by Claude (Anthropic) for JOBLUX.
For code questions and updates — continue the conversation with Claude.

---

*JOBLUX — Luxury Talents Society — Est. Paris 2006*
