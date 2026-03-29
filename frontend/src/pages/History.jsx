// src/pages/HistoryPage.jsx
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { fmt, pct } from "../helpers";                 
import { useClaims } from "../hooks/useClaims";      
import LoadingSpinner from "../components/LoadingSpinner";
import StatusChip from "../components/StatusChip";
import ProgressBar from "../components/ProgressBar";
import { useMyContributions } from "../hooks/useMyContributions";

/**
 * History page – shows the logged‑in user’s claims and donations.
 *
 * Props
 * -----
 * setPage      – navigation helper from the parent (e.g. "detail", "history")
 * setDetailClaim – called when the user clicks “View Details”
 */
export default function HistoryPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("claims");

  // -----------------------------------------------------------------
  // 1.  Pull data from the back‑end
  // -----------------------------------------------------------------
  const {
    claims: myClaims,      // ← only the claims that belong to the current user
    loading: claimsLoading,
    error: claimsError,
    refetch: refetchClaims,
  } = useClaims(); // the hook already knows the auth token

  const { 
    contributions: myContributions, 
    schedule,
    loading,
    error,
    refetch
  } = useMyContributions();

  // -----------------------------------------------------------------
  // 2️.  Loading / error handling – identical for both tabs
  // -----------------------------------------------------------------
  if (claimsLoading || loading) {
    return (
      <div
        className="page"
        style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
      >
        <LoadingSpinner dark />
      </div>
    );
  }

  // ----- Error ------

  if (claimsError || error) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Could not load history</div>
          <div className="empty-state-sub">
            {claimsError ?? error}
          </div>
          <button
            className="btn btn-outline"
            style={{ marginTop: 16 }}
            onClick={() => {
              refetchClaims();
              refetch();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 3️.  UI 
  // -----------------------------------------------------------------
  return (
    <div className="page">
      {/* ------------------- Header ------------------- */}
      <div className="page-header">
        <div>
          <div className="page-title">My Activity</div>
          <div className="page-subtitle">
            Your claims and donation history
          </div>
        </div>
      </div>

      {/* ------------------- Stat row ------------------- */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">My Claims</div>
          <div className="stat-value blue">{myClaims.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Contributions</div>
          <div className="stat-value green">
            {fmt(myContributions.reduce((s, d) => s + d.amount, 0))}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Contributions Made</div>
          <div className="stat-value orange">{myContributions.length}</div>
        </div>
        <div className="stat-card">
        <div className="stat-label">Next Due</div>
        <div className="stat-value blue" style={{ fontSize: '1rem' }}>
          {schedule?.next_due ?? '—'}
        </div>
      </div>
      </div>

      {/* ------------------- Tabs ------------------- */}
      <div className="tabs" style={{ marginBottom: 24, maxWidth: 320 }}>
        <button
          className={`tab-btn ${tab === "claims" ? "active" : ""}`}
          onClick={() => setTab("claims")}
        >
          My Claims
        </button>
        <button
          className={`tab-btn ${tab === "contributions" ? "active" : ""}`}
          onClick={() => setTab("contributions")}
        >
          My Contributions
        </button>
      </div>

      {/* ------------------- Claims tab ------------------- */}
      {tab === "claims" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myClaims.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No claims yet</div>
              <div className="empty-state-sub">Claims you submit will appear here.</div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => navigate("/claims/new")}
              >
                + Submit a Claim
              </button>
            </div>
          ) : (
            /* ---------- Render a card for each claim ---------- */
            myClaims.map((d) => {
            const p = pct(d.funded, d.amount);
            return (
              <div key={d.id} className="card">
                {/* Card Header with hospital name and status chip */}
                <div style={{ padding: "18px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>
                        {d.hospital}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.2rem",
                          color: "var(--blue)",
                        }}
                      >
                        {fmt(d.amount)}
                      </div>
                    </div>
                    <StatusChip status={d.status} />
                  </div>

                  {/* Progress bar + funded text */}
                  <ProgressBar value={p} />
                  <div
                    style={{
                      fontSize: ".8rem",
                      color: "var(--ink-muted)",
                      marginTop: 8,
                    }}
                  >
                    {fmt(d.funded)} of {fmt(d.amount)} raised
                  </div>
                </div>

                {/* Card actions */}
                <div
                  style={{
                    padding: "10px 20px",
                    borderTop: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/claims/${d.id}`)}
                  >
                    View Details
                  </button>

                  {d.status !== "funded" && (
                    <button className="btn btn-ghost btn-sm">Share Link</button>
              )}
            </div>
          </div>
        );
      })
    )}
  </div>
)}

      {/* ------------------- Donations tab ------------------- */}
      {tab === "contributions" && (
        <div className="card">
            {myContributions.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--ink-muted)", fontSize: ".88rem" }}>
              No donations yet.
            </div>
          ) : (
          <div style={{ padding: "0 20px" }}>
            {myContributions.map((d, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-icon green">💙</div>
                <div className="timeline-body">
                  <div className="timeline-main">
                    {d.hospital} ·{" "}
                    <span
                      style={{
                        color: "var(--green)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {fmt(d.amount)}
                    </span>
                  </div>
                  <div className="timeline-meta">{d.date}</div>
                </div>
              <span className={`chip ${d.status === 'paid' ? 'chip-funded' : 'chip-pending'}`}>
                {d.status}
              </span>              
            </div>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
