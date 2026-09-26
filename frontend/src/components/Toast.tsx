import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface Props {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}

const styles: Record<ToastType, { wrapper: string; iconBg: string }> = {
  success: { wrapper: "border-teal-400/40 bg-teal-400/10 text-teal-300", iconBg: "bg-teal-400/20" },
  error: { wrapper: "border-amber-400/40 bg-amber-400/10 text-amber-300", iconBg: "bg-amber-400/20" },
  info: { wrapper: "border-navy-600 bg-navy-800 text-ink", iconBg: "bg-ink/10" },
};

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "!",
  info: "ℹ",
};

export function Toast({ toast, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 200); // wait for slide-out
  };

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 min-w-[280px] max-w-sm ${
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      } ${styles[toast.type].wrapper}`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${styles[toast.type].iconBg}`}>
        {icons[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
