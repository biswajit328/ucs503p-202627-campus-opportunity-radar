import { useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { LoginPayload, RegisterPayload, TokenResponse } from "../types/auth";
import { AuthContext } from "./authContextInstance";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("nexora_token"));

  const login = async (payload: LoginPayload) => {
    const data = await api.post<TokenResponse>("/auth/login", payload);
    localStorage.setItem("nexora_token", data.access_token);
    setToken(data.access_token);
  };

  const register = async (payload: RegisterPayload) => {
    await api.post("/auth/register", payload);
  };

  const logout = () => {
    localStorage.removeItem("nexora_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}