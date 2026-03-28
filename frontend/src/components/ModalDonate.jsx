// src/components/ModalDonate.jsx
import { useState } from "react";
import { fmt } from "../helpers";
import { useDonate } from "../hooks/useDonate";
import Spinner from "./LoadingSpinner";

/**
 * Modal that lets a user donate to a single claim.
 *
 * @param {{ claim: object, onClose: () => void }} props
 */
export default function DonateModal({ claim, onClose }) {
  // ----------  Hook -------------------------------------------------
  const { donate, status, error, reset } = useDonate();

  // -----------------------------------------------------------------
  const [amount, setAmount] = useState("");

  // ------ Store Phone Number-----
  const [phone, setPhone] = useState("");
  const [showPhoneError, setShowPhoneError] = useState(false);

  // derived UI booleans from the hook
  const isLoading = status === "sending" || status === "polling";
  const isDone    = status === "done";

  // TEXT shown while the push is being processed
  const loadingCopy = {
    sending: "Sending STK push to your phone…",
    polling: "Waiting for M-Pesa confirmation…",
  };

  // Phone number validator
    const isPhoneValid = (p) => {
    // Accept Kenyan numbers like +2547XXXXXXXX or 07XXXXXXXX
    const cleaned = p.replace(/\s+/g, ""); // removes spaces
    const kenRegex = /^(?:\+254|0)7\d{8}$/; // +2547xxxxxx or 07xxxxxxxx
    return kenRegex.test(cleaned);
  };

  // -----------------------------------------------------------------
  // Called when the user clicks the big “Donate via M‑Pesa” button
  const handleDonate = async () => {
    // basic client‑side validation
    if (!amount || Number(amount) <= 0) return;
    if (!isPhoneValid(phone)) {
      setShowPhoneError(true);
      return;
    }
    setShowPhoneError(false);

    try {
      const cleanedPhone = phone.replace(/\s+/g, ""); // Pass a cleaned phone number 
      await donate(claim.id, Number(amount), cleanedPhone);
      // if the hook resolves without throwing, it will set `status` → "done"
    } catch {
      // `error` is already set by the hook, we just need to swallow the exception
    }
  };

  // Reset Everything
  const handleClose = () => {
    reset();               // puts the hook back to "idle"
    setAmount("");         // clear the input for the next open
    setPhone("");          // clear the phone number for the next open
    setShowPhoneError(false);
    onClose();             // tell the parent to hide the modal
  };

  // -----------------------------------------------------------------
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-title"
      >
        {/* ----- Header ------------------------------------------------ */}
        <header className="modal-header">
          <div>
            <h2 className="modal-title" id="donate-title">
              Donate to {claim.hospital}
            </h2>
            <div
              style={{
                fontSize: ".82rem",
                color: "var(--ink-muted)",
                marginTop: 4,
              }}
            >
              Claim #{claim.id} · {fmt(claim.amount - claim.funded)} remaining
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {/* ----- Success screen (status === "done") -------------------- */}
        {isDone ? (
          <div className="success-state">
            <div className="success-check">✓</div>
            <div className="success-title">Thank you for your support!</div>
            <div className="success-sub">
              STK push sent to your phone. {fmt(Number(amount))} will go
              directly to {claim.hospital}.
            </div>
            <button
              className="btn btn-ghost btn-full"
              style={{ marginTop: 20 }}
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        ) : (
          /* ----- Normal donation form -------------------------------- */
          <>
            {/* error banner – only appears when the hook reports a failure */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: 14,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--red-light)",
                  color: "var(--red)",
                  fontSize: ".85rem",
                }}
              >
                {error}
              </div>
            )}

            {/* ---------- Amount field ---------- */}
            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="donate-amount">Amount</label>
              <div className="field-prefix">
                <span className="prefix-label">KES</span>
                <input
                  id="donate-amount"
                  className="prefix-input"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* ---------- Phone field ---------- */}
            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="donate-phone">M-Pesa Phone *</label>
              <input
                id="donate-phone"
                className="field-input"
                type="tel"
                placeholder="+2547XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                aria-invalid={showPhoneError}
                aria-describedby={showPhoneError ? "phone-error" : undefined}
              />
              {showPhoneError && (
                <span
                  id = "phone-error"
                  style={{
                    color: "var(--red)",
                    fontSize: ".85rem",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Please enter a valid Kenyan M-Pesa number.
                </span>
              )}
            </div>

            {/* ---------- Quick‑pick amounts ---------- */}
            <div className="quick-picks" style={{ marginBottom: 20 }}>
              {[
                500,
                1000,
                5000,
                10000,
              ].map((q) => (
                <button
                  key={q}
                  className={`quick-pick ${
                    amount === String(q) ? "active" : ""
                  }`}
                  onClick={() => setAmount(String(q))}
                  disabled={isLoading}
                >
                  {q >= 1000 ? q / 1000 + "K" : q}
                </button>
              ))}
            </div>

            {/* ---------- Submit button ---------- */}
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleDonate}
              disabled={isLoading || !amount || !phone || showPhoneError}
            >
              {isLoading ? (
                <>
                  <Spinner /> {loadingCopy[status]}
                </>
              ) : (
                "Donate via M-Pesa"
              )}
            </button>

            <p
              style={{
                fontSize: ".78rem",
                color: "var(--ink-muted)",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Payment via M-Pesa STK push · Paybill {claim.paybill}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
