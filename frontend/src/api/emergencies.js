// src/api/emergencies.js
import api from './axios';

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_CLAIMS = [
  {
    id: 1,
    hospital: 'Kenyatta National Hospital',
    amount: 85000,
    funded: 42000,
    desc: 'Emergency surgery required for acute appendicitis. Patient is stable but needs immediate intervention.',
    status: 'approved',
    urgent: true,
    patient: 'John M.',
    donations: [
      { name: 'Alice K.', amount: 5000, ago: '2 hours ago' },
      { name: 'Bob N.', amount: 10000, ago: '4 hours ago' },
    ],
  },
  {
    id: 2,
    hospital: 'Aga Khan Hospital',
    amount: 120000,
    funded: 95000,
    desc: 'Cancer treatment — chemotherapy cycle 3 of 6. Patient requires continued support to complete treatment.',
    status: 'approved',
    urgent: false,
    patient: 'Mary W.',
    donations: [
      { name: 'David L.', amount: 20000, ago: '1 day ago' },
    ],
  },
  {
    id: 3,
    hospital: 'Mater Misericordiae Hospital',
    amount: 45000,
    funded: 10000,
    desc: 'Maternity emergency — caesarean section required due to complications during labour.',
    status: 'approved',
    urgent: true,
    patient: 'Grace A.',
    donations: [],
  },
];

// ── Shape mapper ──────────────────────────────────────────────────────────────
const mapEmergency = (e) => ({
  id: e.id,
  hospital: typeof e.group === 'object' ? e.group?.name : (e.group ?? e.hospital ?? 'Unknown Hospital'),
  amount: parseFloat(e.amount_requested ?? e.amount ?? 0),
  funded: parseFloat(e.amount_approved ?? e.funded ?? 0),
  desc: e.description ?? e.desc ?? '',
  status: e.status ?? 'pending',
  urgent: e.status === 'pending' && !e.amount_approved,
  patient: e.claimant_name ?? e.patient ?? 'Anonymous',
  donations: e.donations ?? [],
});

// ── List all claims ───────────────────────────────────────────────────────────
export async function getClaims() {
  try {
    const { data } = await api.get('/api/emergencies/');
    // data can be paginated ({ results: [...] }) or a plain array
    const raw = Array.isArray(data) ? data : (data.results ?? []);
    return raw.map(mapEmergency);
  } catch (error) {
    console.warn('getClaims failed, using mock data:', error.message);
    return MOCK_CLAIMS;
  }
}

// ── Single claim detail ───────────────────────────────────────────────────────
export async function getClaim(id) {
  try {
    const { data } = await api.get(`/api/emergencies/${id}/`);
    return mapEmergency(data);
  } catch (error) {
    console.warn(`getClaim(${id}) failed, using mock data:`, error.message);
    return MOCK_CLAIMS.find((c) => c.id === Number(id)) ?? null;
  }
}

// ── Submit new claim (multipart) ──────────────────────────────────────────────
export async function submitClaim(data) {
  try {
    const form = new FormData();
    form.append('group', data.group ?? 1);          // group_id required by backend
    form.append('emergency_type', data.emergency_type ?? 'other');
    form.append('description', data.desc ?? '');
    form.append('amount_requested', data.amount);
    form.append('payout_phone', data.payout_phone ?? '');
    if (data.file) form.append('bill', data.file);

    const { data: res } = await api.post('/api/emergencies/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res;
  } catch (error) {
    console.warn('submitClaim failed:', error.message);
    // Re-throw so the form can show the error — no silent fallback here
    throw error;
  }
}

// ── Admin: approve (vote) ─────────────────────────────────────────────────────
export async function approveClaim(id) {
  try {
    const { data } = await api.post(`/api/emergencies/${id}/vote/`, { decision: 'approve' });
    return data;
  } catch (error) {
    console.warn(`approveClaim(${id}) failed:`, error.message);
    throw error;
  }
}

// ── Admin: reject (vote) ──────────────────────────────────────────────────────
export async function rejectClaim(id, reason = '') {
  try {
    const { data } = await api.post(`/api/emergencies/${id}/vote/`, {
      decision: 'reject',
      note: reason,
    });
    return data;
  } catch (error) {
    console.warn(`rejectClaim(${id}) failed:`, error.message);
    throw error;
  }
}