import { useCallback, useEffect, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { UserOut } from "../types/auth";
import { useAuth } from "./useAuth";
import { CurrentUserContext } from "./currentUserContextInstance";

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserOut | null>(null);
  const [loadingUser, setLoadingUser] = useState(isAuthenticated);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);
    try {
      setUser(await api.get<UserOut>("/users/me"));
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isAuthenticated) {
        if (!cancelled) {
          setUser(null);
          setLoadingUser(false);
        }
        return;
      }

      if (!cancelled) setLoadingUser(true);
      try {
        const data = await api.get<UserOut>("/users/me");
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <CurrentUserContext.Provider value={{ user, loadingUser, refreshUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}
