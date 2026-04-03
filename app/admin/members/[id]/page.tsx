"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRequireAdmin } from "@/lib/auth-hooks";
import type {
  MemberProfile,
  WorkExperience,
  EducationRecord,
  MemberLanguage,
  MemberDocument,
} from "@/types/member-profile";

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
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatMonthYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "\u2014";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayName(m: MemberProfile): string {
  return m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;
}

function getInitials(m: MemberProfile): string {
  const name = m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ");
  if (name) return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return m.email[0].toUpperCase();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    pending: "text-[#92400e] bg-[#fef3c7]",
    approved: "text-[#15803d] bg-[#dcfce7]",
    rejected: "text-[#dc2626] bg-[#fef2f2]",
    suspended: "text-purple-700 bg-purple-50",
  };
  const cls = styles[status ?? ""] ?? "text-[#999] bg-[#f5f5f5]";
  return (
    <span className={`inline-block text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${cls}`}>
      {status ?? "unknown"}
    </span>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  return (
    <span className="inline-block text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded text-[#555] bg-[#f5f5f5] border border-[#e8e8e8]">
      {role ?? "professional"}
    </span>
  );
}

function TagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs px-3 py-1 bg-white text-[#444] border border-[#e8e8e8] rounded mr-1.5 mb-1.5">
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#aaa] mb-3 mt-6 first:mt-0">
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-0.5">{label}</div>
      <div className="text-sm text-[#111]">{value || "\u2014"}</div>
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
      const res = await fetch(`/api/admin/members/${memberId}`);
      if (!res.ok) {
        setError(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const profile: MemberProfile = {
        ...data.member,
        work_experiences: (data.member.work_experiences as WorkExperience[]) ?? [],
        education_records: (data.member.education_records as EducationRecord[]) ?? [],
        languages: (data.member.languages as MemberLanguage[]) ?? [],
        documents: (data.member.documents as MemberDocument[]) ?? [],
      };

      setMember(profile);
      setNotes(data.member.notes ?? "");
      if (data.aiReview) setAiReview(data.aiReview);
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
    await fetch(`/api/admin/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", status: newStatus }),
    });
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
    await fetch(`/api/admin/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_notes", notes }),
    });
    setNotesSaving(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  // ---- Auth loading ----
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-sm text-[#999]">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  // ---- Data loading ----
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm text-[#999]">Loading profile...</div>
        </div>
      </div>
    );
  }

  // ---- Error / not found ----
  if (error || !member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="text-xl font-semibold text-[#111] mb-2">Profile not found</div>
          <div className="text-sm text-[#999] mb-6">The profile could not be loaded.</div>
          <a
            href="/admin"
            className="inline-block px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide bg-[#111] text-white rounded-lg hover:bg-[#333] transition-colors no-underline"
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
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Topbar */}
      <div className="bg-white border-b border-[#e8e8e8] px-8 py-4">
        <div className="flex items-center justify-between">
          <a href="/admin" className="text-sm text-[#999] hover:text-[#444] no-underline transition-colors">
            &larr; Back to Profiles
          </a>
          <div className="flex items-center gap-2">
            {member.status !== "approved" && (
              <button
                onClick={() => updateStatus("approved")}
                disabled={acting}
                className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] rounded-lg hover:bg-[#dcfce7] transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                Approve
              </button>
            )}
            {member.status !== "rejected" && (
              <button
                onClick={() => updateStatus("rejected")}
                disabled={acting}
                className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-lg hover:bg-[#fee2e2] transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                Reject
              </button>
            )}
            <select
              value={member.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={acting}
              className="px-3 py-2 text-xs border border-[#e8e8e8] bg-white text-[#444] rounded-lg cursor-pointer focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white border-b border-[#e8e8e8] px-8 py-6">
        <div className="flex items-start gap-4">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover border border-[#e8e8e8]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#e8e8e8] text-[#666] text-sm font-medium flex items-center justify-center flex-shrink-0">
              {getInitials(member)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-[#111] m-0 leading-tight">
              {displayName(member)}
            </h1>
            <div className="text-sm text-[#999] mt-0.5">{member.email}</div>
            {member.role === 'business' && (member as any).company_name && (
              <div className="text-[13px] text-[#888] mt-0.5">{(member as any).company_name}</div>
            )}
            {member.headline && (
              <div className="text-sm text-[#444] mt-1">{member.headline}</div>
            )}
            <div className="flex items-center gap-2 mt-2.5">
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
              <span className="text-xs text-[#bbb] ml-2">
                Joined {formatDate(member.created_at as any)}
              </span>
            </div>

            {/* Profile completeness */}
            <div className="mt-4 max-w-xs">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#999]">Profile Completeness</span>
                <span className="text-xs font-semibold text-[#111]">{completeness}%</span>
              </div>
              <div className="h-1.5 bg-[#e8e8e8] rounded-full overflow-hidden">
                <div className="h-full bg-[#111] rounded-full transition-all duration-400" style={{ width: `${completeness}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#e8e8e8] px-8 flex gap-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3.5 text-[11px] uppercase tracking-[0.1em] border-b-2 bg-transparent cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'font-semibold text-[#111] border-[#111]'
                : 'font-normal text-[#999] border-transparent hover:text-[#444]'
            }`}
            style={{ border: 'none', borderBottom: activeTab === tab.key ? '2px solid #111' : '2px solid transparent' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-8 py-6 max-w-[960px] mx-auto">
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
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
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
                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#111] underline hover:text-[#444]">
                  {member.linkedin_url}
                </a>
              ) : null
            }
          />
          <InfoRow label="Headline" value={member.headline} />
          <InfoRow label="Date of Birth" value={formatDate(member.date_of_birth)} />
        </div>
        {member.bio && (
          <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-1.5">Bio</div>
            <div className="text-sm text-[#444] leading-relaxed whitespace-pre-wrap">{member.bio}</div>
          </div>
        )}
      </div>

      <SectionLabel>Professional Summary</SectionLabel>
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
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
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-8 text-center text-sm text-[#999]">
          No work experience recorded.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {work.map((w) => (
            <div key={w.id} className="bg-white border border-[#e8e8e8] rounded-lg p-5 relative">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="text-base font-medium text-[#111]">{w.job_title}</div>
                  <div className="text-sm text-[#444] mt-0.5">{w.company}</div>
                </div>
                <div className="text-xs text-[#999] whitespace-nowrap">
                  {formatMonthYear(w.start_date)} &mdash; {w.is_current ? "Present" : formatMonthYear(w.end_date)}
                </div>
              </div>
              {(w.department || w.city || w.country) && (
                <div className="text-xs text-[#999] mt-1.5">
                  {[w.department, [w.city, w.country].filter(Boolean).join(", ")].filter(Boolean).join(" \u00B7 ")}
                </div>
              )}
              {w.description && (
                <div className="text-sm text-[#444] leading-relaxed mt-2.5 whitespace-pre-wrap">
                  {w.description}
                </div>
              )}
              {w.is_current && (
                <span className="absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-[#dcfce7] text-[#15803d] rounded">
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <SectionLabel>Education</SectionLabel>
      {education.length === 0 ? (
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-8 text-center text-sm text-[#999]">
          No education records.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {education.map((e) => (
            <div key={e.id} className="bg-white border border-[#e8e8e8] rounded-lg p-5">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="text-[15px] font-medium text-[#111]">{e.institution}</div>
                  <div className="text-sm text-[#444] mt-0.5">
                    {e.degree_level}{e.field_of_study ? ` in ${e.field_of_study}` : ""}
                  </div>
                </div>
                <div className="text-xs text-[#999]">
                  {e.start_year ?? "?"} &mdash; {e.graduation_year ?? "?"}
                </div>
              </div>
              {(e.city || e.country) && (
                <div className="text-xs text-[#999] mt-1">
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

  const proficiencyStyles: Record<string, string> = {
    native: "bg-[#dcfce7] text-[#15803d]",
    fluent: "bg-[#dbeafe] text-[#1d4ed8]",
    professional: "bg-[#fef3c7] text-[#92400e]",
    conversational: "bg-purple-50 text-purple-700",
    basic: "bg-[#f5f5f5] text-[#999]",
  };

  return (
    <>
      <SectionLabel>Languages</SectionLabel>
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-5 mb-5">
        {languages.length === 0 ? (
          <div className="text-sm text-[#999]">No languages listed.</div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {languages.map((l) => {
              const pcls = proficiencyStyles[l.proficiency] ?? proficiencyStyles.basic;
              return (
                <div
                  key={l.id}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#e8e8e8] rounded"
                >
                  <span className="text-sm font-medium text-[#111]">{l.language}</span>
                  <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${pcls}`}>
                    {l.proficiency}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SectionLabel>Key Skills</SectionLabel>
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-5 mb-5">
        {(member.key_skills?.length ?? 0) === 0 ? (
          <div className="text-sm text-[#999]">No skills listed.</div>
        ) : (
          <div className="flex flex-wrap">
            {member.key_skills!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
          </div>
        )}
      </div>

      <SectionLabel>Software &amp; Tools</SectionLabel>
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-5 mb-5">
        {(member.software_tools?.length ?? 0) === 0 ? (
          <div className="text-sm text-[#999]">No tools listed.</div>
        ) : (
          <div className="flex flex-wrap">
            {member.software_tools!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
          </div>
        )}
      </div>

      <SectionLabel>Certifications</SectionLabel>
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-5 mb-5">
        {(member.certifications?.length ?? 0) === 0 ? (
          <div className="text-sm text-[#999]">No certifications listed.</div>
        ) : (
          <div className="flex flex-wrap">
            {member.certifications!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
          </div>
        )}
      </div>

      <SectionLabel>Luxury Profile</SectionLabel>
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-2">Product Categories</div>
            {(member.product_categories?.length ?? 0) === 0 ? (
              <span className="text-sm text-[#bbb]">&mdash;</span>
            ) : (
              <div className="flex flex-wrap">
                {member.product_categories!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-2">Brands Worked With</div>
            {(member.brands_worked_with?.length ?? 0) === 0 ? (
              <span className="text-sm text-[#bbb]">&mdash;</span>
            ) : (
              <div className="flex flex-wrap">
                {member.brands_worked_with!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-2">Client Segments</div>
            {(member.client_segment_experience?.length ?? 0) === 0 ? (
              <span className="text-sm text-[#bbb]">&mdash;</span>
            ) : (
              <div className="flex flex-wrap">
                {member.client_segment_experience!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-2">Market Knowledge</div>
            {(member.market_knowledge?.length ?? 0) === 0 ? (
              <span className="text-sm text-[#bbb]">&mdash;</span>
            ) : (
              <div className="flex flex-wrap">
                {member.market_knowledge!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-2">Clienteling Experience</div>
            <div className="text-sm text-[#111]">
              {member.clienteling_experience ? "Yes" : "No"}
              {member.clienteling_description && (
                <span className="text-[#444] ml-2">&mdash; {member.clienteling_description}</span>
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

  const typeStyles: Record<string, string> = {
    cv: "bg-[#dbeafe] text-[#1d4ed8]",
    cover_letter: "bg-[#fef3c7] text-[#92400e]",
    portfolio: "bg-purple-50 text-purple-700",
    certificate: "bg-[#dcfce7] text-[#15803d]",
    reference: "bg-[#fef2f2] text-[#dc2626]",
    other: "bg-[#f5f5f5] text-[#999]",
  };

  return (
    <>
      <SectionLabel>Uploaded Documents</SectionLabel>
      {docs.length === 0 ? (
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-8 text-center text-sm text-[#999]">
          No documents uploaded.
        </div>
      ) : (
        <div className="bg-white border border-[#e8e8e8] rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8]">
                <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-[0.12em] text-[#999] font-semibold">File</th>
                <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-[0.12em] text-[#999] font-semibold">Type</th>
                <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-[0.12em] text-[#999] font-semibold">Size</th>
                <th className="px-4 py-2.5 text-left text-[9px] uppercase tracking-[0.12em] text-[#999] font-semibold">Uploaded</th>
                <th className="px-4 py-2.5 text-right text-[9px] uppercase tracking-[0.12em] text-[#999] font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                const tcls = typeStyles[d.document_type] ?? typeStyles.other;
                return (
                  <tr key={d.id} className="border-t border-[#f0f0f0] hover:bg-[#fafafa]">
                    <td className="px-4 py-3">
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#111] font-medium no-underline hover:underline"
                      >
                        {d.file_name}
                      </a>
                      {d.label && <span className="text-xs text-[#999] ml-2">({d.label})</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${tcls}`}>
                        {d.document_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#999]">{formatFileSize(d.file_size)}</td>
                    <td className="px-4 py-3 text-xs text-[#999]">{formatDate(d.uploaded_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {d.is_primary && (
                        <span className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded text-[#555] bg-[#f5f5f5] border border-[#e8e8e8]">
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

// ---------------------------------------------------------------------------
// Tab: Preferences
// ---------------------------------------------------------------------------

function PreferencesTab({ member }: { member: MemberProfile }) {
  const salaryRange =
    member.desired_salary_min != null || member.desired_salary_max != null
      ? `${member.desired_salary_currency ?? "USD"} ${member.desired_salary_min?.toLocaleString() ?? "?"} \u2014 ${member.desired_salary_max?.toLocaleString() ?? "?"}`
      : null;

  return (
    <>
      <SectionLabel>Availability &amp; Preferences</SectionLabel>
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
          <InfoRow label="Availability" value={member.availability} />
          <InfoRow label="Desired Salary Range" value={salaryRange} />
          <InfoRow label="Open to Relocation" value={member.open_to_relocation ? "Yes" : "No"} />
          <InfoRow label="Relocation Preferences" value={member.relocation_preferences} />
        </div>

        <div className="mt-5 pt-5 border-t border-[#f0f0f0]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-2">Desired Locations</div>
              {(member.desired_locations?.length ?? 0) === 0 ? (
                <span className="text-sm text-[#bbb]">&mdash;</span>
              ) : (
                <div className="flex flex-wrap">
                  {member.desired_locations!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-2">Contract Types</div>
              {(member.desired_contract_types?.length ?? 0) === 0 ? (
                <span className="text-sm text-[#bbb]">&mdash;</span>
              ) : (
                <div className="flex flex-wrap">
                  {member.desired_contract_types!.map((s, i) => <TagBadge key={i}>{s}</TagBadge>)}
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#999] mb-2">Desired Departments</div>
              {(member.desired_departments?.length ?? 0) === 0 ? (
                <span className="text-sm text-[#bbb]">&mdash;</span>
              ) : (
                <div className="flex flex-wrap">
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
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-6">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add private notes about this member..."
          className="w-full min-h-[200px] p-3.5 text-sm leading-relaxed text-[#111] border border-[#e8e8e8] bg-[#fafafa] rounded-lg outline-none resize-y placeholder-[#bbb] focus:border-[#ccc] box-border"
        />
        <div className="flex items-center gap-3 mt-3.5">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide bg-[#111] text-white rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
          {saved && (
            <span className="text-xs text-[#15803d] font-medium">Notes saved.</span>
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
  const confidenceStyles: Record<string, string> = {
    high: "bg-[#dcfce7] text-[#15803d]",
    medium: "bg-[#fef3c7] text-[#92400e]",
    low: "bg-[#fef2f2] text-[#dc2626]",
  };

  return (
    <>
      <SectionLabel>AI Smart Review</SectionLabel>
      <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
        {review ? (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded ${confidenceStyles[review.confidence] ?? 'bg-[#f5f5f5] text-[#999]'}`}>
                {review.confidence} confidence
              </span>
              <span className={`text-[11px] font-medium uppercase tracking-wide ${review.recommendation === "approve" ? 'text-[#15803d]' : 'text-[#999]'}`}>
                Recommend: {review.recommendation}
              </span>
            </div>

            <InfoRow label="Reasoning" value={review.reasoning} />
            <InfoRow label="Auto-Approved" value={review.auto_approved ? "Yes" : "No"} />
            <InfoRow label="Model" value={review.model_used || "claude-sonnet-4-20250514"} />
            <InfoRow
              label="Assessed At"
              value={review.created_at ? new Date(review.created_at).toLocaleString() : "\u2014"}
            />

            <div className="mt-5">
              <button
                onClick={onReassess}
                disabled={reassessing}
                className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wide bg-white text-[#444] border border-[#e0e0e0] rounded-lg hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {reassessing ? "Re-assessing..." : "Re-assess"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <p className="text-sm text-[#999] mb-4">
              No AI assessment has been run for this member yet.
            </p>
            <button
              onClick={onReassess}
              disabled={reassessing}
              className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide bg-[#111] text-white rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {reassessing ? "Running AI Review..." : "Run AI Review"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
