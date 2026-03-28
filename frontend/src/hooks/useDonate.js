// src/hooks/useDonate.js
// ─────────────────────────────────────────────────────────────────────────────
// Encapsulates the full M-Pesa STK push flow:
//   idle → processing (STK sent) → polling → done | error
//
// Usage in DonateModal:
//   const { donate, status, error } = useDonate();
//   await donate(claim.id, amount, userPhone);
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { initiateStkPush, pollStkStatus } from "../api/donations";

// status machine: "idle" | "sending" | "polling" | "done" | "error"
export function useDonate() {
  const { token } = useAuth();
  const [status,  setStatus]  = useState("idle");
  const [error,   setError]   = useState(null);
  const [receipt, setReceipt] = useState(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setReceipt(null);
  }, []);

  /**
   * @param {number|string} claimId
   * @param {number}        amount    - KES integer
   * @param {string}        [donorPhone] - overrides auth phone (e.g. user typed different number)
   */
  const donate = useCallback(async (claimId, amount, donorPhone) => {
    const payPhone = donorPhone;

    setStatus("sending");
    setError(null);
    setReceipt(null);

    try {
      // Step 1: Trigger STK push
      const { checkout_request_id } = await initiateStkPush(
        claimId,
        amount,
        payPhone,
        token
      );

      // Step 2: Poll for result
      setStatus("polling");
      const result = await pollStkStatus(checkout_request_id, token);

      setReceipt(result);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, [token]);

  return { donate, status, error, receipt, reset };
}