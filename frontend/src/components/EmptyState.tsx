import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700 bg-navy-900/40 px-6 py-12 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
        {icon}
      </span>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
