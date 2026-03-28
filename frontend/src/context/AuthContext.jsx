import React, { createContext, useReducer, useEffect } from 'react';
import { requestOtp, verifyOtp, clearAuthStorage } from '../api/auth';

// ── Shape ─────────────────────────────────────────────────────────────────────
// state: { token: string|null, role: 'patient'|'donor'|'admin'|null, userId: number|null }

const initialState = {
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  userId: localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { token: action.token, role: action.role, userId: action.userId };
    case 'CLEAR':
      return { token: null, role: null, userId: null };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Keep localStorage in sync whenever state changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('role', state.role);
      localStorage.setItem('userId', String(state.userId));
    } else {
      clearAuthStorage();
    }
  }, [state]);

  /**
   * Step 1: request OTP – returns { message } or throws.
   */
  async function login(phone) {
    return requestOtp(phone);
  }

  /**
   * Step 2: verify OTP – sets auth state on success or throws.
   * @returns {{ token, role, userId }}
   */
  async function verify(phone, otp) {
    const data = await verifyOtp(phone, otp);
    dispatch({ type: 'SET_USER', token: data.token, role: data.role, userId: data.id });
    return data;
  }

  function logout() {
    dispatch({ type: 'CLEAR' });
  }

  const value = {
    token: state.token,
    role: state.role,
    userId: state.userId,
    isAuthenticated: Boolean(state.token),
    login,
    verify,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}