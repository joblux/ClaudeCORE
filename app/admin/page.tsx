"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRequireAdmin } from "@/lib/auth-hooks";
import { Search, Download, UserPlus, MoreHorizontal } from "lucide-react";

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
  cv_url: string | null;
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
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[#999]">Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}

function AdminPageContent() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const isBusinessView = viewParam === "business";

  const [members, setMembers] = useState<Member[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, pending: 0, approved: 0, rejected: 0, today: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState(isBusinessView ? "business" : "all");
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cvPreview, setCvPreview] = useState<string | null>(null);
  const [acting, setActing] = useState<Set<string>>(new Set());
  const [aiReviews, setAiReviews] = useState<Map<string, AIReview>>(new Map());
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [reassessing, setReassessing] = useState<Set<string>>(new Set());

  const displayName = (m: Member) =>
    m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;

  const getInitials = (m: Member) => {
    const name = m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ");
    if (name) return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return m.email[0].toUpperCase();
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      status: statusFilter,
      role: roleFilter,
      search: search,
    });
    try {
      const res = await fetch(`/api/admin/members?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMembers(data.members ?? []);
      setTotalRows(data.total ?? 0);
      setCounts(data.counts ?? { total: 0, pending: 0, approved: 0, rejected: 0, today: 0, thisWeek: 0 });
      if (data.aiReviews) {
        const map = new Map<string, AIReview>();
        data.aiReviews.forEach((r: any) => map.set(r.member_id, r));
        setAiReviews(map);
      }
    } catch { /* fetch failed */ }
    setLoading(false);
  }, [page, statusFilter, roleFilter, search]);

  const reassess = async (memberId: string) => {
    setReassessing((s) => new Set(s).add(memberId));
    try {
      await fetch("/api/admin/members/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });
      await fetchData();
    } catch { /* AI review request may fail */ }
    setReassessing((s) => { const n = new Set(s); n.delete(memberId); return n; });
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin, fetchData]);

  useEffect(() => { setPage(0); setSelected(new Set()); }, [search, statusFilter, roleFilter]);

  useEffect(() => {
    setRoleFilter(isBusinessView ? "business" : "all");
    setPage(0);
  }, [isBusinessView]);

  const updateStatus = async (id: string, newStatus: string) => {
    setActing((s) => new Set(s).add(id));
    await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id], status: newStatus }),
    });
    setActing((s) => { const n = new Set(s); n.delete(id); return n; });
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    await fetchData();
  };

  const batchUpdate = async (newStatus: string) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setActing(new Set(ids));
    await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status: newStatus }),
    });
    setActing(new Set());
    setSelected(new Set());
    await fetchData();
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () => {
    if (selected.size === members.length) setSelected(new Set());
    else setSelected(new Set(members.map((m) => m.id)));
  };

  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const startItem = page * PAGE_SIZE + 1;
  const endItem = Math.min((page + 1) * PAGE_SIZE, totalRows);

  const filteredMembers = members.filter((m) => {
    if (confidenceFilter === "all") return true;
    const review = aiReviews.get(m.id);
    if (confidenceFilter === "none") return !review;
    if (confidenceFilter === "auto_approved") return review?.auto_approved;
    return review?.confidence === confidenceFilter;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-sm text-[#999]">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {cvPreview && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex flex-col" onClick={() => setCvPreview(null)}>
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#e8e8e8]" onClick={e => e.stopPropagation()}>
            <span className="text-sm font-medium text-[#111]">CV Preview</span>
            <div className="flex items-center gap-4">
              <a href={cvPreview} target="_blank" rel="noopener noreferrer" className="text-sm text-[#444] hover:text-[#111] underline">Open in new tab →</a>
              <button onClick={() => setCvPreview(null)} className="text-[#999] hover:text-[#111] text-xl font-light leading-none">✕</button>
            </div>
          </div>
          <div className="flex-1 p-4" onClick={e => e.stopPropagation()}>
            <iframe src={cvPreview} className="w-full h-full rounded-lg border border-[#e8e8e8]" title="CV Preview" />
          </div>
        </div>
      )}
      {/* Topbar */}
      <div className="bg-white border-b border-[#e8e8e8] px-6 py-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-[#111]">Profiles</h1>
            <p className="text-sm text-[#999] mt-0.5">
              {counts.total} total &middot; {counts.pending} pending approval
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase bg-white border border-[#e0e0e0] rounded-lg text-[#444] hover:bg-[#fafafa] transition-colors">
              <Download size={13} />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase bg-[#111] text-white rounded-lg hover:bg-[#333] transition-colors">
              <UserPlus size={13} />
              Invite professional
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 lg:px-8">
        {/* Stat cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
          {([
            ["Total", counts.total, "all"],
            ["Pending", counts.pending, "pending"],
            ["Approved", counts.approved, "approved"],
            ["Rejected", counts.rejected, "rejected"],
            ["Today", counts.today, "all"],
            ["This Week", counts.thisWeek, "all"],
          ] as [string, number, string][]).map(([label, val, filter]) => (
            <button
              key={label}
              onClick={() => {
                if (filter !== "all") { setStatusFilter(filter); setRoleFilter("all"); }
                else { setStatusFilter("all"); setRoleFilter("all"); }
              }}
              className="bg-white border border-[#e8e8e8] rounded-lg p-3 text-center hover:border-[#ccc] transition-colors"
            >
              <div className="text-[22px] font-bold text-[#111]">{val}</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999] mt-1">{label}</div>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]" />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#e8e8e8] rounded-lg pl-9 pr-3 py-2 text-sm bg-white text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#ccc] transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-2 text-sm bg-white text-[#444] cursor-pointer focus:outline-none focus:border-[#ccc]"
          >
            <option value="all">All tiers</option>
            <option value="rising">Emerging</option>
            <option value="pro">Established</option>
            <option value="executive">Senior & Executive</option>
            <option value="business">Company</option>
            <option value="insider">Trusted Contributor</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-2 text-sm bg-white text-[#444] cursor-pointer focus:outline-none focus:border-[#ccc]"
          >
            <option value="all">Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-2 text-sm bg-white text-[#444] cursor-pointer focus:outline-none focus:border-[#ccc]"
          >
            <option value="all">All AI Scores</option>
            <option value="high">High Confidence</option>
            <option value="medium">Medium Confidence</option>
            <option value="low">Low Confidence</option>
            <option value="auto_approved">Auto-Approved</option>
            <option value="none">No AI Review</option>
          </select>

          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#999]">{selected.size} selected</span>
              <button
                onClick={() => batchUpdate("approved")}
                className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] rounded-lg hover:bg-[#dcfce7] transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => batchUpdate("rejected")}
                className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-lg hover:bg-[#fee2e2] transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Pending approval banner */}
        {counts.pending > 0 && (
          <div className="bg-[#fef3c7] border border-[#fde68a] rounded-lg p-4 mb-5 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-[#92400e]">{counts.pending} profile{counts.pending !== 1 ? 's' : ''} awaiting approval</span>
              <span className="text-sm text-[#b45309] ml-2">Review pending applications to grow the ecosystem</span>
            </div>
            <button
              onClick={() => { setStatusFilter("pending"); setRoleFilter("all"); }}
              className="text-sm font-medium text-[#92400e] hover:text-[#78350f] transition-colors whitespace-nowrap"
            >
              Review now &rarr;
            </button>
          </div>
        )}

        {/* Members table */}
        <div className="border border-[#e8e8e8] rounded-lg overflow-x-auto bg-white" style={{ minWidth: 0 }}>
          <div style={{ minWidth: 800 }}>
            {/* Table header */}
            <div className="hidden lg:grid bg-[#fafafa] px-5 py-3 text-[11px] uppercase tracking-wide text-[#999] font-medium border-b border-[#e8e8e8]" style={{ gridTemplateColumns: '36px 2fr 1.2fr 0.8fr 0.8fr 1fr 0.6fr' }}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={members.length > 0 && selected.size === members.length}
                  onChange={toggleAll}
                  className="rounded border-[#e0e0e0]"
                />
              </div>
              <div>Profile</div>
              <div>Email</div>
              <div>Tier</div>
              <div>Status</div>
              <div>AI Review</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table body */}
            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-[#999]">Loading...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-[#999]">No profiles found.</div>
            ) : (
              filteredMembers.map((m) => {
                const busy = acting.has(m.id);
                const review = aiReviews.get(m.id);
                const isPending = m.status === "pending";
                const confidenceColors: Record<string, string> = { high: "bg-green-500", medium: "bg-amber-500", low: "bg-red-500" };

                return (
                  <div
                    key={m.id}
                    className={`grid items-center px-5 py-3 border-t border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${busy ? 'opacity-50' : ''}`}
                    style={{ gridTemplateColumns: '36px 2fr 1.2fr 0.8fr 0.8fr 1fr 0.6fr' }}
                  >
                    {/* Checkbox */}
                    <div className="hidden lg:flex items-center">
                      <input
                        type="checkbox"
                        checked={selected.has(m.id)}
                        onChange={() => toggleSelect(m.id)}
                        disabled={busy}
                        className="rounded border-[#e0e0e0]"
                      />
                    </div>

                    {/* Member (avatar + name + subtitle) */}
                    <div className="flex items-center gap-3 col-span-2 lg:col-span-1">
                      <div className="w-[30px] h-[30px] rounded-full bg-[#e8e8e8] text-[#666] text-[10px] font-medium flex items-center justify-center flex-shrink-0">
                        {getInitials(m)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <a href={`/admin/members/${m.id}`} className="text-sm font-medium text-[#111] hover:text-[#444] transition-colors truncate block">
                            {displayName(m)}
                          </a>
                          {m.cv_url && (
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCvPreview(m.cv_url!); }}
                              className="flex-shrink-0 text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-[#dbeafe] text-[#1d4ed8] rounded hover:bg-[#bfdbfe] transition-colors"
                            >
                              CV
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-[#999] truncate">
                          {[m.city, m.country].filter(Boolean).join(", ") || "\u2014"} &middot; {m.profile_completeness ?? 0}% complete
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="hidden lg:block text-sm text-[#999] truncate">{m.email}</div>

                    {/* Tier badge */}
                    <div className="hidden lg:block">
                      <TierBadge role={m.role} />
                    </div>

                    {/* Status */}
                    <div className="hidden lg:block">
                      <StatusBadge status={m.status} />
                    </div>

                    {/* AI Review */}
                    <div className="hidden lg:block">
                      {review ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${confidenceColors[review.confidence] || 'bg-gray-400'}`} title={review.reasoning} />
                          <span className="text-[11px] text-[#999] uppercase tracking-wide">
                            {review.auto_approved ? "Auto" : review.recommendation === "approve" ? "Approve" : "Review"}
                          </span>
                          {isPending && (
                            <button
                              onClick={() => reassess(m.id)}
                              disabled={reassessing.has(m.id)}
                              className="text-[10px] text-[#444] hover:underline ml-1"
                            >
                              {reassessing.has(m.id) ? "..." : "Re-assess"}
                            </button>
                          )}
                        </div>
                      ) : isPending ? (
                        <button
                          onClick={() => reassess(m.id)}
                          disabled={reassessing.has(m.id)}
                          className="text-[11px] text-[#444] hover:underline"
                        >
                          {reassessing.has(m.id) ? "Assessing..." : "Run AI Review"}
                        </button>
                      ) : (
                        <span className="text-xs text-[#bbb]">&mdash;</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => updateStatus(m.id, "approved")}
                            disabled={busy}
                            className="px-3 py-1 text-[11px] font-medium bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] rounded hover:bg-[#dcfce7] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(m.id, "rejected")}
                            disabled={busy}
                            className="px-3 py-1 text-[11px] font-medium bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded hover:bg-[#fee2e2] transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className="relative group">
                          <button className="p-1.5 rounded hover:bg-[#f5f5f5] transition-colors text-[#999] hover:text-[#444]">
                            <MoreHorizontal size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 bg-white border border-[#e8e8e8] rounded-lg shadow-lg py-1 min-w-[140px] hidden group-hover:block z-10">
                            {m.status !== "approved" && (
                              <button onClick={() => updateStatus(m.id, "approved")} disabled={busy} className="w-full text-left px-3 py-1.5 text-xs text-[#444] hover:bg-[#fafafa]">
                                Approve
                              </button>
                            )}
                            {m.status !== "rejected" && (
                              <button onClick={() => updateStatus(m.id, "rejected")} disabled={busy} className="w-full text-left px-3 py-1.5 text-xs text-[#444] hover:bg-[#fafafa]">
                                Reject
                              </button>
                            )}
                            {(m.status === "approved" || m.status === "rejected") && (
                              <button onClick={() => updateStatus(m.id, "pending")} disabled={busy} className="w-full text-left px-3 py-1.5 text-xs text-[#444] hover:bg-[#fafafa]">
                                Reset to Pending
                              </button>
                            )}
                            <a href={`/admin/members/${m.id}`} className="block px-3 py-1.5 text-xs text-[#444] hover:bg-[#fafafa]">
                              View Profile
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm text-[#999]">
          <div>
            Showing {totalRows > 0 ? startItem : 0}-{endItem} of {totalRows} profiles
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => { setPage((p) => p - 1); setSelected(new Set()); }}
              className="px-3 py-1.5 text-xs border border-[#e0e0e0] rounded-lg bg-white text-[#444] disabled:opacity-40 disabled:cursor-default hover:bg-[#fafafa] transition-colors"
            >
              &larr; Prev
            </button>
            <span className="text-xs text-[#999] px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => { setPage((p) => p + 1); setSelected(new Set()); }}
              className="px-3 py-1.5 text-xs border border-[#e0e0e0] rounded-lg bg-white text-[#444] disabled:opacity-40 disabled:cursor-default hover:bg-[#fafafa] transition-colors"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Status badge */
function StatusBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    pending: "text-[#92400e] bg-[#fef3c7]",
    approved: "text-[#15803d] bg-[#dcfce7]",
    rejected: "text-[#dc2626] bg-[#fef2f2]",
    suspended: "text-purple-700 bg-purple-50",
  };
  const cls = styles[status ?? ""] ?? "text-[#999] bg-[#f5f5f5]";
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${cls}`}>
      {status ?? "unknown"}
    </span>
  );
}

/* Tier badge */
function TierBadge({ role }: { role: string | null }) {
  return (
    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wide text-[#555] bg-[#f5f5f5] border border-[#e8e8e8]">
      {role ?? "\u2014"}
    </span>
  );
}
