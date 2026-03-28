import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import Spinner from "../components/LoadingSpinner";

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, verify } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? "/";

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const sendOtp = async () => {
    if (phone.replace(/\s/g, "").length < 9) { setErr("Enter a valid Kenyan number"); return; }
    setErr(""); setLoading(true);
    try {
      await login("+254" + phone);    // calls api/auth.js → POST /api/auth/otp/
      setStep(2);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const verifyOtp = async() => {
    const code = otp.join("");
    if (code.length < 6) { setErr("Enter the 6-digit OTP"); return; }
    setLoading(true); setErr("");
    try {
      await verify("+254" + phone, code); // sets token + role in AuthContext
      navigate(from, { replace: true });  // redirects back to attempted page
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div>
            <div className="login-title">Jamii Afya</div>
            <div className="login-sub">Fast, transparent aid for Kenyans</div>
          </div>
        </div>

        <div className="step-indicator" style={{ justifyContent: "center" }}>
          <div className={`step-dot ${step >= 1 ? (step > 1 ? "done" : "active") : ""}`} />
          <div style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 40 }} />
          <div className={`step-dot ${step >= 2 ? "active" : ""}`} />
        </div>

        {step === 1 ? (
          <>
            <div className="field" style={{ marginBottom: 16 }}>
              <label>Phone Number</label>
              <div className="field-prefix">
                <span className="prefix-label">+254</span>
                <input className="prefix-input" type="tel" placeholder="712 345 678" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} maxLength={9} />
              </div>
              {err && <span className="field-error">{err}</span>}
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={sendOtp} disabled={loading}>
              {loading ? <><Spinner /> Sending OTP…</> : "Send OTP"}
            </button>
            <p style={{ fontSize: ".78rem", color: "var(--ink-muted)", textAlign: "center", marginTop: 14 }}>
              Demo: use any 9-digit number. OTP 123456 = Admin.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: ".88rem", color: "var(--ink-secondary)", marginBottom: 16 }}>
              Enter the 6-digit code sent to +254 {phone}
            </p>
            <div className="otp-inputs" style={{ marginBottom: 20 }}>
              {otp.map((v, i) => (
                <input key={i} id={`otp-${i}`} className="otp-input" type="text" inputMode="numeric" maxLength={1} value={v} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => e.key === "Backspace" && !v && i > 0 && document.getElementById(`otp-${i - 1}`)?.focus()} />
              ))}
            </div>
            {err && <span className="field-error" style={{ display: "block", marginBottom: 10, textAlign: "center" }}>{err}</span>}
            <button className="btn btn-primary btn-full btn-lg" onClick={verifyOtp} disabled={loading}>
              {loading ? <><Spinner /> Verifying…</> : "Verify & Sign In"}
            </button>
            <button className="btn btn-ghost btn-full" style={{ marginTop: 10 }} onClick={() => { setStep(1); setOtp(["","","","","",""]); }}>
              ← Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
