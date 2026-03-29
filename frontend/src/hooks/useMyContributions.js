// src/hooks/useMyContributions.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getMyContributions, getSchedule } from '../api/contributions';

export function useMyContributions() {
  const { token } = useAuth();

  const [contributions, setContributions] = useState([]);
  const [schedule,      setSchedule]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contribs, sched] = await Promise.all([
        getMyContributions(),
        getSchedule(),
      ]);
      setContributions(contribs);
      setSchedule(sched);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetch(); }, [fetch]);

  return { contributions, schedule, loading, error, refetch: fetch };
}