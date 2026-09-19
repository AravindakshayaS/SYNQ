const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export async function request(path, { token, method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(35000) });
  } catch { throw new Error('Cannot reach SYNQ. Start the backend on port 4000 and check your connection.'); }
  if (response.status === 204) return null;
  const text = await response.text();
  let result;
  try { result = JSON.parse(text); } catch { result = { error: text || 'The server returned an empty response.' }; }
  if (!response.ok) {
    const error = new Error(result.issues?.map(i => `${i.field}: ${i.message}`).join('. ') || result.error || 'Something went wrong. Please try again.');
    error.status = response.status; throw error;
  }
  return result;
}
export async function allRecords(path, token) {
  const records = [];
  for (let page = 1; page <= 10000; page++) {
    const result = await request(`${path}?limit=100&page=${page}`, { token });
    records.push(...result.data);
    if (!result.hasMore) return records;
  }
  throw new Error('Your history is too large to load. Please contact support.');
}
