import { useContext } from "react";
import { ToastContext } from "./toastContextInstance";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
