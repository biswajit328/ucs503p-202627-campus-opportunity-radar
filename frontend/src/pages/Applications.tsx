import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApplications, updateApplicationStatus } from "../api/applications";
import { AppShell } from "../components/AppShell";
import { IconArrowRight, IconClipboard } from "../components/icons";
import { getCategoryStyle } from "../utils/category";
import { formatDeadline } from "../utils/deadline";
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from "../types/application";
import type { Opportunity } from "../types/opportunity";

const COLUMNS: { status: ApplicationStatus; title: string; tone: string }[] = [
  { status: "SAVED", title: "Saved", tone: "border-navy-700" },
  { status: "PREPARING", title: "Preparing", tone: "border-amber-400/35" },
  { status: "APPLIED", title: "Applied", tone: "border-teal-400/35" },
  { status: "SHORTLISTED", title: "Shortlisted", tone: "border-teal-400/60" },
  { status: "SELECTED", title: "Selected", tone: "border-teal-300" },
  { status: "REJECTED", title: "Closed", tone: "border-navy-700" },
  { status: "WITHDRAWN", title: "Withdrawn", tone: "border-navy-700" },
];

function readableStatus(status: ApplicationStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<Map<number, Opportunity>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const applicationData = await getApplications();
        if (!cancelled) {
          setApplications(applicationData);
          setOpportunities(new Map(applicationData.map((application) => [application.opportunity.id, application.opportunity])));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your application tracker");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const grouped = useMemo(() => {
    const entries = new Map<ApplicationStatus, Application[]>();
    APPLICATION_STATUSES.forEach((status) => entries.set(status, []));
    applications.forEach((application) => entries.get(application.status)?.push(application));
    return entries;
  }, [applications]);

  const updateStatus = async (applicationId: number, status: ApplicationStatus) => {
    setUpdatingId(applicationId);
    setError(null);
    try {
      const updated = await updateApplicationStatus(applicationId, status);
      setApplications((current) => current.map((application) => application.id === updated.id ? updated : application));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update application status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Application tracker</p>
            <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Move opportunities forward.</h1>
            <p className="mt-2 max-w-xl text-ink-muted">Keep every opportunity visible—from a promising save to a final outcome.</p>
          </div>
          <Link to="/opportunities" className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">Browse opportunities <IconArrowRight className="h-4 w-4" /></Link>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="h-48 rounded-2xl border border-navy-700 bg-navy-800/60" /><div className="h-48 rounded-2xl border border-navy-700 bg-navy-800/60" /><div className="h-48 rounded-2xl border border-navy-700 bg-navy-800/60" /></div>
        ) : applications.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700 bg-navy-900/40 px-6 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300"><IconClipboard className="h-6 w-6" /></span>
            <h2 className="font-display text-xl font-semibold text-ink">Your tracker is clear.</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">Add opportunities as you find them and use this board to keep the next step unmistakably clear.</p>
            <Link to="/opportunities" className="mt-5 text-sm font-semibold text-teal-300 hover:text-teal-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300">Explore the opportunity radar →</Link>
          </section>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="grid min-w-[1420px] grid-cols-7 gap-4">
              {COLUMNS.map(({ status, title, tone }) => {
                const entries = grouped.get(status) ?? [];
                return (
                  <section key={status} className={`rounded-2xl border-t-2 bg-navy-900/45 p-3 ${tone}`}>
                    <div className="mb-3 flex items-center justify-between px-1"><h2 className="font-display text-sm font-semibold text-ink">{title}</h2><span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs text-ink-muted">{entries.length}</span></div>
                    <div className="flex flex-col gap-3">
                      {entries.map((application) => {
                        const opportunity = opportunities.get(application.opportunity_id);
                        const category = opportunity ? getCategoryStyle(opportunity.category) : null;
                        return (
                          <article key={application.id} className="rounded-xl border border-navy-700 bg-navy-800 p-3.5 shadow-sm">
                            {opportunity ? <>
                              <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${category?.chip}`}>{category?.label}</span>
                              <h3 className="mt-2 font-display text-sm font-semibold leading-5 text-ink">{opportunity.title}</h3>
                              <p className="mt-1 truncate text-xs text-ink-muted">{opportunity.organizer}</p>
                              <p className="mt-3 text-[11px] text-ink-muted">Deadline {formatDeadline(opportunity.deadline)}</p>
                            </> : <><h3 className="font-display text-sm font-semibold text-ink">Opportunity #{application.opportunity_id}</h3><p className="mt-1 text-xs text-ink-muted">Details are no longer available.</p></>}
                            <label className="sr-only" htmlFor={`application-${application.id}`}>Update status for {opportunity?.title ?? `opportunity ${application.opportunity_id}`}</label>
                            <select id={`application-${application.id}`} value={application.status} disabled={updatingId === application.id} onChange={(event) => void updateStatus(application.id, event.target.value as ApplicationStatus)} className="mt-3 w-full rounded-lg border border-navy-700 bg-navy-900 px-2 py-2 text-xs text-ink outline-none transition-colors focus:border-teal-400 disabled:opacity-60">
                              {APPLICATION_STATUSES.map((option) => <option key={option} value={option}>{readableStatus(option)}</option>)}
                            </select>
                          </article>
                        );
                      })}
                      {entries.length === 0 && <p className="rounded-lg border border-dashed border-navy-700 px-3 py-5 text-center text-xs text-ink-muted">Nothing here yet</p>}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
