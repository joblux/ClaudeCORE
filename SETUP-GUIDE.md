# JOBLUX — NextAuth Authentication System
## Setup Guide

### Files to Add to Your Repo

```
ClaudeCORE/
├── middleware.ts                              ← NEW (root level)
├── types/
│   └── next-auth.d.ts                        ← NEW
├── lib/
│   ├── auth.ts                               ← NEW (core config)
│   ├── auth-hooks.ts                         ← NEW (client hooks)
│   ├── auth-server.ts                        ← NEW (server helpers)
│   └── supabase-adapter.ts                   ← NEW (custom adapter)
├── components/
│   ├── AuthProvider.tsx                       ← NEW
│   └── UserMenu.tsx                          ← NEW (header dropdown)
├── app/
│   ├── layout.tsx                            ← UPDATE (wrap with AuthProvider)
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts                          ← NEW
│   └── members/
│       ├── page.tsx                           ← REPLACE (sign-in page)
│       ├── check-email/
│       │   └── page.tsx                       ← NEW
│       └── pending/
│           └── page.tsx                       ← NEW
└── supabase/migrations/
    └── 002_nextauth_tables.sql               ← NEW (run in SQL editor)
```

---

### Step-by-Step Setup

#### 1. Run the SQL Migration
Open Supabase SQL Editor → paste `002_nextauth_tables.sql` → Run.
This creates `nextauth_accounts` and `nextauth_verification_tokens` tables
and adds `auth_provider`, `avatar_url`, `last_login`, `email_verified`
columns to your existing `members` table.

#### 2. Install npm Dependencies
```bash
npm install next-auth @next-auth/core resend
```
(You should already have `@supabase/supabase-js` installed.)

#### 3. Update layout.tsx
Wrap your existing `{children}` with `<AuthProvider>`.
See the provided `app/layout.tsx` for reference.

#### 4. Add UserMenu to Header
In your existing Header component, import and render `<UserMenu />`
where you currently have the sign-in link.

#### 5. Set Environment Variables on Vercel

**Already set:**
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET

**You need to add:**

| Variable | Where to get it |
|----------|----------------|
| `LINKEDIN_CLIENT_ID` | linkedin.com/developers/apps |
| `LINKEDIN_CLIENT_SECRET` | linkedin.com/developers/apps |
| `GOOGLE_CLIENT_ID` | console.cloud.google.com/apis/credentials |
| `GOOGLE_CLIENT_SECRET` | console.cloud.google.com/apis/credentials |
| `RESEND_API_KEY` | resend.com/api-keys |
| `EMAIL_FROM` | `JOBLUX <noreply@luxuryrecruiter.com>` |

#### 6. Set OAuth Callback URLs

**LinkedIn Developer Console:**
```
https://www.luxuryrecruiter.com/api/auth/callback/linkedin
```

**Google Cloud Console:**
```
https://www.luxuryrecruiter.com/api/auth/callback/google
```

#### 7. Verify Resend Domain
Go to resend.com → Domains → Add `luxuryrecruiter.com` →
Add the DNS records they provide to your domain.

#### 8. Deploy
```bash
git add .
git commit -m "feat: NextAuth authentication system"
git push
```

---

### How It Works — The Auth Flow

```
User visits /members
    │
    ├── Clicks "LinkedIn" or "Google"
    │   → OAuth flow → callback → check members table
    │
    └── Enters email → magic link sent via Resend
        → clicks link → callback → check members table
            │
            ├── New user (not in members table)
            │   → Record created with status "new"
            │   → Redirect to /members/register (Phase 2.3)
            │
            ├── Pending member
            │   → Redirect to /members/pending
            │
            ├── Approved member
            │   → Redirect to /dashboard
            │   → Full access to member features
            │
            └── Admin (Alex)
                → Redirect to /dashboard
                → Access to /admin
```

### Protected Routes

| Route | Requires |
|-------|----------|
| `/dashboard` | Approved member or admin |
| `/profile` | Approved member or admin |
| `/jobs/all` | Approved member or admin |
| `/salaries/full` | Approved member or admin |
| `/admin/*` | Admin only |

### Client-Side Hooks

```tsx
// In any client component:
import { useMember } from "@/lib/auth-hooks";

function MyComponent() {
  const { isAuthenticated, isAdmin, isApproved, firstName } = useMember();
  // Use as needed
}
```

### Server-Side Helpers

```tsx
// In any server component or API route:
import { requireAuth, requireAdmin } from "@/lib/auth-server";

export default async function DashboardPage() {
  const member = await requireAuth(); // Redirects if not logged in
  // member.memberId, member.role, member.isAdmin, etc.
}
```

---

### What's Next (Phase 2.3 — Member Registration)

The auth system is ready. The next piece to build:
- `/members/register` page — 3-type registration form
- Profile completion flow
- Submit for approval → Alex reviews in admin
