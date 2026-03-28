// src/hooks/useAuth.js
// ─────────────────────────────────────────────────────────────────────────────
// Thin wrapper around AuthContext. Every hook and component imports THIS,
// not AuthContext directly. Makes the dependency explicit and easy to stub.
// ─────────────────────────────────────────────────────────────────────────────
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}