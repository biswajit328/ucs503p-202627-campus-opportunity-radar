export type DeadlineUrgency = "URGENT" | "SOON" | "UPCOMING" | "EXPIRED" | "NORMAL";

export function getDeadlineUrgency(deadlineIso: string): DeadlineUrgency {
  const now = new Date();
  const deadline = new Date(deadlineIso);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "EXPIRED";
  if (diffDays <= 3) return "URGENT";
  if (diffDays <= 7) return "SOON";
  if (diffDays <= 30) return "UPCOMING";
  return "NORMAL";
}

export function formatDeadline(deadlineIso: string): string {
  return new Date(deadlineIso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const urgencyStyles: Record<DeadlineUrgency, string> = {
  URGENT: "bg-red-500/20 text-red-400 border-red-500/40",
  SOON: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  UPCOMING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  EXPIRED: "bg-slate-700 text-slate-500 border-slate-600",
  NORMAL: "bg-slate-700 text-slate-300 border-slate-600",
};