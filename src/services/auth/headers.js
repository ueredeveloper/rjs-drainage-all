const SESSION_KEY = 'rjs_session';

/**
 * Retorna o header Authorization com o Bearer token da sessão ativa.
 * @returns {Object} Header Authorization ou objeto vazio se não houver sessão.
 */
export function getAuthHeaders() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const token = session?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * Wrapper de fetch autenticado: ao receber 401, dispara o evento 'auth:unauthorized'
 * para que o AuthProvider redirecione o usuário para o login.
 */
export async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
  return res;
}
