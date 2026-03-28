// src/api/claims.js
// ─────────────────────────────────────────────────────────────────────────────
// All Claims endpoints. Mirrors your FastAPI/Django router.
//
// Expected backend routes:
//   GET    /api/claims/              → list (approved + pending for admin)
//   GET    /api/claims/{id}/         → single claim with donations[]
//   POST   /api/claims/              → submit new claim (multipart, has file)
//   PATCH  /api/claims/{id}/approve/ → admin approve
//   PATCH  /api/claims/{id}/reject/  → admin reject
// 
import api from './axios'

// List 
// Returns all claims the current user can see.
// Donors: approved only. Admins: everything (backend enforces via role on JWT).
export const getClaims = () =>
  api.get("/api/claims/").then(r => r.data);

// Single claim (with donations) 
export const getClaim = (id) =>
  api.get(`/api/claims/${id}/`).then(r => r.data);

// Submit new claim (has file upload — multipart, NOT JSON) 
// `data` shape: { hospital: string, amount: number, desc: string, file: File }
export async function submitClaim(data) {
  const form = new FormData();
  form.append("hospital", data.hospital);
  form.append("amount",   data.amount);
  form.append("desc",     data.desc ?? "");
  form.append("bill",     data.file);
  // axios handles auth header via interceptor — no manual token needed
  const { data: res } = await api.post('/api/claims/', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res;
}
// Admin: approve 
// Backend should trigger the M-Pesa B2C payout after persisting the approval.
export const approveClaim = (id) =>
  api.patch(`/api/claims/${id}/approve/`, {}).then(r => r.data);

// Admin: reject 
export const rejectClaim = (id, reason) =>
  api.patch(`/api/claims/${id}/reject/`, { reason }).then(r => r.data);