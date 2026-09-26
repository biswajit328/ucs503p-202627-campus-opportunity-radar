import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useCurrentUser } from "../context/useCurrentUser";
import type { UserOut } from "../types/auth";

interface Props {
  allowedRoles: UserOut["role"][];
  children: ReactNode;
}

export function RoleRoute({ allowedRoles, children }: Props) {
  const { user, loadingUser } = useCurrentUser();

  if (loadingUser) {
    return <div className="min-h-screen bg-navy-950 p-8 text-sm text-ink-muted">Checking account access…</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
