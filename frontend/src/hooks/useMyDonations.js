// src/hooks/useMyDonations.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getMyDonations } from "../api/donations";

export function useMyDonations() {
  const { token } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try   { setDonations(await getMyDonations(token)); }
    catch (err) { setError(err.message); }
    finally     { setLoading(false); }
  }, [token]);

  useEffect(() => { fetch(); }, [fetch]);
  return { donations, loading, error, refetch: fetch };
}