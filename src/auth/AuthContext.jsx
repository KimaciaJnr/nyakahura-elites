import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  login as storeLogin,
  logout as storeLogout,
  getSession,
} from "../lib/store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    function syncSession(event) {
      if (event.key === "neh_session") {
        setSession(getSession());
      }
    }

    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  const login = useCallback((email, password) => {
    const s = storeLogin(email, password);
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}