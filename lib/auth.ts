import { NextAuthOptions } from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "./supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

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
      from: process.env.EMAIL_FROM || "JOBLUX <noreply@luxuryrecruiter.com>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          await getResend().emails.send({
            from: process.env.EMAIL_FROM || "JOBLUX <noreply@luxuryrecruiter.com>",
            to: email,
            subject: "Sign in to JOBLUX",
            html: magicLinkEmailHtml(url),
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
    signIn: "/members",
    error: "/members",
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
      if (member) {
        if (member.status === "approved" || member.role === "admin") return true;
        if (member.status === "pending") return "/members/pending";
        if (member.status === "rejected") return "/members?error=rejected";
      }
      return true;
    },

    async jwt({ token, user }) {
      const email = user?.email || token.email;
      if (email) {
        const { data: member, error } = await supabaseAdmin
          .from("members")
          .select("id, role, status, first_name, last_name, registration_completed")
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
      if (account?.provider) {
        await supabaseAdmin
          .from("members")
          .update({ auth_provider: account.provider, avatar_url: user.image || undefined })
          .eq("email", user.email);
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
};

function magicLinkEmailHtml(url: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:2px;border:1px solid #e8e6df;">
        <tr><td style="padding:40px 40px 24px;text-align:center;border-bottom:1px solid #e8e6df;">
          <div style="font-family:'Gill Sans','Gill Sans MT',Calibri,sans-serif;font-size:28px;font-weight:600;color:#1a1a1a;letter-spacing:2px;">JOBLUX</div>
          <div style="font-size:11px;color:#a58e28;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Luxury Talents Intelligence</div>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 24px;">Click the button below to sign in to your JOBLUX account. This link expires in 24 hours.</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
            <a href="${url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;padding:14px 40px;border-radius:2px;letter-spacing:1px;">SIGN IN TO JOBLUX</a>
          </td></tr></table>
          <p style="font-size:13px;color:#888;line-height:1.5;margin:0;">If you didn't request this email, you can safely ignore it.</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #e8e6df;text-align:center;">
          <p style="font-size:11px;color:#999;margin:0;">JOBLUX · Paris · London · New York · Dubai · Singapore</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
