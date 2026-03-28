/**
 * auth.js
 * Two-step M-Pesa OTP authentication.
 *
 * Step 1 – requestOtp(phone)  → POST /api/auth/otp/
 * Step 2 – verifyOtp(phone, otp) → POST /api/auth/verify/
 *           Returns { token, role, id }; caller stores these in AuthContext.
 */

import api from './axios';

/**
 * Trigger an OTP send to the supplied phone number.
 * @param {string} phone  E.164 format, e.g. "+254712345678"
 * @returns {Promise<{ message: string }>}
 */
export async function requestOtp(phone) {
  const { data } = await api.post('/api/auth/otp/', { phone });
  return data; // { message: "OTP sent" }
}

/**
 * Verify OTP and retrieve JWT + role.
 * @param {string} phone
 * @param {string} otp   6-digit string
 * @returns {Promise<{ token: string, role: 'patient'|'donor'|'admin', id: number }>}
 */
export async function verifyOtp(phone, otp) {
  const { data } = await api.post('/api/auth/verify/', { phone, otp });

  // Persist to localStorage so the axios interceptor and AuthContext
  // can bootstrap on a page refresh without re-logging in.
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);
  localStorage.setItem('userId', String(data.id));

  return data;
}

/**
 * Clear all auth artefacts from localStorage.
 * AuthContext.logout() should call this before clearing its own state.
 */
export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
}