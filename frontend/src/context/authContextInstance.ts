import { createContext } from "react";
import type { LoginPayload, RegisterPayload } from "../types/auth";

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);