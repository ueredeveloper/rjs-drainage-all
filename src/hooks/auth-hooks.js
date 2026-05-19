import React, { createContext, useCallback, useContext, useState } from 'react';

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
