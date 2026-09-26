import { createContext } from "react";
import type { ToastType } from "../components/Toast";

export interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
