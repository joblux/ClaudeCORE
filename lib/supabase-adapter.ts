import { Adapter, AdapterUser, AdapterSession, AdapterAccount } from "next-auth/adapters";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Custom Supabase Adapter for JOBLUX
 *
 * Maps NextAuth's adapter interface to our existing `members` table
 * rather than creating separate NextAuth-specific tables.
 *
 * Key differences from default adapter:
 * - Users map to `members` table
 * - New sign-ups get status "new" (not yet registered)
 * - Sessions use JWT strategy (no sessions table needed)
 * - Accounts & verification tokens use dedicated NextAuth tables
 */
export function SupabaseAdapter(supabase: SupabaseClient): Adapter {
  return {
    // ── Create User ──
    async createUser(user) {
      // When someone signs in for the first time via OAuth or magic link,
      // create a minimal member record with status "new"
      const { data, error } = await supabase
        .from("members")
        .insert({
          email: user.email,
          first_name: user.name?.split(" ")[0] || null,
          last_name: user.name?.split(" ").slice(1).join(" ") || null,
          avatar_url: user.image || null,
          status: "new", // Not yet registered — needs to complete registration
          role: "member",
        })
        .select()
        .single();

      if (error) {
        // If member already exists (e.g., pre-seeded by admin), fetch them
        if (error.code === "23505") {
          const { data: existing } = await supabase
            .from("members")
            .select()
            .eq("email", user.email)
            .single();

          if (existing) {
            return mapMemberToAdapterUser(existing);
          }
        }
        throw error;
      }

      return mapMemberToAdapterUser(data);
    },

    // ── Get User by ID ──
    async getUser(id) {
      const { data, error } = await supabase
        .from("members")
        .select()
        .eq("id", id)
        .single();

      if (error || !data) return null;
      return mapMemberToAdapterUser(data);
    },

    // ── Get User by Email ──
    async getUserByEmail(email) {
      const { data, error } = await supabase
        .from("members")
        .select()
        .eq("email", email)
        .single();

      if (error || !data) return null;
      return mapMemberToAdapterUser(data);
    },

    // ── Get User by Account ──
    async getUserByAccount({ providerAccountId, provider }) {
      const { data: account, error: accountError } = await supabase
        .from("nextauth_accounts")
        .select("member_id")
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId)
        .single();

      if (accountError || !account) return null;

      const { data: member, error: memberError } = await supabase
        .from("members")
        .select()
        .eq("id", account.member_id)
        .single();

      if (memberError || !member) return null;
      return mapMemberToAdapterUser(member);
    },

    // ── Update User ──
    async updateUser(user) {
      const updates: Record<string, unknown> = {};
      if (user.name) {
        updates.first_name = user.name.split(" ")[0];
        updates.last_name = user.name.split(" ").slice(1).join(" ");
      }
      if (user.image) updates.avatar_url = user.image;
      if (user.email) updates.email = user.email;

      const { data, error } = await supabase
        .from("members")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return mapMemberToAdapterUser(data);
    },

    // ── Delete User ──
    async deleteUser(userId) {
      await supabase.from("nextauth_accounts").delete().eq("member_id", userId);
      await supabase
        .from("nextauth_verification_tokens")
        .delete()
        .eq("identifier", userId);
      await supabase.from("members").delete().eq("id", userId);
    },

    // ── Link Account ──
    async linkAccount(account) {
      const { error } = await supabase.from("nextauth_accounts").insert({
        member_id: account.userId,
        type: account.type,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state as string | null,
      });

      if (error) throw error;
    },

    // ── Unlink Account ──
    async unlinkAccount({ providerAccountId, provider }) {
      await supabase
        .from("nextauth_accounts")
        .delete()
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId);
    },

    // ── Verification Tokens (for magic link) ──
    async createVerificationToken(token) {
      const { data, error } = await supabase
        .from("nextauth_verification_tokens")
        .insert({
          identifier: token.identifier,
          token: token.token,
          expires: token.expires.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      };
    },

    async useVerificationToken({ identifier, token }) {
      const { data, error } = await supabase
        .from("nextauth_verification_tokens")
        .delete()
        .eq("identifier", identifier)
        .eq("token", token)
        .select()
        .single();

      if (error || !data) return null;
      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      };
    },

    // ── Sessions (not used with JWT strategy, but required by interface) ──
    async createSession(session) {
      return session as AdapterSession;
    },
    async getSessionAndUser(sessionToken) {
      return null;
    },
    async updateSession(session) {
      return session as AdapterSession;
    },
    async deleteSession(sessionToken) {
      // No-op with JWT strategy
    },
  };
}

// ─────────────────────────────────────────────
// Helper: Map Supabase member row → NextAuth user
// ─────────────────────────────────────────────
function mapMemberToAdapterUser(member: Record<string, unknown>): AdapterUser {
  return {
    id: member.id as string,
    email: member.email as string,
    emailVerified: member.email_verified
      ? new Date(member.email_verified as string)
      : null,
    name: [member.first_name, member.last_name].filter(Boolean).join(" ") || null,
    image: (member.avatar_url as string) || null,
  };
}
