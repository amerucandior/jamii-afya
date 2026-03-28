/**
 * hospitals.js
 * Fetches the list of registered hospitals for the NewClaim dropdown.
 *
 * Hospital shape: { id, name, location }
 */

import api from './axios';

/**
 * @returns {Promise<{ id: number, name: string, location: string }[]>}
 */
export async function getHospitals() {
  const { data } = await api.get('/api/hospitals/');
  return data;
}