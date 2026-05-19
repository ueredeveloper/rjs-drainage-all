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
