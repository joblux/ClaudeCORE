import { Adapter, AdapterUser } from "next-auth/adapters";
import { SupabaseClient } from "@supabase/supabase-js";

export function SupabaseAdapter(supabase: SupabaseClient): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
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
          role: "candidate",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          const { data: existing } = await supabase
            .from("members")
            .select()
            .eq("email", user.email)
            .single();
          if (existing) return mapMemberToAdapterUser(existing);
        }
        throw error;
      }
      return mapMemberToAdapterUser(data);
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const { data, error } = await supabase
        .from("members").select().eq("id", id).single();
      if (error || !data) return null;
      return mapMemberToAdapterUser(data);
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const { data, error } = await supabase
        .from("members").select().eq("email", email).single();
      if (error || !data) return null;
      return mapMemberToAdapterUser(data);
    },

    async getUserByAccount({ providerAccountId, provider }: {
      providerAccountId: string;
      provider: string;
    }): Promise<AdapterUser | null> {
      const { data: account, error: accountError } = await supabase
        .from("nextauth_accounts")
        .select("member_id")
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId)
        .single();
      if (accountError || !account) return null;
      const { data: member, error: memberError } = await supabase
        .from("members").select().eq("id", account.member_id).single();
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
        .from("members").update(updates).eq("id", user.id).select().single();
      if (error) throw error;
      return mapMemberToAdapterUser(data);
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
      if (error) throw error;
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
