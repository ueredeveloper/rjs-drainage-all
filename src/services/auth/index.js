const API_URL = 'https://app-sis-out-srh-backend-01-h3hkbcf5f8dubbdy.brazilsouth-01.azurewebsites.net';
//const API_URL = 'http://localhost:3000';

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, colaborador: { id: string, email: string } }>}
 */
async function login(email, password) {
  const response = await fetch(`${API_URL}/colaboradores/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.body?.error ?? data?.error ?? `HTTP ${response.status}`);
  return data;
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
async function register(email, password) {
  const response = await fetch(`${API_URL}/colaboradores/upsert-colaborador`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.body?.error ?? data?.error ?? `HTTP ${response.status}`);
  return data;
}

export { login, register };
