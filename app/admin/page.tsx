import { requireAdmin } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const { data: pending } = await supabaseAdmin
    .from("members")
    .select("id, email, full_name, first_name, last_name, role, status, city, country, bio, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: approved } = await supabaseAdmin
    .from("members")
    .select("id, email, full_name, first_name, last_name, role, status, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const { data: all } = await supabaseAdmin
    .from("members")
    .select("id")
    .then((res) => res);

  return (
    <div>
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Administration</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-2">
            Admin Panel
          </h1>
          <p className="font-sans text-sm text-[#888]">
            Manage members, review applications, platform oversight.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="jl-card text-center">
            <div className="jl-serif text-3xl font-light text-[#a58e28]">{all?.length || 0}</div>
            <div className="jl-overline mt-1">Total Members</div>
          </div>
          <div className="jl-card text-center">
            <div className="jl-serif text-3xl font-light text-[#a58e28]">{pending?.length || 0}</div>
            <div className="jl-overline mt-1">Pending Review</div>
          </div>
          <div className="jl-card text-center">
            <div className="jl-serif text-3xl font-light text-[#a58e28]">{approved?.length || 0}</div>
            <div className="jl-overline mt-1">Approved</div>
          </div>
          <div className="jl-card text-center">
            <div className="jl-serif text-3xl font-light text-[#a58e28]">0</div>
            <div className="jl-overline mt-1">Open Briefs</div>
          </div>
        </div>

        <div className="jl-section-label"><span>Pending Review</span></div>
        {pending && pending.length > 0 ? (
          <div className="space-y-3 mb-10">
            {pending.map((m) => (
              <div key={m.id} className="jl-card flex items-start justify-between gap-4">
                <div>
                  <div className="font-sans text-sm font-medium text-[#1a1a1a]">
                    {m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ") || "No name"}
                  </div>
                  <div className="font-sans text-xs text-[#888] mt-0.5">{m.email}</div>
                  {m.city && <div className="font-sans text-xs text-[#aaa] mt-0.5">{m.city}{m.country ? `, ${m.country}` : ""}</div>}
                  {m.bio && <div className="font-sans text-xs text-[#666] mt-2 leading-relaxed">{m.bio}</div>}
                  <div className="jl-overline mt-2">Role: {m.role} · Applied: {new Date(m.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <form action={`/api/admin/approve/${m.id}`} method="POST">
                    <button className="jl-btn jl-btn-gold py-1.5 px-3 text-[0.6rem]">Approve</button>
                  </form>
                  <form action={`/api/admin/reject/${m.id}`} method="POST">
                    <button className="jl-btn jl-btn-outline py-1.5 px-3 text-[0.6rem]">Reject</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-[#fafaf5] border border-[#e8e2d8] text-center mb-10">
            <p className="font-sans text-sm text-[#888]">No pending applications right now.</p>
          </div>
        )}

        <div className="jl-section-label"><span>Approved Members</span></div>
        {approved && approved.length > 0 ? (
          <div className="space-y-2">
            {approved.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3 border-b border-[#f0ece4]">
                <div>
                  <div className="font-sans text-sm font-medium text-[#1a1a1a]">
                    {m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email}
                  </div>
                  <div className="font-sans text-xs text-[#888] mt-0.5">{m.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="jl-badge-gold text-[0.55rem]">{m.role}</span>
                  <span className="jl-overline">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-sans text-sm text-[#888]">No approved members yet.</p>
        )}
      </div>
    </div>
  );
}
