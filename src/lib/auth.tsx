import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authApi, usersApi, setTokens, getRefreshToken, clearTokens } from "./api";
import type { User } from "./api";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    () => typeof window !== "undefined" ? localStorage.getItem("ss_access") : null
  );
  const [isLoading, setIsLoading] = useState(true);

  // On mount, validate stored token by hitting /users/me/
  useEffect(() => {
    const token = localStorage.getItem("ss_access");
    if (!token) {
      setIsLoading(false);
      return;
    }
    usersApi
      .me()
      .then((u) => {
        setUser(u);
        setAccessToken(token);
      })
      .catch(() => {
        clearTokens();
        setUser(null);
        setAccessToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setTokens(data.access, data.refresh);
    setAccessToken(data.access);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try { await authApi.logout(refresh); } catch { /* ignore blacklist errors */ }
    }
    clearTokens();
    setUser(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
