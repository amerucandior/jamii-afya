// src/pages/HistoryPage.jsx
import { useState } from "react";
import { fmt, pct } from "../helpers";                 
import { useClaims } from "../hooks/useClaims";      
import LoadingSpinner from "../components/LoadingSpinner";
import StatusChip from "../components/StatusChip";
import ProgressBar from "../components/ProgressBar";
import { useMyDonations } from "../hooks/useMyDonations";

/**
 * History page – shows the logged‑in user’s claims and donations.
 *
 * Props
 * -----
 * setPage      – navigation helper from the parent (e.g. "detail", "history")
 * setDetailClaim – called when the user clicks “View Details”
 */
export default function HistoryPage({ setPage, setDetailClaim }) {
  const [tab, setTab] = useState("claims");

  // -----------------------------------------------------------------
  // 1️⃣  Pull data from the back‑end
  // -----------------------------------------------------------------
  const {
    claims: myClaims,      // ← only the claims that belong to the current user
    loading: claimsLoading,
    error: claimsError,
    refetch: refetchClaims,
  } = useClaims(); // the hook already knows the auth token

  const { donations: myDonations, 
    loading: donationsLoading, 
    error: donationsError, 
    refetch: refetchDonations 
  } = useMyDonations();

  // -----------------------------------------------------------------
  // 2️⃣  Loading / error handling – identical for both tabs
  // -----------------------------------------------------------------
  const anyLoading = claimsLoading || donationsLoading;
  const anyError = claimsError || donationsError;

  if (anyLoading) {
    return (
      <div
        className="page"
        style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
      >
        <LoadingSpinner dark />
      </div>
    );
  }

  if (anyError) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Could not load history</div>
          <div className="empty-state-sub">
            {claimsError?.toString() ?? donationsError?.toString()}
          </div>
          <button
            className="btn btn-outline"
            style={{ marginTop: 16 }}
            onClick={() => {
              refetchClaims();
              refetchDonations();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 3️⃣  UI – the same markup you already wrote, just fed with live data
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
          <div className="stat-label">Total Donated</div>
          <div className="stat-value green">
            {fmt(myDonations.reduce((s, d) => s + d.amount, 0))}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Donations Made</div>
          <div className="stat-value orange">{myDonations.length}</div>
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
          className={`tab-btn ${tab === "donations" ? "active" : ""}`}
          onClick={() => setTab("donations")}
        >
          My Donations
        </button>
      </div>

      {/* ------------------- Claims tab ------------------- */}
      {tab === "claims" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myClaims.map((c) => {
            const p = pct(c.funded, c.amount);
            return (
              <div key={c.id} className="card">
                <div style={{ padding: "18px 20px" }}>
                  {/* Header with hospital name and status chip */}
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
                        {c.hospital}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.2rem",
                          color: "var(--blue)",
                        }}
                      >
                        {fmt(c.amount)}
                      </div>
                    </div>
                    <StatusChip status={c.status} />
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
                    {fmt(c.funded)} of {fmt(c.amount)} raised
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
                    onClick={() => {
                      // The claim we have in `myClaims` already contains everything
                      // needed for the detail view, so we can just pass it.
                      setDetailClaim(c);
                      setPage("detail");
                    }}
                  >
                    View Details
                  </button>

                  {c.status !== "funded" && (
                    <button className="btn btn-ghost btn-sm">Share Link</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------- Donations tab ------------------- */}
      {tab === "donations" && (
        <div className="card">
          <div style={{ padding: "0 20px" }}>
            {myDonations.map((d, i) => (
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
                  <div className="timeline-meta">
                    {d.date} · Claim #{d.claimId}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm">Receipt</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
