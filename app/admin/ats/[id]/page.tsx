"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRequireAdmin } from "@/lib/auth-hooks";
import type {
  Application,
  StageHistoryEntry,
  ApplicationNote,
} from "@/types/application";
import {
  PIPELINE_STAGES,
  REJECTION_REASONS,
  SUBMISSION_METHODS,
  NOTE_TYPES,
  getStageLabel,
  getStageColor,
} from "@/types/application";

// ---------------------------------------------------------------------------
// Design tokens — JOBLUX palette
// ---------------------------------------------------------------------------
const GOLD = "#a58e28";
const BLACK = "#1a1a1a";
const CREAM = "#fafaf5";
const BORDER = "#e8e2d8";

type Tab = "overview" | "timeline" | "notes" | "submission" | "offer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a date string as "Mar 19, 2026 at 14:30" */
function fmtDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** How many days between applied_at and now */
function daysInPipeline(appliedAt: string): number {
  return Math.floor((Date.now() - new Date(appliedAt).getTime()) / 86_400_000);
}

/** Initials from a name string */
function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Check whether the application has ever reached a given stage */
function hasReachedStage(history: StageHistoryEntry[] | undefined, stage: string): boolean {
  return !!history?.some((h) => h.to_stage === stage);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Colored badge for a pipeline stage */
function StageBadge({ stage, size = "md" }: { stage: string; size?: "sm" | "md" }) {
  const bg = getStageColor(stage);
  const fontSize = size === "sm" ? 10 : 12;
  const pad = size === "sm" ? "2px 8px" : "4px 12px";
  return (
    <span
      className="jl-badge"
      style={{
        display: "inline-block",
        background: bg,
        color: "#fff",
        fontSize,
        fontWeight: 600,
        padding: pad,
        borderRadius: 999,
        letterSpacing: 0.3,
      }}
    >
      {getStageLabel(stage)}
    </span>
  );
}

/** Clickable star rating */
function StarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (r: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover ?? value ?? 0);
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(star)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              color: filled ? GOLD : BORDER,
              padding: 0,
              lineHeight: 1,
            }}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

/** Note-type badge */
function NoteTypeBadge({ noteType }: { noteType: string }) {
  const label = NOTE_TYPES.find((n) => n.value === noteType)?.label ?? noteType;
  return (
    <span
      className="jl-note-badge"
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 999,
        background: "#f0ece3",
        color: GOLD,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function ApplicationDetailPage() {
  useRequireAdmin();
  const params = useParams();
  const id = params?.id as string;

  // ----- state -----
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Stage-move controls
  const [moveStage, setMoveStage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submissionMethod, setSubmissionMethod] = useState("");
  const [movingStage, setMovingStage] = useState(false);

  // Notes
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [addingNote, setAddingNote] = useState(false);

  // Editable fields
  const [recruiter, setRecruiter] = useState("");

  // Submission tab
  const [subMethod, setSubMethod] = useState("");
  const [subCvVersion, setSubCvVersion] = useState("");
  const [clientResponse, setClientResponse] = useState("");
  const [clientResponseAt, setClientResponseAt] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  // Offer tab
  const [offerSalary, setOfferSalary] = useState("");
  const [offerCurrency, setOfferCurrency] = useState("EUR");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerContractType, setOfferContractType] = useState("");
  const [offerBenefits, setOfferBenefits] = useState("");
  const [offerNotes, setOfferNotes] = useState("");
  const [savingOffer, setSavingOffer] = useState(false);

  // ----- fetch application data -----
  const fetchApp = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data: Application = await res.json();
      setApp(data);
      // Sync editable fields
      setRecruiter(data.assigned_recruiter ?? "");
      setSubMethod(data.submission_method ?? "");
      setSubCvVersion(data.submission_cv_version ?? "");
      setClientResponse(data.client_response ?? "");
      setClientResponseAt(data.client_response_at?.slice(0, 10) ?? "");
      setOfferSalary(data.offer_salary?.toString() ?? "");
      setOfferCurrency(data.offer_currency ?? "EUR");
      setOfferStartDate(data.offer_start_date?.slice(0, 10) ?? "");
      setOfferContractType(data.offer_contract_type ?? "");
      setOfferBenefits(data.offer_benefits ?? "");
      setOfferNotes(data.offer_notes ?? "");
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchApp();
  }, [id, fetchApp]);

  // ----- actions -----

  /** Update the star rating */
  const handleRating = async (rating: number) => {
    await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    fetchApp();
  };

  /** Move to a new pipeline stage */
  const handleMoveStage = async () => {
    if (!moveStage) return;
    setMovingStage(true);
    try {
      await fetch(`/api/applications/${id}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: moveStage,
          rejection_reason: moveStage === "rejected" ? rejectionReason : undefined,
          submission_method: moveStage === "submitted_to_client" ? submissionMethod : undefined,
        }),
      });
      setMoveStage("");
      setRejectionReason("");
      setSubmissionMethod("");
      fetchApp();
    } finally {
      setMovingStage(false);
    }
  };

  /** Save recruiter assignment */
  const handleSaveRecruiter = async () => {
    await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_recruiter: recruiter }),
    });
    fetchApp();
  };

  /** Add a note */
  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      await fetch(`/api/applications/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent, note_type: noteType }),
      });
      setNoteContent("");
      setNoteType("general");
      fetchApp();
    } finally {
      setAddingNote(false);
    }
  };

  /** Save submission details */
  const handleSaveSubmission = async () => {
    setSavingSub(true);
    try {
      await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_method: subMethod,
          submission_cv_version: subCvVersion,
          client_response: clientResponse,
          client_response_at: clientResponseAt || null,
        }),
      });
      fetchApp();
    } finally {
      setSavingSub(false);
    }
  };

  /** Save offer details */
  const handleSaveOffer = async () => {
    setSavingOffer(true);
    try {
      await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer_salary: offerSalary ? Number(offerSalary) : null,
          offer_currency: offerCurrency,
          offer_start_date: offerStartDate || null,
          offer_contract_type: offerContractType || null,
          offer_benefits: offerBenefits || null,
          offer_notes: offerNotes || null,
        }),
      });
      fetchApp();
    } finally {
      setSavingOffer(false);
    }
  };

  // ----- computed -----
  const showSubmission = hasReachedStage(app?.stage_history, "submitted_to_client");
  const showOffer = hasReachedStage(app?.stage_history, "offer_made");

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "overview", label: "Overview", show: true },
    { key: "timeline", label: "Timeline", show: true },
    { key: "notes", label: "Notes", show: true },
    { key: "submission", label: "Submission", show: !!showSubmission },
    { key: "offer", label: "Offer", show: !!showOffer },
  ];

  // ----- shared styles -----
  const cardStyle: React.CSSProperties = {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: 24,
    marginBottom: 20,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "inherit",
    background: "#fff",
    color: BLACK,
    outline: "none",
    boxSizing: "border-box",
  };

  const btnPrimary: React.CSSProperties = {
    background: GOLD,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: 0.3,
  };

  const btnOutline: React.CSSProperties = {
    background: "transparent",
    color: GOLD,
    border: `1px solid ${GOLD}`,
    borderRadius: 6,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };

  // -----------------------------------------------------------------------
  // Loading / Not Found states
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="jl-page" style={{ background: CREAM, minHeight: "100vh", padding: 40, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#888", fontSize: 16 }}>Loading application...</p>
      </div>
    );
  }

  if (notFound || !app) {
    return (
      <div className="jl-page" style={{ background: CREAM, minHeight: "100vh", padding: 40 }}>
        <a href="/admin/ats" style={{ color: GOLD, fontSize: 14, textDecoration: "none" }}>
          ← Back to ATS
        </a>
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <h2 style={{ color: BLACK, fontSize: 22 }}>Application not found</h2>
          <p style={{ color: "#888", marginTop: 8 }}>
            This application may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  const member = app.member;
  const brief = app.search_assignment;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="jl-page" style={{ background: CREAM, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 64px" }}>
        {/* ---- Back link ---- */}
        <a
          href="/admin/ats"
          className="jl-back-link"
          style={{ color: GOLD, fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 20, fontWeight: 500 }}
        >
          ← Back to ATS
        </a>

        {/* ================================================================
            PAGE HEADER
        ================================================================ */}
        <div style={{ ...cardStyle, display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Avatar / Initials */}
          <div style={{ flexShrink: 0 }}>
            {member?.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name}
                style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: `2px solid ${BORDER}` }}
              />
            ) : (
              <div
                className="jl-avatar-initials"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${GOLD}, #c4a94d)`,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {initials(member?.full_name ?? "?")}
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 className="jl-serif" style={{ fontSize: 28, fontWeight: 700, color: BLACK, margin: 0, lineHeight: 1.2 }}>
              {member?.full_name ?? "Unknown Candidate"}
            </h1>
            <p style={{ color: "#666", fontSize: 14, margin: "4px 0 10px" }}>
              {member?.headline || `${member?.job_title ?? ""} at ${member?.maison ?? ""}`.trim() || "—"}
            </p>

            {/* Current stage badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <StageBadge stage={app.current_stage} />
              {brief && (
                <span style={{ fontSize: 13, color: "#666" }}>
                  {brief.title} · {brief.is_confidential ? "Confidential" : brief.maison ?? "—"}
                  {brief.reference_number ? ` · ${brief.reference_number}` : ""}
                </span>
              )}
            </div>

            {/* Rating */}
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Rating:</span>
              <StarRating value={app.rating} onChange={handleRating} />
            </div>
          </div>

          {/* Move Stage control */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
            <label style={labelStyle}>Move Stage</label>
            <select
              className="jl-select"
              value={moveStage}
              onChange={(e) => setMoveStage(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Select stage…</option>
              {PIPELINE_STAGES.map((s) => (
                <option key={s.key} value={s.key} disabled={s.key === app.current_stage}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Conditional: rejection reason */}
            {moveStage === "rejected" && (
              <select
                className="jl-select"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Select reason…</option>
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}

            {/* Conditional: submission method */}
            {moveStage === "submitted_to_client" && (
              <select
                className="jl-select"
                value={submissionMethod}
                onChange={(e) => setSubmissionMethod(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Submission method…</option>
                {SUBMISSION_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}

            <button
              className="jl-btn-primary"
              style={{ ...btnPrimary, opacity: !moveStage || movingStage ? 0.5 : 1 }}
              disabled={!moveStage || movingStage}
              onClick={handleMoveStage}
            >
              {movingStage ? "Moving…" : "Confirm Move"}
            </button>
          </div>
        </div>

        {/* ================================================================
            TABS
        ================================================================ */}
        <div className="jl-tabs" style={{ display: "flex", gap: 0, borderBottom: `2px solid ${BORDER}`, marginBottom: 24 }}>
          {tabs.filter((t) => t.show).map((t) => {
            const active = t.key === activeTab;
            return (
              <button
                key={t.key}
                className="jl-tab"
                onClick={() => setActiveTab(t.key)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent",
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? GOLD : "#888",
                  cursor: "pointer",
                  marginBottom: -2,
                  letterSpacing: 0.2,
                  transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ================================================================
            TAB 1: OVERVIEW
        ================================================================ */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Candidate Summary */}
            <div style={cardStyle}>
              <h3 className="jl-serif" style={{ fontSize: 16, color: BLACK, marginTop: 0, marginBottom: 16 }}>
                Candidate Summary
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 14 }}>
                <span style={{ color: "#888", fontWeight: 600 }}>Name</span>
                <span style={{ color: BLACK }}>{member?.full_name ?? "—"}</span>

                <span style={{ color: "#888", fontWeight: 600 }}>Headline</span>
                <span style={{ color: BLACK }}>{member?.headline ?? "—"}</span>

                <span style={{ color: "#888", fontWeight: 600 }}>Current Role</span>
                <span style={{ color: BLACK }}>
                  {member?.job_title ?? "—"}{member?.maison ? ` at ${member.maison}` : ""}
                </span>

                <span style={{ color: "#888", fontWeight: 600 }}>Location</span>
                <span style={{ color: BLACK }}>
                  {[member?.city, member?.country].filter(Boolean).join(", ") || "—"}
                </span>

                <span style={{ color: "#888", fontWeight: 600 }}>Seniority</span>
                <span style={{ color: BLACK }}>{member?.seniority ?? "—"}</span>

                <span style={{ color: "#888", fontWeight: 600 }}>Years in Luxury</span>
                <span style={{ color: BLACK }}>{member?.years_in_luxury ?? "—"}</span>

                <span style={{ color: "#888", fontWeight: 600 }}>Email</span>
                <span style={{ color: BLACK }}>
                  <a href={`mailto:${member?.email}`} style={{ color: GOLD, textDecoration: "none" }}>
                    {member?.email ?? "—"}
                  </a>
                </span>
              </div>
            </div>

            {/* Application Details */}
            <div style={cardStyle}>
              <h3 className="jl-serif" style={{ fontSize: 16, color: BLACK, marginTop: 0, marginBottom: 16 }}>
                Application Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 14 }}>
                <span style={{ color: "#888", fontWeight: 600 }}>Source</span>
                <span>
                  <span
                    className="jl-source-badge"
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 999,
                      background: "#f0ece3",
                      color: GOLD,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {app.source.replace(/_/g, " ")}
                  </span>
                </span>

                <span style={{ color: "#888", fontWeight: 600 }}>Applied</span>
                <span style={{ color: BLACK }}>{fmtDate(app.applied_at)}</span>

                <span style={{ color: "#888", fontWeight: 600 }}>Days in Pipeline</span>
                <span style={{ color: BLACK }}>{daysInPipeline(app.applied_at)}</span>

                <span style={{ color: "#888", fontWeight: 600 }}>Assigned Recruiter</span>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    className="jl-input"
                    value={recruiter}
                    onChange={(e) => setRecruiter(e.target.value)}
                    placeholder="Assign recruiter…"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    className="jl-btn-sm"
                    onClick={handleSaveRecruiter}
                    style={{ ...btnOutline, padding: "6px 12px", fontSize: 11, whiteSpace: "nowrap" }}
                  >
                    Save
                  </button>
                </span>
              </div>

              {/* Quick links */}
              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {member && (
                  <a
                    href={`/admin/members/${member.id}`}
                    className="jl-link"
                    style={{ ...btnOutline, textDecoration: "none", fontSize: 12, padding: "6px 14px" }}
                  >
                    View Full Profile
                  </a>
                )}
                {brief && (
                  <a
                    href={`/admin/assignments/new?id=${brief.id}`}
                    className="jl-link"
                    style={{ ...btnOutline, textDecoration: "none", fontSize: 12, padding: "6px 14px" }}
                  >
                    View Assignment
                  </a>
                )}
                {member && (
                  <a
                    href={`/admin/members/${member.id}`}
                    className="jl-link"
                    style={{ ...btnOutline, textDecoration: "none", fontSize: 12, padding: "6px 14px" }}
                  >
                    Download CV
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 2: TIMELINE
        ================================================================ */}
        {activeTab === "timeline" && (
          <div style={cardStyle}>
            <h3 className="jl-serif" style={{ fontSize: 16, color: BLACK, marginTop: 0, marginBottom: 24 }}>
              Application Timeline
            </h3>
            {(() => {
              // Merge stage_history and notes into a single chronological list
              type TimelineItem =
                | { kind: "stage"; data: StageHistoryEntry }
                | { kind: "note"; data: ApplicationNote };

              const items: TimelineItem[] = [
                ...(app.stage_history ?? []).map((h) => ({ kind: "stage" as const, data: h })),
                ...(app.notes ?? []).map((n) => ({ kind: "note" as const, data: n })),
              ].sort(
                (a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime()
              );

              if (items.length === 0) {
                return <p style={{ color: "#888", fontSize: 14 }}>No timeline entries yet.</p>;
              }

              return (
                <div style={{ position: "relative", paddingLeft: 28 }}>
                  {/* Vertical line */}
                  <div
                    style={{
                      position: "absolute",
                      left: 7,
                      top: 6,
                      bottom: 6,
                      width: 2,
                      background: BORDER,
                    }}
                  />

                  {items.map((item, idx) => {
                    const isStage = item.kind === "stage";
                    const dotColor = isStage ? GOLD : "#bbb";

                    return (
                      <div
                        key={`${item.kind}-${item.data.id}`}
                        className="jl-timeline-item"
                        style={{ position: "relative", marginBottom: idx < items.length - 1 ? 24 : 0 }}
                      >
                        {/* Dot */}
                        <div
                          style={{
                            position: "absolute",
                            left: -24,
                            top: 4,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: dotColor,
                            border: `2px solid #fff`,
                            boxShadow: `0 0 0 2px ${dotColor}`,
                          }}
                        />

                        {isStage ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13, color: BLACK, fontWeight: 600 }}>
                                Moved from
                              </span>
                              {item.data.from_stage ? (
                                <StageBadge stage={(item.data as StageHistoryEntry).from_stage!} size="sm" />
                              ) : (
                                <span style={{ fontSize: 11, color: "#aaa" }}>—</span>
                              )}
                              <span style={{ fontSize: 13, color: BLACK }}>→</span>
                              <StageBadge stage={(item.data as StageHistoryEntry).to_stage} size="sm" />
                            </div>
                            {(item.data as StageHistoryEntry).moved_by && (
                              <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>
                                by {(item.data as StageHistoryEntry).moved_by}
                              </p>
                            )}
                            {(item.data as StageHistoryEntry).notes && (
                              <p style={{ fontSize: 13, color: "#666", margin: "6px 0 0", fontStyle: "italic" }}>
                                {(item.data as StageHistoryEntry).notes}
                              </p>
                            )}
                            <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0 0" }}>
                              {fmtDateTime(item.data.created_at)}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>
                                {(item.data as ApplicationNote).author}
                              </span>
                              <NoteTypeBadge noteType={(item.data as ApplicationNote).note_type} />
                            </div>
                            <p style={{ fontSize: 14, color: "#444", margin: "4px 0", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                              {(item.data as ApplicationNote).content}
                            </p>
                            <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0 0" }}>
                              {fmtDateTime(item.data.created_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ================================================================
            TAB 3: NOTES
        ================================================================ */}
        {activeTab === "notes" && (
          <div>
            {/* Add Note form */}
            <div style={cardStyle}>
              <h3 className="jl-serif" style={{ fontSize: 16, color: BLACK, marginTop: 0, marginBottom: 16 }}>
                Add Note
              </h3>
              <textarea
                className="jl-textarea"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write a note about this application…"
                rows={4}
                style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
                <select
                  className="jl-select"
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  style={{ ...inputStyle, width: "auto", minWidth: 160, cursor: "pointer" }}
                >
                  {NOTE_TYPES.map((nt) => (
                    <option key={nt.value} value={nt.value}>{nt.label}</option>
                  ))}
                </select>
                <button
                  className="jl-btn-primary"
                  onClick={handleAddNote}
                  disabled={addingNote || !noteContent.trim()}
                  style={{ ...btnPrimary, opacity: addingNote || !noteContent.trim() ? 0.5 : 1 }}
                >
                  {addingNote ? "Adding…" : "Add Note"}
                </button>
              </div>
            </div>

            {/* Notes list (newest first) */}
            {(app.notes ?? [])
              .slice()
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((note) => (
                <div key={note.id} style={{ ...cardStyle }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: BLACK }}>
                      {note.author}
                    </span>
                    <NoteTypeBadge noteType={note.note_type} />
                    <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>
                      {fmtDateTime(note.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                    {note.content}
                  </p>
                </div>
              ))}

            {(!app.notes || app.notes.length === 0) && (
              <p style={{ color: "#888", fontSize: 14, textAlign: "center", marginTop: 24 }}>
                No notes yet. Add one above.
              </p>
            )}
          </div>
        )}

        {/* ================================================================
            TAB 4: SUBMISSION
        ================================================================ */}
        {activeTab === "submission" && showSubmission && (
          <div style={cardStyle}>
            <h3 className="jl-serif" style={{ fontSize: 16, color: BLACK, marginTop: 0, marginBottom: 20 }}>
              Client Submission Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Submitted date (read-only) */}
              <div>
                <label style={labelStyle}>Submitted Date</label>
                <p style={{ fontSize: 14, color: BLACK, margin: "4px 0 0" }}>
                  {fmtDate(app.submitted_to_client_at)}
                </p>
              </div>

              {/* Method */}
              <div>
                <label style={labelStyle}>Submission Method</label>
                <select
                  className="jl-select"
                  value={subMethod}
                  onChange={(e) => setSubMethod(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", marginTop: 4 }}
                >
                  <option value="">Select method…</option>
                  {SUBMISSION_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* CV version */}
              <div>
                <label style={labelStyle}>CV Version Sent</label>
                <input
                  type="text"
                  className="jl-input"
                  value={subCvVersion}
                  onChange={(e) => setSubCvVersion(e.target.value)}
                  placeholder="e.g. Tailored CV v2"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </div>

              {/* Client response date */}
              <div>
                <label style={labelStyle}>Client Response Date</label>
                <input
                  type="date"
                  className="jl-input"
                  value={clientResponseAt}
                  onChange={(e) => setClientResponseAt(e.target.value)}
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </div>

              {/* Client response (full width) */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Client Response</label>
                <textarea
                  className="jl-textarea"
                  value={clientResponse}
                  onChange={(e) => setClientResponse(e.target.value)}
                  placeholder="Notes on client feedback…"
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 80, marginTop: 4 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                className="jl-btn-primary"
                onClick={handleSaveSubmission}
                disabled={savingSub}
                style={{ ...btnPrimary, opacity: savingSub ? 0.5 : 1 }}
              >
                {savingSub ? "Saving…" : "Save Submission Details"}
              </button>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 5: OFFER
        ================================================================ */}
        {activeTab === "offer" && showOffer && (
          <div style={cardStyle}>
            <h3 className="jl-serif" style={{ fontSize: 16, color: BLACK, marginTop: 0, marginBottom: 20 }}>
              Offer Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Salary */}
              <div>
                <label style={labelStyle}>Salary</label>
                <input
                  type="number"
                  className="jl-input"
                  value={offerSalary}
                  onChange={(e) => setOfferSalary(e.target.value)}
                  placeholder="e.g. 95000"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </div>

              {/* Currency */}
              <div>
                <label style={labelStyle}>Currency</label>
                <select
                  className="jl-select"
                  value={offerCurrency}
                  onChange={(e) => setOfferCurrency(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", marginTop: 4 }}
                >
                  {["EUR", "GBP", "USD", "CHF", "AED", "SGD", "HKD", "JPY", "CNY"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Start date */}
              <div>
                <label style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  className="jl-input"
                  value={offerStartDate}
                  onChange={(e) => setOfferStartDate(e.target.value)}
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </div>

              {/* Contract type */}
              <div>
                <label style={labelStyle}>Contract Type</label>
                <input
                  type="text"
                  className="jl-input"
                  value={offerContractType}
                  onChange={(e) => setOfferContractType(e.target.value)}
                  placeholder="e.g. Permanent, Fixed-term"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </div>

              {/* Benefits (full width) */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Benefits</label>
                <textarea
                  className="jl-textarea"
                  value={offerBenefits}
                  onChange={(e) => setOfferBenefits(e.target.value)}
                  placeholder="Health insurance, relocation package, etc."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 60, marginTop: 4 }}
                />
              </div>

              {/* Offer notes (full width) */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Offer Notes</label>
                <textarea
                  className="jl-textarea"
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="Internal notes about the offer…"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 60, marginTop: 4 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                className="jl-btn-primary"
                onClick={handleSaveOffer}
                disabled={savingOffer}
                style={{ ...btnPrimary, opacity: savingOffer ? 0.5 : 1 }}
              >
                {savingOffer ? "Saving…" : "Save Offer Details"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
