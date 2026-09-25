import { useState, type FormEvent } from "react";
import { createOrganization } from "../api/organizations";
import { createSubmission } from "../api/submissions";
import { AppShell } from "../components/AppShell";
import { IconBuilding, IconCheck, IconSpark } from "../components/icons";
import { useCurrentUser } from "../context/useCurrentUser";

export function Organizer() {
  const { user, refreshUser } = useCurrentUser();
  const [organizationName, setOrganizationName] = useState("");
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  const handleCreateOrganization = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setCreatingOrganization(true);
    try {
      await createOrganization(organizationName.trim());
      await refreshUser();
      setNotice("Organization created. You can now submit an opportunity for review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your organization");
    } finally {
      setCreatingOrganization(false);
    }
  };

  const handleSubmitOpportunity = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await createSubmission(rawText.trim());
      setRawText("");
      setNotice("Submission received. An admin will review the extracted opportunity before it goes live.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the opportunity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Opportunity contribution</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Put a great opportunity on the radar.</h1>
          <p className="mt-3 leading-7 text-ink-muted">Share the original announcement in plain text. Nexora’s review process extracts the details and keeps the opportunity feed trustworthy.</p>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-lg border border-teal-400/30 bg-teal-400/10 px-4 py-3 text-sm text-teal-300">{notice}</p>}

        {!isOrganizer ? (
          <section className="grid overflow-hidden rounded-2xl border border-navy-700 bg-navy-800 lg:grid-cols-[.9fr_1.1fr]">
            <div className="border-b border-navy-700 bg-navy-900/60 p-7 lg:border-b-0 lg:border-r">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300"><IconBuilding className="h-6 w-6" /></span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-ink">Become an organizer</h2>
              <p className="mt-3 text-sm leading-6 text-ink-muted">Create your organization once, then send opportunity announcements directly into the review queue.</p>
              <ul className="mt-6 space-y-3 text-sm text-ink-muted"><li className="flex gap-2"><IconCheck className="h-4 w-4 shrink-0 text-teal-300" /> No setup or separate approval required</li><li className="flex gap-2"><IconCheck className="h-4 w-4 shrink-0 text-teal-300" /> AI extracts the first draft of the listing</li><li className="flex gap-2"><IconCheck className="h-4 w-4 shrink-0 text-teal-300" /> Admin review protects students from incomplete posts</li></ul>
            </div>
            <form onSubmit={handleCreateOrganization} className="p-7">
              <label htmlFor="organization-name" className="text-sm font-medium text-ink">Organization name</label>
              <input id="organization-name" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="e.g. Computer Science Society" minLength={1} maxLength={255} required className="mt-2 w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-3 text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-teal-400" />
              <p className="mt-2 text-xs leading-5 text-ink-muted">This changes your account to organizer access and associates future submissions with your organization.</p>
              <button disabled={creatingOrganization} type="submit" className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-teal-400 px-4 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">{creatingOrganization ? "Creating organization…" : "Create organization"}</button>
            </form>
          </section>
        ) : (
          <section className="rounded-2xl border border-navy-700 bg-navy-800 p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300"><IconSpark className="h-5 w-5" /></span><div><h2 className="font-display text-xl font-semibold text-ink">Paste the source announcement</h2><p className="mt-1 text-sm text-ink-muted">Include the title, deadline, eligibility, format, location, registration link, and any useful context.</p></div></div>
            <form onSubmit={handleSubmitOpportunity}>
              <label htmlFor="raw-announcement" className="sr-only">Raw opportunity announcement</label>
              <textarea id="raw-announcement" value={rawText} onChange={(event) => setRawText(event.target.value)} required minLength={10} rows={14} placeholder="Paste the original opportunity announcement here…" className="w-full resize-y rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-teal-400" />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-ink-muted">A reviewer sees the original source and an AI-extracted draft before publishing.</p><button disabled={submitting} type="submit" className="rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">{submitting ? "Submitting…" : "Send for review"}</button></div>
            </form>
          </section>
        )}
      </main>
    </AppShell>
  );
}
