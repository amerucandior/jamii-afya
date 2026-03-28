import { useState } from "react";

import { pct, fmt } from "../helpers"
import StatusChip from "../components/StatusChip";
import ProgressBar from "../components/ProgressBar";
import CircularProgress from "../components/CircularProgress";
import DonateModal from "../components/ModalDonate";

// ─── CLAIM DETAIL PAGE ────────────────────────────────────────────────────────
export default function DetailPage({ claim, setPage }) {
  const [donating, setDonating] = useState(false);
  const p = pct(claim.funded, claim.amount);

  return (
    <div className="page" style={{ paddingBottom: 90 }}>
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => setPage("home")}>Home</span>
        <span className="breadcrumb-sep">›</span>
        <span>{claim.hospital}</span>
        <span className="breadcrumb-sep">›</span>
        <span>Claim #{claim.id}</span>
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-title">{claim.hospital}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <StatusChip status={claim.status} />
            {claim.urgent && <StatusChip status="urgent" />}
          </div>
        </div>
        <CircularProgress value={p} />
      </div>

      <div className="detail-grid">
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: "20px 20px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: ".8rem", color: "var(--ink-muted)", marginBottom: 4 }}>Total Required</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--ink)" }}>{fmt(claim.amount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: ".8rem", color: "var(--ink-muted)", marginBottom: 4 }}>Funded So Far</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--green)" }}>{fmt(claim.funded)}</div>
                </div>
                <div>
                  <div style={{ fontSize: ".8rem", color: "var(--ink-muted)", marginBottom: 4 }}>Remaining</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--orange)" }}>{fmt(claim.amount - claim.funded)}</div>
                </div>
              </div>
              <ProgressBar value={p} urgent={claim.urgent} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span>📋</span> Case Description
              </div>
              <p style={{ fontSize: ".9rem", color: "var(--ink-secondary)", lineHeight: 1.7 }}>{claim.desc}</p>
              <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", fontSize: ".82rem", color: "var(--ink-muted)" }}>
                Paybill: <strong style={{ color: "var(--ink)" }}>{claim.paybill}</strong> · Verified by MEF Admin
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ padding: "20px 20px 4px" }}>
              <div style={{ fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>💙</span> Donations ({claim.donations.length})
              </div>
              <div className="donations-list">
                {claim.donations.map((d, i) => (
                  <div key={i} className="donation-item">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--blue-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".85rem", fontWeight: 700, color: "var(--blue)" }}>
                        {d.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{d.name}</div>
                        <div style={{ fontSize: ".78rem", color: "var(--ink-muted)" }}>{d.ago}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--green)", fontSize: ".9rem" }}>{fmt(d.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="pdf-mock">
              <div style={{ fontSize: "2.5rem" }}>📄</div>
              <div style={{ fontWeight: 600, fontSize: ".9rem" }}>Hospital Bill</div>
              <div style={{ fontSize: ".8rem", color: "var(--ink-muted)", textAlign: "center" }}>PDF document attached<br />Verified by MEF</div>
              <button className="btn btn-outline btn-sm">View Full PDF</button>
            </div>
          </div>
          <button className="btn btn-secondary btn-full btn-lg" onClick={() => setDonating(true)}>
            ♥ Donate to This Case
          </button>
        </div>
      </div>

      <div className="sticky-donate">
        <button className="btn btn-ghost" onClick={() => setPage("home")}>← Back</button>
        <button className="btn btn-secondary btn-lg" onClick={() => setDonating(true)} style={{ flex: 1, maxWidth: 320, justifyContent: "center" }}>
          ♥ Donate Now · {fmt(claim.amount - claim.funded)} needed
        </button>
      </div>

      {donating && <DonateModal claim={claim} onClose={() => setDonating(false)} />}
    </div>
  );
}
