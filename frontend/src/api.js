const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');


export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => t && localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

export async function api(path, { method='GET', body, auth=true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.msg || j.error || msg; } catch { /* use res.statusText */ }
    throw new Error(msg);
  }
  return res.json();
}
