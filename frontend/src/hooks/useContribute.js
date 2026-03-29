import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { initiateContributionPush, pollContributionStatus } from '../api/contributions';

// status: "idle" | "sending" | "polling" | "done" | "error"
export function useContribute() {
  const { token } = useAuth();
  const [status,  setStatus]  = useState('idle');
  const [error,   setError]   = useState(null);
  const [receipt, setReceipt] = useState(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setReceipt(null);
  }, []);

  const contribute = useCallback(async (amount, phone) => {
    setStatus('sending');
    setError(null);
    setReceipt(null);

    try {
      const { checkout_request_id } = await initiateContributionPush(amount, phone);
      setStatus('polling');
      const result = await pollContributionStatus(checkout_request_id);
      setReceipt(result);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [token]);

  return { contribute, status, error, receipt, reset };
}