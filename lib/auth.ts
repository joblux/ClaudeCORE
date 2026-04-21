import { NextAuthOptions } from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "./supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./ses";
import { magicLinkEmail } from "./email-templates";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter(supabaseAdmin),

  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: { params: { scope: "openid profile email" } },
      issuer: "https://www.linkedin.com/oauth",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
    }),

    EmailProvider({
      from: "JOBLUX <noreply@joblux.com>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          const { html, text } = magicLinkEmail(url);
          await sendEmail({
            to: email,
            subject: "Sign in to JOBLUX",
            body: text,
            bodyHtml: html,
          });
        } catch (error) {
          console.error("Failed to send magic link email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

  pages: {
    signIn: "/auth/signin",
    error: "/join",
    verifyRequest: "/members/check-email",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const { data: member } = await supabaseAdmin
        .from("members")
        .select("id, status, role")
        .eq("email", user.email)
        .single();
      if (account?.provider === "email" && member) {
        const { data: existingProviders } = await supabaseAdmin
          .from("nextauth_accounts")
          .select("provider")
          .eq("member_id", member.id)
          .neq("provider", "email");

        if (existingProviders && existingProviders.length > 0) {
          const conflictProvider = existingProviders[0].provider;
          return `/join?error=EmailOnOAuthAccount&provider=${encodeURIComponent(conflictProvider)}`;
        }
      }
      if (member) {
        if (member.status === "approved" || member.role === "admin") return true;
        if (member.status === "pending") return true;
        if (member.status === "rejected") return "/members?error=rejected";
      }
      return true;
    },

    async jwt({ token, user }) {
      const email = user?.email || token.email;
      if (email) {
        const { data: member, error } = await supabaseAdmin
          .from("members")
          .select("id, role, status, first_name, last_name, registration_completed, tier_selected, avatar_url")
          .eq("email", email)
          .single();
        if (error) {
          console.error("JWT: Supabase query error:", error.message);
        }
        if (member) {
          token.memberId = member.id;
          token.role = member.role;
          token.status = member.status;
          token.firstName = member.first_name;
          token.lastName = member.last_name;
          token.registrationCompleted = member.registration_completed;
          token.tierSelected = member.tier_selected;
          token.avatarUrl = member.avatar_url;
        } else {
          token.status = "new";
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.memberId = token.memberId as string | undefined;
      session.user.role = token.role as string | undefined;
      session.user.status = token.status as string | undefined;
      session.user.firstName = token.firstName as string | undefined;
      session.user.lastName = token.lastName as string | undefined;
      session.user.registrationCompleted = token.registrationCompleted as boolean | undefined;
      session.user.tierSelected = token.tierSelected as boolean | undefined;
      session.user.avatarUrl = (token.avatarUrl as string | null | undefined) ?? null;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account }) {
      if (!user.email) return;
      await supabaseAdmin
        .from("members")
        .update({ last_login: new Date().toISOString() })
        .eq("email", user.email);

      if (!account?.provider) return;

      // Record auth provider but DO NOT touch avatar_url here. Avatar
      // hydration is handled below as a one-shot, only when avatar_url
      // is currently empty. This preserves user uploads across sign-ins.
      await supabaseAdmin
        .from("members")
        .update({ auth_provider: account.provider })
        .eq("email", user.email);

      // Account-avatar policy — strictly enforced on every sign-in.
      //
      // Storage doctrine — DO NOT mix concerns:
      //   bucket 'avatars' = account/header avatars ONLY (this code path)
      //   bucket 'media'   = generic media library, hotel photos, article
      //                      covers, bloglux uploads, etc.
      //   future bucket    = Profilux private photos (separate, private)
      //
      // members.avatar_url + members.avatar_source are the source of truth.
      //
      // Rules (in order):
      //   1. If avatar_source = 'upload' → never touched. User uploads
      //      survive every sign-in.
      //   2. If avatar_source already matches the current session's
      //      provider AND avatar_url is set → no-op. The existing bytes
      //      came from this same provider on a previous sign-in; we trust
      //      them and don't re-fetch.
      //   3. Otherwise (NULL source, or source from a DIFFERENT provider)
      //      → fetch user.image (the current session's provider picture)
      //      and overwrite. The avatar must reflect THIS session's
      //      provider, never another linked provider.
      //   4. If the fetch fails → wipe avatar_url and avatar_source to
      //      NULL and remove the storage object. The header falls back to
      //      initials. NEVER silently substitute another linked provider's
      //      bytes.
      const provider = account.provider;
      if (provider !== "linkedin" && provider !== "google") return;

      const { data: existing } = await supabaseAdmin
        .from("members")
        .select("id, avatar_url, avatar_source")
        .eq("email", user.email)
        .maybeSingle();

      if (!existing?.id) return;

      // Rule 1 — sacred upload, never touched
      if (existing.avatar_source === "upload") return;

      // Rule 2 — same provider, already hydrated, leave alone
      if (
        existing.avatar_source === provider &&
        existing.avatar_url &&
        existing.avatar_url.trim()
      ) {
        return;
      }

      const providerImage = user.image;
      const storagePath = `${existing.id}.jpg`;

      const wipeToInitials = async () => {
        try {
          await supabaseAdmin.storage.from("avatars").remove([storagePath]);
        } catch {
          /* best-effort */
        }
        await supabaseAdmin
          .from("members")
          .update({ avatar_url: null, avatar_source: null })
          .eq("id", existing.id);
      };

      // Rule 4 prelude — no provider URL on this session at all
      if (!providerImage || typeof providerImage !== "string") {
        await wipeToInitials();
        return;
      }

      try {
        // Server-side fetch sends no Referer by default — works for
        // LinkedIn / Google profile URLs that block third-party browsers.
        // Signed LinkedIn URLs are fresh at the moment of sign-in.
        const res = await fetch(providerImage);
        if (!res.ok) {
          // Rule 4 — fetch failed, wipe to initials. Do NOT fall back
          // to another linked provider.
          console.warn(
            `[avatar-hydrate] ${provider} fetch failed for ${user.email}: ${res.status}`
          );
          await wipeToInitials();
          return;
        }

        const contentType = res.headers.get("content-type") || "image/jpeg";
        const buf = Buffer.from(await res.arrayBuffer());

        const { error: uploadErr } = await supabaseAdmin.storage
          .from("avatars")
          .upload(storagePath, buf, { contentType, upsert: true });

        if (uploadErr) {
          console.warn(
            `[avatar-hydrate] upload failed for ${user.email}: ${uploadErr.message}`
          );
          await wipeToInitials();
          return;
        }

        const { data: urlData } = supabaseAdmin.storage
          .from("avatars")
          .getPublicUrl(storagePath);

        const avatarUrl = urlData.publicUrl;
        if (!avatarUrl) {
          await wipeToInitials();
          return;
        }

        // Rule 3 — success: write the URL and stamp the source as the
        // current session's provider.
        await supabaseAdmin
          .from("members")
          .update({ avatar_url: avatarUrl, avatar_source: provider })
          .eq("id", existing.id);
      } catch (err) {
        console.warn(
          `[avatar-hydrate] unexpected error for ${user.email}:`,
          err instanceof Error ? err.message : err
        );
        await wipeToInitials();
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
};
