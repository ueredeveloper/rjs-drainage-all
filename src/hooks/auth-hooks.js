import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SESSION_KEY = 'rjs_session';
const CREDS_KEY   = 'rjs_credentials';

/** @returns {{ token: string, colaborador: { id: string, email: string } } | null} */
function _readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

/** @returns {Array<{ email: string, password: string }>} */
function _readCredentials() {
  try { return JSON.parse(localStorage.getItem(CREDS_KEY)) || []; } catch { return []; }
}

function _decodeJwtPayload(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch { return null; }
}

const AuthContext = createContext(null);

/**
 * @function AuthProvider
 * @description Provê contexto de autenticação para toda a aplicação.
 * Persiste sessão e credenciais no localStorage.
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession]       = useState(_readSession);
  const [credentials, setCredentials] = useState(_readCredentials);
  const [loginOpen, setLoginOpen]   = useState(() => !_readSession());

  // Verifica se o token JWT venceu; se sim, abre a tela de login
  useEffect(() => {
    const checkExpiration = () => {
      const s = _readSession();
      if (!s?.token) return;
      const payload = _decodeJwtPayload(s.token);
      if (payload?.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        setLoginOpen(true);
      }
    };
    checkExpiration();
    const id = setInterval(checkExpiration, 60_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSession = useCallback((data) => {
    if (data) localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    else      localStorage.removeItem(SESSION_KEY);
    setSession(data);
  }, []);

  const saveCredential = useCallback((email, password) => {
    setCredentials(prev => {
      const list = [{ email, password }, ...prev.filter(c => c.email !== email)];
      localStorage.setItem(CREDS_KEY, JSON.stringify(list));
      return list;
    });
  }, []);

  const removeCredential = useCallback((email) => {
    setCredentials(prev => {
      const list = prev.filter(c => c.email !== email);
      localStorage.setItem(CREDS_KEY, JSON.stringify(list));
      return list;
    });
  }, []);

  const clearCredentials = useCallback(() => {
    localStorage.removeItem(CREDS_KEY);
    setCredentials([]);
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setLoginOpen(true);
  }, [saveSession]);

  // Abre login automaticamente quando qualquer serviço recebe HTTP 401
  useEffect(() => {
    const handle = () => { saveSession(null); setLoginOpen(true); };
    window.addEventListener('auth:unauthorized', handle);
    return () => window.removeEventListener('auth:unauthorized', handle);
  }, [saveSession]);

  return (
    <AuthContext.Provider value={{
      session,
      loginOpen, setLoginOpen,
      credentials,
      saveSession, saveCredential, removeCredential, clearCredentials,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/** @returns {ReturnType<typeof AuthProvider>} */
export const useAuth = () => useContext(AuthContext);
