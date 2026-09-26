export type DeadlineUrgency = "URGENT" | "SOON" | "UPCOMING" | "EXPIRED" | "NORMAL";

export function getDeadlineUrgency(deadlineIso: string): DeadlineUrgency {
  const now = new Date();
  const deadline = new Date(deadlineIso);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (deadline.getFullYear() > 2090) return "NORMAL"; // placeholder date
  if (diffDays < 0) return "EXPIRED";
  if (diffDays <= 3) return "URGENT";
  if (diffDays <= 7) return "SOON";
  if (diffDays <= 30) return "UPCOMING";
  return "NORMAL";
}

export function formatDeadline(deadlineIso: string): string {
  const date = new Date(deadlineIso);
  if (isNaN(date.getTime()) || date.getFullYear() > 2090) {
    return "Deadline not available";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const urgencyStyles: Record<DeadlineUrgency, string> = {
  URGENT: "bg-amber-400/15 text-amber-300 border-amber-400/40",
  SOON: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  UPCOMING: "bg-navy-900 text-ink-muted border-navy-700",
  EXPIRED: "bg-navy-900 text-ink-muted/60 border-navy-700",
  NORMAL: "bg-navy-900 text-ink-muted border-navy-700",
};

export function daysUntil(deadlineIso: string): number {
  const now = new Date();
  const deadline = new Date(deadlineIso);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
