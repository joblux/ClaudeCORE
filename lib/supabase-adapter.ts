import { Adapter, AdapterUser } from "next-auth/adapters";
import { SupabaseClient } from "@supabase/supabase-js";

export function SupabaseAdapter(supabase: SupabaseClient): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      // Check if member already exists with this email
      const { data: existing } = await supabase
        .from("members")
        .select()
        .eq("email", user.email)
        .single();

      if (existing) {
        // Member already exists — return them, don't create a duplicate
        return mapMemberToAdapterUser(existing);
      }

      // Check blocked_emails table for exact email or domain match
      const emailDomain = user.email.split("@")[1];
      const { data: blocked } = await supabase
        .from("blocked_emails")
        .select("id")
        .or(`email.eq.${user.email},domain.eq.${emailDomain}`)
        .maybeSingle();

      if (blocked) {
        throw new Error("Email blocked");
      }

      const fullName = user.name || user.email.split("@")[0];
      const { data, error } = await supabase
        .from("members")
        .insert({
          email: user.email,
          full_name: fullName,
          first_name: user.name?.split(" ")[0] || null,
          last_name: user.name?.split(" ").slice(1).join(" ") || null,
          avatar_url: user.image || null,
          status: "pending",
          role: "rising",
        })
        .select()
        .single();

      if (error) {
        // Handle race condition: another request created the member
        if (error.code === "23505") {
          const { data: raceExisting } = await supabase
            .from("members")
            .select()
            .eq("email", user.email)
            .single();
          if (raceExisting) return mapMemberToAdapterUser(raceExisting);
        }
        throw error;
      }
      return mapMemberToAdapterUser(data);
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const { data, error } = await supabase
        .from("members")
        .select()
        .eq("id", id)
        .single();
      if (error || !data) return null;
      return mapMemberToAdapterUser(data);
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      if (!email) return null;
      const normalizedEmail = email.toLowerCase().trim();

      // Check blocked_emails table — return null so NextAuth treats as blocked
      const emailDomain = normalizedEmail.split("@")[1];
      const { data: blocked } = await supabase
        .from("blocked_emails")
        .select("id")
        .or(`email.eq.${normalizedEmail},domain.eq.${emailDomain}`)
        .maybeSingle();

      if (blocked) return null;

      const { data, error } = await supabase
        .from("members")
        .select()
        .eq("email", normalizedEmail)
        .single();
      if (error || !data) return null;
      return mapMemberToAdapterUser(data);
    },

    async getUserByAccount({ providerAccountId, provider }: {
      providerAccountId: string;
      provider: string;
    }): Promise<AdapterUser | null> {
      // Look up the account link
      const { data: account, error: accountError } = await supabase
        .from("nextauth_accounts")
        .select("member_id")
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId)
        .single();

      if (accountError || !account) return null;

      // Fetch the specific member for THIS account
      const { data: member, error: memberError } = await supabase
        .from("members")
        .select()
        .eq("id", account.member_id)
        .single();

      if (memberError || !member) return null;
      return mapMemberToAdapterUser(member);
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> {
      const updates: Record<string, unknown> = {};
      if (user.name) {
        updates.full_name = user.name;
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
        .maybeSingle();
      if (error) throw error;
      if (data) return mapMemberToAdapterUser(data);
      // If no rows updated, fetch the existing member
      const { data: existing } = await supabase
        .from("members")
        .select()
        .eq("id", user.id)
        .single();
      if (existing) return mapMemberToAdapterUser(existing);
      throw new Error("Member not found for updateUser");
    },

    async deleteUser(userId: string): Promise<void> {
      await supabase.from("nextauth_accounts").delete().eq("member_id", userId);
      await supabase.from("nextauth_verification_tokens").delete().eq("identifier", userId);
      await supabase.from("members").delete().eq("id", userId);
    },

    async linkAccount(account: {
      userId: string; type: string; provider: string;
      providerAccountId: string; refresh_token?: string | null;
      access_token?: string | null; expires_at?: number | null;
      token_type?: string | null; scope?: string | null;
      id_token?: string | null; session_state?: string | null;
    }): Promise<void> {
      // CRITICAL: Verify the member exists before linking
      const { data: member, error: memberError } = await supabase
        .from("members")
        .select("id, email")
        .eq("id", account.userId)
        .single();

      if (memberError || !member) {
        console.error("linkAccount: member not found for userId:", account.userId);
        throw new Error("Cannot link account: member not found");
      }

      // Check if this provider+providerAccountId is already linked to a DIFFERENT member
      const { data: existingLink } = await supabase
        .from("nextauth_accounts")
        .select("member_id")
        .eq("provider", account.provider)
        .eq("provider_account_id", account.providerAccountId)
        .single();

      if (existingLink) {
        if (existingLink.member_id === account.userId) {
          // Already correctly linked — no-op
          return;
        }
        // This OAuth account is linked to a different member — this should not happen
        console.error(
          `linkAccount: OAuth ${account.provider}/${account.providerAccountId} already linked to member ${existingLink.member_id}, refusing to re-link to ${account.userId}`
        );
        throw new Error("This OAuth account is already linked to a different member");
      }

      // Check if this member already has an account with this provider
      const { data: existingMemberLink } = await supabase
        .from("nextauth_accounts")
        .select("id")
        .eq("member_id", account.userId)
        .eq("provider", account.provider)
        .single();

      if (existingMemberLink) {
        // Member already has this provider linked — update instead of duplicate insert
        const { error: updateError } = await supabase
          .from("nextauth_accounts")
          .update({
            provider_account_id: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          })
          .eq("id", existingMemberLink.id);

        if (updateError) throw updateError;
        return;
      }

      // Insert the new link
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
        session_state: account.session_state,
      });
      if (error) {
        console.error("linkAccount insert error:", error.message, { provider: account.provider, userId: account.userId });
        throw error;
      }
    },

    async unlinkAccount({ providerAccountId, provider }: {
      providerAccountId: string; provider: string;
    }): Promise<void> {
      await supabase.from("nextauth_accounts").delete()
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId);
    },

    async createVerificationToken(token: {
      identifier: string; token: string; expires: Date;
    }) {
      const { data, error } = await supabase
        .from("nextauth_verification_tokens")
        .insert({
          identifier: token.identifier,
          token: token.token,
          expires: token.expires.toISOString(),
        }).select().single();
      if (error) throw error;
      return {
        identifier: data.identifier as string,
        token: data.token as string,
        expires: new Date(data.expires as string),
      };
    },

    async useVerificationToken({ identifier, token }: {
      identifier: string; token: string;
    }) {
      const { data, error } = await supabase
        .from("nextauth_verification_tokens").delete()
        .eq("identifier", identifier).eq("token", token)
        .select().single();
      if (error || !data) return null;
      return {
        identifier: data.identifier as string,
        token: data.token as string,
        expires: new Date(data.expires as string),
      };
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      return { ...session, id: session.sessionToken };
    },
    async getSessionAndUser() { return null; },
    async updateSession(session: { sessionToken: string }) {
      return { ...session, userId: "", expires: new Date(), id: "" };
    },
    async deleteSession() {},
  };
}

function mapMemberToAdapterUser(member: Record<string, unknown>): AdapterUser {
  return {
    id: member.id as string,
    email: member.email as string,
    emailVerified: member.email_verified
      ? new Date(member.email_verified as string)
      : null,
    name: (member.full_name as string) ||
      [member.first_name, member.last_name].filter(Boolean).join(" ") || null,
    image: (member.avatar_url as string) || null,
  };
}
