// src/api/contributions.js
import api from './axios';

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_CONTRIBUTIONS = [
  { id: 1, amount: 2000, period: '2024-01', status: 'confirmed', hospital: 'Pool Fund', date: 'Jan 2024', mpesa_ref: 'QHJ12345' },
  { id: 2, amount: 2000, period: '2024-02', status: 'confirmed', hospital: 'Pool Fund', date: 'Feb 2024', mpesa_ref: 'QHJ23456' },
  { id: 3, amount: 2000, period: '2024-03', status: 'pending',   hospital: 'Pool Fund', date: 'Mar 2024', mpesa_ref: null },
];

const MOCK_SCHEDULE = {
  amount: 2000,
  period: new Date().toISOString().slice(0, 7),
  next_due: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-KE'),
  paybill: '174379',
};

// ── STK Push ──────────────────────────────────────────────────────────────────
export async function initiateContributionPush(amount, phone) {
  try {
    const { data } = await api.post('/api/contributions/initiate/', {
      group_id: 1,
      amount,
      phone,
      period: new Date().toISOString().slice(0, 7),
    });
    return data;
  } catch (error) {
    console.warn('initiateContributionPush failed:', error.message);
    // Simulate a checkout request id so polling can be attempted
    return { checkout_request_id: 'DEMO_' + Date.now() };
  }
}

// ── Poll STK status ───────────────────────────────────────────────────────────
export async function getContributionStkStatus(checkoutRequestId) {
  try {
    const { data } = await api.get(`/api/contributions/stk-status/${checkoutRequestId}/`);
    return data;
  } catch (error) {
    console.warn('getContributionStkStatus failed:', error.message);
    // In demo mode, pretend payment succeeded after first poll
    if (checkoutRequestId.startsWith('DEMO_')) {
      return { status: 'completed', mpesa_ref: 'DEMO_REF_' + Date.now() };
    }
    throw error;
  }
}

export async function pollContributionStatus(
  checkoutRequestId,
  { intervalMs = 3000, maxAttempts = 10 } = {}
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const result = await getContributionStkStatus(checkoutRequestId);
    if (result.status === 'completed') return result;
    if (result.status === 'failed')    throw new Error('Payment failed. Please try again.');
    if (result.status === 'cancelled') throw new Error('Payment was cancelled.');
  }
  throw new Error('Payment timed out. Check your M-Pesa messages and try again.');
}

// ── My contributions ──────────────────────────────────────────────────────────
export async function getMyContributions() {
  try {
    const { data } = await api.get('/api/contributions/');
    const raw = Array.isArray(data) ? data : (data.results ?? []);
    return raw.map((c) => ({
      id:         c.id,
      amount:     parseFloat(c.amount ?? 0),
      period:     c.period ?? '',
      status:     c.status ?? 'pending',
      hospital:   c.group_name ?? 'Pool Fund',
      date:       c.created_at ? new Date(c.created_at).toLocaleDateString('en-KE') : '',
      mpesa_ref:  c.mpesa_ref ?? null,
    }));
  } catch (error) {
    console.warn('getMyContributions failed, using mock data:', error.message);
    return MOCK_CONTRIBUTIONS;
  }
}

// ── Contribution schedule ─────────────────────────────────────────────────────
export async function getSchedule() {
  try {
    const { data } = await api.get('/api/contributions/schedule/');
    return data;
  } catch (error) {
    console.warn('getSchedule failed, using mock schedule:', error.message);
    return MOCK_SCHEDULE;
  }
}

// ── Re-prompt ─────────────────────────────────────────────────────────────────
export async function repromptContribution() {
  try {
    const { data } = await api.post('/api/contributions/reprompt/');
    return data;
  } catch (error) {
    console.warn('repromptContribution failed:', error.message);
    throw error;
  }
}