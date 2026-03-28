// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const fmt = (n) => "KES " + n.toLocaleString();
export const pct = (f, t) => Math.min(100, Math.round((f / t) * 100));
