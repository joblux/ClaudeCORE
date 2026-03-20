"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRequireAdmin } from "@/lib/auth-hooks";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GOLD = "#a58e28";
const BLACK = "#1a1a1a";
const PAGE_SIZE = 25;

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  status: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  created_at: string;
  approved_at: string | null;
  last_login: string | null;
  profile_completeness: number | null;
};

type AIReview = {
  member_id: string;
  confidence: string;
  reasoning: string;
  recommendation: string;
  auto_approved: boolean;
};

type Counts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  thisWeek: number;
};

export default function AdminPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin();

  const [members, setMembers] = useState<Member[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, pending: 0, approved: 0, rejected: 0, today: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState<Set<string>>(new Set());
  const [aiReviews, setAiReviews] = useState<Map<string, AIReview>>(new Map());
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [reassessing, setReassessing] = useState<Set<string>>(new Set());

  const displayName = (m: Member) =>
    m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;

  const fetchCounts = useCallback(async () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const day = now.getDay();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1)).toISOString();

    const [total, pending, approved, rejected, today, thisWeek] = await Promise.all([
      supabase.from("members").select("id", { count: "exact", head: true }),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "rejected"),
      supabase.from("members").select("id", { count: "exact", head: true }).gte("created_at", startOfDay),
      supabase.from("members").select("id", { count: "exact", head: true }).gte("created_at", startOfWeek),
    ]);

    setCounts({
      total: total.count ?? 0,
      pending: pending.count ?? 0,
      approved: approved.count ?? 0,
      rejected: rejected.count ?? 0,
      today: today.count ?? 0,
      thisWeek: thisWeek.count ?? 0,
    });
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("members")
      .select("id, email, full_name, first_name, last_name, role, status, city, country, bio, avatar_url, auth_provider, created_at, approved_at, last_login, profile_completeness", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (roleFilter !== "all") query = query.eq("role", roleFilter);
    if (search.trim()) {
      const s = `%${search.trim()}%`;
      query = query.or(`email.ilike.${s},full_name.ilike.${s},first_name.ilike.${s},last_name.ilike.${s}`);
    }

    const { data, count } = await query;
    setMembers(data ?? []);
    setTotalRows(count ?? 0);
    setLoading(false);
  }, [page, statusFilter, roleFilter, search]);

  const fetchAIReviews = useCallback(async () => {
    const { data } = await supabase
      .from("member_ai_reviews")
      .select("member_id, confidence, reasoning, recommendation, auto_approved");
    if (data) {
      const map = new Map<string, AIReview>();
      data.forEach((r: any) => map.set(r.member_id, r));
      setAiReviews(map);
    }
  }, []);

  const reassess = async (memberId: string) => {
    setReassessing((s) => new Set(s).add(memberId));
    try {
      await fetch("/api/admin/members/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });
      await fetchAIReviews();
      await fetchMembers();
    } catch {}
    setReassessing((s) => { const n = new Set(s); n.delete(memberId); return n; });
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchCounts();
    fetchMembers();
    fetchAIReviews();
  }, [isAdmin, fetchCounts, fetchMembers, fetchAIReviews]);

  useEffect(() => { setPage(0); setSelected(new Set()); }, [search, statusFilter, roleFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    setActing((s) => new Set(s).add(id));
    if (newStatus === "approved") {
      await supabase.from("members").update({ status: newStatus, approved_at: new Date().toISOString() } as any).eq("id", id);
    } else {
      await supabase.from("members").update({ status: newStatus } as any).eq("id", id);
    }
    setActing((s) => { const n = new Set(s); n.delete(id); return n; });
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    await Promise.all([fetchMembers(), fetchCounts()]);
  };

  const batchUpdate = async (newStatus: string) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setActing(new Set(ids));
    if (newStatus === "approved") {
      await supabase.from("members").update({ status: newStatus, approved_at: new Date().toISOString() } as any).in("id", ids);
    } else {
      await supabase.from("members").update({ status: newStatus } as any).in("id", ids);
    }
    setActing(new Set());
    setSelected(new Set());
    await Promise.all([fetchMembers(), fetchCounts()]);
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () => {
    if (selected.size === members.length) setSelected(new Set());
    else setSelected(new Set(members.map((m) => m.id)));
  };

  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf5" }}>
        <div style={{ fontFamily: "sans-serif", fontSize: 14, color: "#888" }}>Loading…</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf5", fontFamily: "sans-serif" }}>
      {/* Page header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e2d8", padding: "20px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOLD, fontWeight: 500, marginBottom: 4 }}>Society</div>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 400, color: BLACK, margin: 0 }}>Members</h1>
      </div>

      {/* Analytics strip */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e2d8", padding: "16px 24px", display: "flex", gap: 0, overflowX: "auto" }}>
        {([
          ["Total", counts.total],
          ["Pending", counts.pending],
          ["Approved", counts.approved],
          ["Rejected", counts.rejected],
          ["Today", counts.today],
          ["This Week", counts.thisWeek],
        ] as [string, number][]).map(([label, val], i) => (
          <div
            key={label}
            style={{
              flex: "1 0 auto",
              textAlign: "center",
              padding: "8px 20px",
              borderRight: i < 5 ? "1px solid #f0ece4" : "none",
              cursor: "pointer",
            }}
            onClick={() => {
              if (label === "Pending") { setStatusFilter("pending"); setRoleFilter("all"); }
              else if (label === "Approved") { setStatusFilter("approved"); setRoleFilter("all"); }
              else if (label === "Rejected") { setStatusFilter("rejected"); setRoleFilter("all"); }
              else { setStatusFilter("all"); setRoleFilter("all"); }
            }}
          >
            <div style={{ fontFamily: "serif", fontSize: 26, fontWeight: 300, color: GOLD, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ padding: "16px 24px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 220px",
            padding: "8px 12px",
            fontSize: 13,
            border: "1px solid #ddd",
            background: "#fff",
            outline: "none",
            minWidth: 180,
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
        >
          <option value="all">All Roles</option>
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
          <option value="influencer">Influencer</option>
          <option value="rising">Rising</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
          style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
        >
          <option value="all">All AI Scores</option>
          <option value="high">High Confidence</option>
          <option value="medium">Medium Confidence</option>
          <option value="low">Low Confidence</option>
          <option value="auto_approved">Auto-Approved</option>
          <option value="none">No AI Review</option>
        </select>

        {selected.size > 0 && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#888" }}>{selected.size} selected</span>
            <button
              onClick={() => batchUpdate("approved")}
              style={{ padding: "6px 14px", fontSize: 11, fontWeight: 600, background: GOLD, color: "#fff", border: "none", cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}
            >
              Approve
            </button>
            <button
              onClick={() => batchUpdate("rejected")}
              style={{ padding: "6px 14px", fontSize: 11, fontWeight: 600, background: "#fff", color: BLACK, border: `1px solid ${BLACK}`, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ padding: "0 24px 24px" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e2d8", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafaf5", borderBottom: "2px solid #e8e2d8" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", width: 36 }}>
                  <input type="checkbox" checked={members.length > 0 && selected.size === members.length} onChange={toggleAll} />
                </th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>AI Review</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Profile</th>
                <th style={thStyle}>Joined</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading…</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: "#999" }}>No members found.</td></tr>
              ) : (
                members.filter((m) => {
                  if (confidenceFilter === "all") return true;
                  const review = aiReviews.get(m.id);
                  if (confidenceFilter === "none") return !review;
                  if (confidenceFilter === "auto_approved") return review?.auto_approved;
                  return review?.confidence === confidenceFilter;
                }).map((m) => {
                  const busy = acting.has(m.id);
                  const review = aiReviews.get(m.id);
                  const confidenceColors: Record<string, string> = { high: "#22c55e", medium: "#f59e0b", low: "#ef4444" };
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid #f0ece4", opacity: busy ? 0.5 : 1 }}>
                      <td style={{ padding: "10px 12px" }}>
                        <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} disabled={busy} />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500, color: BLACK }}>{displayName(m)}</div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "#666" }}>{m.email}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: GOLD, fontWeight: 600 }}>{m.role ?? "—"}</span>
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={m.status} />
                      </td>
                      <td style={tdStyle}>
                        {review ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span
                              style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: confidenceColors[review.confidence] || "#999", display: "inline-block" }}
                              title={review.reasoning}
                            />
                            <span style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>
                              {review.auto_approved ? "Auto" : review.recommendation === "approve" ? "Approve" : "Review"}
                            </span>
                            {m.status === "pending" && (
                              <button
                                onClick={() => reassess(m.id)}
                                disabled={reassessing.has(m.id)}
                                style={{ fontSize: 9, color: GOLD, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, minHeight: "auto", minWidth: "auto" }}
                              >
                                {reassessing.has(m.id) ? "..." : "Re-assess"}
                              </button>
                            )}
                          </div>
                        ) : m.status === "pending" ? (
                          <button
                            onClick={() => reassess(m.id)}
                            disabled={reassessing.has(m.id)}
                            style={{ fontSize: 10, color: GOLD, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, minHeight: "auto", minWidth: "auto" }}
                          >
                            {reassessing.has(m.id) ? "Assessing..." : "Run AI Review"}
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "#ccc" }}>—</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "#888" }}>
                        {[m.city, m.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td style={tdStyle}>
                        <a href={`/admin/members/${m.id}`} style={{ fontSize: 11, color: GOLD, textDecoration: "none", fontWeight: 500, letterSpacing: 0.5 }}>
                          {m.profile_completeness ?? 0}% ›
                        </a>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 11, color: "#aaa" }}>{new Date(m.created_at).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                        {m.status !== "approved" && (
                          <button
                            onClick={() => updateStatus(m.id, "approved")}
                            disabled={busy}
                            style={actionBtn(GOLD, "#fff")}
                          >
                            Approve
                          </button>
                        )}
                        {m.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(m.id, "rejected")}
                            disabled={busy}
                            style={actionBtn("#fff", BLACK, `1px solid #ccc`)}
                          >
                            Reject
                          </button>
                        )}
                        {(m.status === "approved" || m.status === "rejected") && (
                          <button
                            onClick={() => updateStatus(m.id, "pending")}
                            disabled={busy}
                            style={actionBtn("#fafaf5", "#888", "1px solid #ddd")}
                          >
                            Undo
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <div style={{ fontSize: 11, color: "#999" }}>
            {totalRows} member{totalRows !== 1 ? "s" : ""} · Page {page + 1} of {totalPages}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              disabled={page === 0}
              onClick={() => { setPage((p) => p - 1); setSelected(new Set()); }}
              style={pagBtn(page === 0)}
            >
              ← Prev
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => { setPage((p) => p + 1); setSelected(new Set()); }}
              style={pagBtn(page + 1 >= totalPages)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "#fff8e1", fg: "#b8860b" },
    approved: { bg: "#e8f5e9", fg: "#2e7d32" },
    rejected: { bg: "#fce4ec", fg: "#c62828" },
    suspended: { bg: "#f3e5f5", fg: "#6a1b9a" },
  };
  const c = colors[status ?? ""] ?? { bg: "#f5f5f5", fg: "#999" };
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: "uppercase",
        padding: "3px 8px",
        background: c.bg,
        color: c.fg,
        borderRadius: 2,
      }}
    >
      {status ?? "unknown"}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 9,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "#999",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
};

const actionBtn = (bg: string, fg: string, border?: string): React.CSSProperties => ({
  padding: "4px 10px",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: "uppercase",
  background: bg,
  color: fg,
  border: border ?? "none",
  cursor: "pointer",
  marginLeft: 4,
});

const pagBtn = (disabled: boolean): React.CSSProperties => ({
  padding: "6px 14px",
  fontSize: 11,
  background: disabled ? "#f5f5f5" : "#fff",
  color: disabled ? "#ccc" : "#1a1a1a",
  border: "1px solid #ddd",
  cursor: disabled ? "default" : "pointer",
});
