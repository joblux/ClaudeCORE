"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useRequireAdmin } from "@/lib/auth-hooks";
import type {
  MemberProfile,
  WorkExperience,
  EducationRecord,
  MemberLanguage,
  MemberDocument,
} from "@/types/member-profile";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GOLD = "#a58e28";
const BLACK = "#1a1a1a";
const CREAM = "#fafaf5";
const BORDER = "#e8e2d8";

type Tab = "overview" | "experience" | "skills" | "documents" | "preferences" | "notes" | "ai_review";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "ai_review", label: "AI Assessment" },
  { key: "experience", label: "Experience" },
  { key: "skills", label: "Skills" },
  { key: "documents", label: "Documents" },
  { key: "preferences", label: "Preferences" },
  { key: "notes", label: "Notes" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatMonthYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayName(m: MemberProfile): string {
  return m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

function RoleBadge({ role }: { role: string | null }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        padding: "3px 8px",
        background: `${GOLD}15`,
        color: GOLD,
        borderRadius: 2,
        border: `1px solid ${GOLD}30`,
      }}
    >
      {role ?? "professional"}
    </span>
  );
}

function TagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        padding: "4px 12px",
        background: "#fff",
        color: BLACK,
        border: `1px solid ${BORDER}`,
        borderRadius: 2,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: 2.5,
        textTransform: "uppercase",
        color: GOLD,
        marginBottom: 12,
        marginTop: 24,
      }}
    >
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: BLACK }}>{value || "—"}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MemberProfilePage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin();
  const params = useParams();
  const memberId = params.id as string;

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [acting, setActing] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [aiReview, setAiReview] = useState<any>(null);
  const [reassessing, setReassessing] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      // Fetch member
      const { data: m, error: mErr } = await supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .single();

      if (mErr || !m) {
        setError(true);
        setLoading(false);
        return;
      }

      // Fetch related records in parallel
      const [workRes, eduRes, langRes, docRes] = await Promise.all([
        supabase.from("work_experiences").select("*").eq("member_id", memberId).order("sort_order", { ascending: true }),
        supabase.from("education_records").select("*").eq("member_id", memberId).order("sort_order", { ascending: true }),
        supabase.from("member_languages").select("*").eq("member_id", memberId).order("created_at", { ascending: true }),
        supabase.from("member_documents").select("*").eq("member_id", memberId).order("uploaded_at", { ascending: false }),
      ]);

      const profile: MemberProfile = {
        ...m,
        work_experiences: (workRes.data as WorkExperience[]) ?? [],
        education_records: (eduRes.data as EducationRecord[]) ?? [],
        languages: (langRes.data as MemberLanguage[]) ?? [],
        documents: (docRes.data as MemberDocument[]) ?? [],
      };

      setMember(profile);
      setNotes((m as any).notes ?? "");

      // Fetch AI review
      const { data: reviewData } = await supabase
        .from("member_ai_reviews")
        .select("*")
        .eq("member_id", memberId)
        .single();
      if (reviewData) setAiReview(reviewData);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    if (!isAdmin || !memberId) return;
    fetchProfile();
  }, [isAdmin, memberId, fetchProfile]);

  const updateStatus = async (newStatus: string) => {
    if (!member) return;
    setActing(true);
    const update: Record<string, any> = { status: newStatus };
    if (newStatus === "approved") update.approved_at = new Date().toISOString();
    await supabase.from("members").update(update).eq("id", member.id);
    await fetchProfile();
    setActing(false);
  };

  const runAiReview = async () => {
    if (!member) return;
    setReassessing(true);
    try {
      const res = await fetch("/api/admin/members/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: member.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiReview({ ...data, created_at: new Date().toISOString() });
        if (data.auto_approved) await fetchProfile();
      }
    } catch {}
    setReassessing(false);
  };

  const saveNotes = async () => {
    if (!member) return;
    setNotesSaving(true);
    setNotesSaved(false);
    await supabase.from("members").update({ notes } as any).eq("id", member.id);
    setNotesSaving(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  // ---- Auth loading ----
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM }}>
        <div style={{ fontFamily: "sans-serif", fontSize: 14, color: "#888" }}>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  // ---- Data loading ----
  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM, fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: `2px solid ${BORDER}`, borderTopColor: GOLD, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 14, color: "#888" }}>Loading profile...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ---- Error / not found ----
  if (error || !member) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM, fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "serif", fontSize: 24, color: BLACK, marginBottom: 8 }}>Profile not found</div>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>The profile could not be loaded.</div>
          <a
            href="/admin"
            style={{
              display: "inline-block",
              padding: "10px 28px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              background: GOLD,
              color: "#fff",
              textDecoration: "none",
              border: "none",
            }}
          >
            Back to Admin
          </a>
        </div>
      </div>
    );
  }

  // ---- Full profile view ----
  const completeness = member.profile_completeness ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "sans-serif" }}>
      {/* Back link */}
      <div style={{ padding: "16px 32px 0" }}>
        <a href="/admin" style={{ fontSize: 12, color: GOLD, textDecoration: "none", letterSpacing: 0.5 }}>
          &larr; Back to Profiles
        </a>
      </div>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ flex: "1 1 400px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              {member.avatar_url && (
                <img
                  src={member.avatar_url}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `2px solid ${BORDER}` }}
                />
              )}
              <div>
                <h1 style={{ fontFamily: "serif", fontSize: 28, fontWeight: 400, color: BLACK, margin: 0, lineHeight: 1.2 }}>
                  {displayName(member)}
                </h1>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{member.email}</div>
              </div>
            </div>
            {member.headline && (
              <div style={{ fontSize: 14, color: "#666", marginTop: 8, fontStyle: "italic" }}>{member.headline}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
              <span style={{ fontSize: 11, color: "#aaa", marginLeft: 8 }}>
                Joined {formatDate(member.created_at as any)}
              </span>
            </div>

            {/* Profile completeness */}
            <div style={{ marginTop: 16, maxWidth: 320 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999" }}>Profile Completeness</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: GOLD }}>{completeness}%</span>
              </div>
              <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${completeness}%`, background: GOLD, borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {member.status !== "approved" && (
                <button
                  onClick={() => updateStatus("approved")}
                  disabled={acting}
                  style={{
                    padding: "8px 20px",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    background: GOLD,
                    color: "#fff",
                    border: "none",
                    cursor: acting ? "wait" : "pointer",
                    opacity: acting ? 0.6 : 1,
                  }}
                >
                  Approve
                </button>
              )}
              {member.status !== "rejected" && (
                <button
                  onClick={() => updateStatus("rejected")}
                  disabled={acting}
                  style={{
                    padding: "8px 20px",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    background: "#fff",
                    color: BLACK,
                    border: `1px solid ${BLACK}`,
                    cursor: acting ? "wait" : "pointer",
                    opacity: acting ? 0.6 : 1,
                  }}
                >
                  Reject
                </button>
              )}
            </div>
            <select
              value={member.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={acting}
              style={{
                padding: "6px 12px",
                fontSize: 11,
                border: `1px solid ${BORDER}`,
                background: "#fff",
                color: BLACK,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 32px", display: "flex", gap: 0, overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "14px 20px",
              fontSize: 11,
              fontWeight: activeTab === tab.key ? 600 : 400,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: activeTab === tab.key ? GOLD : "#999",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.key ? `2px solid ${GOLD}` : "2px solid transparent",
              cursor: "pointer",
              transition: "color 0.2s, border-color 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "24px 32px", maxWidth: 960, margin: "0 auto" }}>
        {activeTab === "overview" && <OverviewTab member={member} />}
        {activeTab === "ai_review" && (
          <AIReviewTab
            review={aiReview}
            reassessing={reassessing}
            onReassess={runAiReview}
          />
        )}
        {activeTab === "experience" && <ExperienceTab member={member} />}
        {activeTab === "skills" && <SkillsTab member={member} />}
        {activeTab === "documents" && <DocumentsTab member={member} />}
        {activeTab === "preferences" && <PreferencesTab member={member} />}
        {activeTab === "notes" && (
          <NotesTab
            notes={notes}
            setNotes={setNotes}
            saving={notesSaving}
            saved={notesSaved}
            onSave={saveNotes}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Overview
// ---------------------------------------------------------------------------

function OverviewTab({ member }: { member: MemberProfile }) {
  return (
    <>
      <SectionLabel>Personal Information</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0 40px" }}>
          <InfoRow label="Full Name" value={member.full_name} />
          <InfoRow label="Email" value={member.email} />
          <InfoRow label="Phone" value={member.phone} />
          <InfoRow
            label="Location"
            value={[member.city, member.country].filter(Boolean).join(", ") || null}
          />
          <InfoRow label="Nationality" value={member.nationality} />
          <InfoRow
            label="LinkedIn"
            value={
              member.linkedin_url ? (
                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: GOLD, textDecoration: "none" }}>
                  {member.linkedin_url}
                </a>
              ) : null
            }
          />
          <InfoRow label="Headline" value={member.headline} />
          <InfoRow label="Date of Birth" value={formatDate(member.date_of_birth)} />
        </div>
        {member.bio && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Bio</div>
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{member.bio}</div>
          </div>
        )}
      </div>

      <SectionLabel>Professional Summary</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0 40px" }}>
          <InfoRow label="Job Title" value={member.job_title} />
          <InfoRow label="Current Employer" value={member.current_employer || member.maison} />
          <InfoRow label="Seniority" value={member.seniority} />
          <InfoRow label="Department" value={member.department} />
          <InfoRow
            label="Total Experience"
            value={member.total_years_experience != null ? `${member.total_years_experience} years` : null}
          />
          <InfoRow
            label="Years in Luxury"
            value={member.years_in_luxury != null ? `${member.years_in_luxury} years` : null}
          />
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab: Experience
// ---------------------------------------------------------------------------

function ExperienceTab({ member }: { member: MemberProfile }) {
  const work = member.work_experiences ?? [];
  const education = member.education_records ?? [];

  return (
    <>
      <SectionLabel>Work History</SectionLabel>
      {work.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "32px 28px", textAlign: "center", color: "#999", fontSize: 13 }}>
          No work experience recorded.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {work.map((w) => (
            <div key={w.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "20px 24px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: BLACK }}>{w.job_title}</div>
                  <div style={{ fontSize: 14, color: GOLD, marginTop: 2 }}>{w.company}</div>
                </div>
                <div style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>
                  {formatMonthYear(w.start_date)} — {w.is_current ? "Present" : formatMonthYear(w.end_date)}
                </div>
              </div>
              {(w.department || w.city || w.country) && (
                <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                  {[w.department, [w.city, w.country].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                </div>
              )}
              {w.description && (
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginTop: 10, whiteSpace: "pre-wrap" }}>
                  {w.description}
                </div>
              )}
              {w.is_current && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    borderRadius: 2,
                  }}
                >
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <SectionLabel>Education</SectionLabel>
      {education.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "32px 28px", textAlign: "center", color: "#999", fontSize: 13 }}>
          No education records.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {education.map((e) => (
            <div key={e.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: BLACK }}>{e.institution}</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
                    {e.degree_level}{e.field_of_study ? ` in ${e.field_of_study}` : ""}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  {e.start_year ?? "?"} — {e.graduation_year ?? "?"}
                </div>
              </div>
              {(e.city || e.country) && (
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  {[e.city, e.country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab: Skills
// ---------------------------------------------------------------------------

function SkillsTab({ member }: { member: MemberProfile }) {
  const languages = member.languages ?? [];

  const proficiencyColor: Record<string, { bg: string; fg: string }> = {
    native: { bg: "#e8f5e9", fg: "#2e7d32" },
    fluent: { bg: "#e3f2fd", fg: "#1565c0" },
    professional: { bg: "#fff8e1", fg: "#b8860b" },
    conversational: { bg: "#f3e5f5", fg: "#6a1b9a" },
    basic: { bg: "#f5f5f5", fg: "#999" },
  };

  return (
    <>
      <SectionLabel>Languages</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "20px 24px", marginBottom: 20 }}>
        {languages.length === 0 ? (
          <div style={{ color: "#999", fontSize: 13 }}>No languages listed.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {languages.map((l) => {
              const pc = proficiencyColor[l.proficiency] ?? { bg: "#f5f5f5", fg: "#999" };
              return (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    background: "#fff",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 2,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: BLACK }}>{l.language}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      background: pc.bg,
                      color: pc.fg,
                      borderRadius: 2,
                    }}
                  >
                    {l.proficiency}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SectionLabel>Key Skills</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "20px 24px", marginBottom: 20 }}>
        {(member.key_skills?.length ?? 0) === 0 ? (
          <div style={{ color: "#999", fontSize: 13 }}>No skills listed.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {member.key_skills!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
          </div>
        )}
      </div>

      <SectionLabel>Software &amp; Tools</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "20px 24px", marginBottom: 20 }}>
        {(member.software_tools?.length ?? 0) === 0 ? (
          <div style={{ color: "#999", fontSize: 13 }}>No tools listed.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {member.software_tools!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
          </div>
        )}
      </div>

      <SectionLabel>Certifications</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "20px 24px", marginBottom: 20 }}>
        {(member.certifications?.length ?? 0) === 0 ? (
          <div style={{ color: "#999", fontSize: 13 }}>No certifications listed.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {member.certifications!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
          </div>
        )}
      </div>

      <SectionLabel>Luxury Profile</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px 40px" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Product Categories</div>
            {(member.product_categories?.length ?? 0) === 0 ? (
              <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {member.product_categories!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Brands Worked With</div>
            {(member.brands_worked_with?.length ?? 0) === 0 ? (
              <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {member.brands_worked_with!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Client Segments</div>
            {(member.client_segment_experience?.length ?? 0) === 0 ? (
              <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {member.client_segment_experience!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Market Knowledge</div>
            {(member.market_knowledge?.length ?? 0) === 0 ? (
              <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {member.market_knowledge!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Clienteling Experience</div>
            <div style={{ fontSize: 14, color: BLACK }}>
              {member.clienteling_experience ? "Yes" : "No"}
              {member.clienteling_description && (
                <span style={{ color: "#666", marginLeft: 8 }}>— {member.clienteling_description}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab: Documents
// ---------------------------------------------------------------------------

function DocumentsTab({ member }: { member: MemberProfile }) {
  const docs = member.documents ?? [];

  const typeColor: Record<string, { bg: string; fg: string }> = {
    cv: { bg: "#e3f2fd", fg: "#1565c0" },
    cover_letter: { bg: "#fff8e1", fg: "#b8860b" },
    portfolio: { bg: "#f3e5f5", fg: "#6a1b9a" },
    certificate: { bg: "#e8f5e9", fg: "#2e7d32" },
    reference: { bg: "#fce4ec", fg: "#c62828" },
    other: { bg: "#f5f5f5", fg: "#999" },
  };

  return (
    <>
      <SectionLabel>Uploaded Documents</SectionLabel>
      {docs.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "32px 28px", textAlign: "center", color: "#999", fontSize: 13 }}>
          No documents uploaded.
        </div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: CREAM, borderBottom: `2px solid ${BORDER}` }}>
                <th style={docTh}>File</th>
                <th style={docTh}>Type</th>
                <th style={docTh}>Size</th>
                <th style={docTh}>Uploaded</th>
                <th style={docTh}></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                const tc = typeColor[d.document_type] ?? typeColor.other;
                return (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "12px 14px" }}>
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: GOLD, textDecoration: "none", fontWeight: 500 }}
                      >
                        {d.file_name}
                      </a>
                      {d.label && <span style={{ fontSize: 11, color: "#999", marginLeft: 8 }}>({d.label})</span>}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          background: tc.bg,
                          color: tc.fg,
                          borderRadius: 2,
                        }}
                      >
                        {d.document_type.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#888", fontSize: 12 }}>{formatFileSize(d.file_size)}</td>
                    <td style={{ padding: "12px 14px", color: "#999", fontSize: 12 }}>{formatDate(d.uploaded_at)}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      {d.is_primary && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            padding: "3px 8px",
                            background: `${GOLD}15`,
                            color: GOLD,
                            borderRadius: 2,
                            border: `1px solid ${GOLD}30`,
                          }}
                        >
                          Primary CV
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const docTh: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 9,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "#999",
  fontWeight: 600,
};

// ---------------------------------------------------------------------------
// Tab: Preferences
// ---------------------------------------------------------------------------

function PreferencesTab({ member }: { member: MemberProfile }) {
  const salaryRange =
    member.desired_salary_min != null || member.desired_salary_max != null
      ? `${member.desired_salary_currency ?? "USD"} ${member.desired_salary_min?.toLocaleString() ?? "?"} — ${member.desired_salary_max?.toLocaleString() ?? "?"}`
      : null;

  return (
    <>
      <SectionLabel>Availability &amp; Preferences</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0 40px" }}>
          <InfoRow label="Availability" value={member.availability} />
          <InfoRow label="Desired Salary Range" value={salaryRange} />
          <InfoRow label="Open to Relocation" value={member.open_to_relocation ? "Yes" : "No"} />
          <InfoRow label="Relocation Preferences" value={member.relocation_preferences} />
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px 40px" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Desired Locations</div>
              {(member.desired_locations?.length ?? 0) === 0 ? (
                <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {member.desired_locations!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Contract Types</div>
              {(member.desired_contract_types?.length ?? 0) === 0 ? (
                <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {member.desired_contract_types!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Desired Departments</div>
              {(member.desired_departments?.length ?? 0) === 0 ? (
                <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {member.desired_departments!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab: Notes
// ---------------------------------------------------------------------------

function NotesTab({
  notes,
  setNotes,
  saving,
  saved,
  onSave,
}: {
  notes: string;
  setNotes: (v: string) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <>
      <SectionLabel>Admin Notes</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "24px 28px" }}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add private notes about this member..."
          style={{
            width: "100%",
            minHeight: 200,
            padding: "14px 16px",
            fontSize: 14,
            lineHeight: 1.7,
            color: BLACK,
            border: `1px solid ${BORDER}`,
            background: CREAM,
            outline: "none",
            resize: "vertical",
            fontFamily: "sans-serif",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: "10px 28px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              background: GOLD,
              color: "#fff",
              border: "none",
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
          {saved && (
            <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 500 }}>Notes saved.</span>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab: AI Assessment
// ---------------------------------------------------------------------------

function AIReviewTab({
  review,
  reassessing,
  onReassess,
}: {
  review: any;
  reassessing: boolean;
  onReassess: () => void;
}) {
  const confidenceColors: Record<string, { bg: string; fg: string }> = {
    high: { bg: "#dcfce7", fg: "#22c55e" },
    medium: { bg: "#fef3c7", fg: "#f59e0b" },
    low: { bg: "#fee2e2", fg: "#ef4444" },
  };

  return (
    <>
      <SectionLabel>AI Smart Review</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 20 }}>
        {review ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: confidenceColors[review.confidence]?.fg || "#999",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    background: confidenceColors[review.confidence]?.bg || "#f5f5f5",
                    color: confidenceColors[review.confidence]?.fg || "#999",
                    borderRadius: 2,
                  }}
                >
                  {review.confidence} confidence
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: review.recommendation === "approve" ? "#22c55e" : GOLD,
                }}
              >
                Recommend: {review.recommendation}
              </span>
            </div>

            <InfoRow label="Reasoning" value={review.reasoning} />
            <InfoRow label="Auto-Approved" value={review.auto_approved ? "Yes" : "No"} />
            <InfoRow label="Model" value={review.model_used || "claude-sonnet-4-20250514"} />
            <InfoRow
              label="Assessed At"
              value={review.created_at ? new Date(review.created_at).toLocaleString() : "—"}
            />

            <div style={{ marginTop: 20 }}>
              <button
                onClick={onReassess}
                disabled={reassessing}
                style={{
                  padding: "8px 20px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  background: reassessing ? "#eee" : "#fff",
                  color: BLACK,
                  border: `1px solid ${BORDER}`,
                  cursor: reassessing ? "wait" : "pointer",
                }}
              >
                {reassessing ? "Re-assessing..." : "Re-assess"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>
              No AI assessment has been run for this member yet.
            </p>
            <button
              onClick={onReassess}
              disabled={reassessing}
              style={{
                padding: "10px 28px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                background: GOLD,
                color: "#fff",
                border: "none",
                cursor: reassessing ? "wait" : "pointer",
                opacity: reassessing ? 0.6 : 1,
              }}
            >
              {reassessing ? "Running AI Review..." : "Run AI Review"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
