import { createContext } from "react";
import type { UserOut } from "../types/auth";

export interface CurrentUserContextValue {
  user: UserOut | null;
  loadingUser: boolean;
  refreshUser: () => Promise<void>;
}

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);
