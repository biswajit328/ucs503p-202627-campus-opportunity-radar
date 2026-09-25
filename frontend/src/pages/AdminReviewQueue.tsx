import { useEffect, useState } from "react";
import { approveSubmission, getPendingSubmissions, getSubmissionReview, rejectSubmission } from "../api/submissions";
import { AppShell } from "../components/AppShell";
import { IconCheck, IconShield, IconSpark } from "../components/icons";
import type { Submission, SubmissionReview } from "../types/submission";

function submittedDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function AdminReviewQueue() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [review, setReview] = useState<SubmissionReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReview, setLoadingReview] = useState(false);
  const [actioning, setActioning] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const items = await getPendingSubmissions();
        if (!cancelled) {
          setSubmissions(items);
          if (items[0]) setSelectedId(items[0].id);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load pending submissions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

      useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!selectedId) {
        if (!cancelled) setReview(null);
        return;
      }

      if (!cancelled) {
        setLoadingReview(true);
        setError(null);
      }
      try {
        const selectedReview = await getSubmissionReview(selectedId);
        if (!cancelled) setReview(selectedReview);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not generate the review");
      } finally {
        if (!cancelled) setLoadingReview(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedId) return;
    setActioning(action);
    setError(null);
    try {
      if (action === "approve") await approveSubmission(selectedId);
      else await rejectSubmission(selectedId);
      const reviewedId = selectedId;
      const remaining = submissions.filter((submission) => submission.id !== reviewedId);
      setSubmissions(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setReview(null);
      setNotice(action === "approve" ? "Approved and published to the opportunity feed." : "Submission rejected and removed from the pending queue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${action} this submission`);
    } finally {
      setActioning(null);
    }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Admin workspace</p>
            <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Review queue</h1>
            <p className="mt-2 text-ink-muted">Verify the AI extraction against the original organizer submission before publishing.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ink-muted"><IconShield className="h-4 w-4 text-teal-300" /> {submissions.length} pending</span>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-lg border border-teal-400/30 bg-teal-400/10 px-4 py-3 text-sm text-teal-300">{notice}</p>}

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-[330px_1fr]"><div className="h-96 rounded-2xl border border-navy-700 bg-navy-800/60" /><div className="h-96 rounded-2xl border border-navy-700 bg-navy-800/60" /></div>
        ) : submissions.length === 0 ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700 bg-navy-900/40 px-6 text-center"><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300"><IconCheck className="h-6 w-6" /></span><h2 className="font-display text-xl font-semibold text-ink">Queue clear.</h2><p className="mt-2 text-sm text-ink-muted">There are no organizer submissions waiting for review.</p></section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="h-fit overflow-hidden rounded-2xl border border-navy-700 bg-navy-800">
              <div className="border-b border-navy-700 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Incoming submissions</p></div>
              <div className="max-h-[650px] overflow-y-auto p-2">
                {submissions.map((submission) => <button key={submission.id} onClick={() => { setNotice(null); setSelectedId(submission.id); }} className={`w-full rounded-xl p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-teal-300 ${selectedId === submission.id ? "bg-teal-400/10" : "hover:bg-navy-900"}`}><div className="flex items-center justify-between gap-2"><span className="font-display text-sm font-semibold text-ink">Submission #{submission.id}</span><span className="h-2 w-2 rounded-full bg-amber-400" /></div><p className="mt-1 text-xs text-ink-muted">Received {submittedDate(submission.submitted_at)}</p></button>)}
              </div>
            </aside>

            <section className="min-w-0 rounded-2xl border border-navy-700 bg-navy-800">
              {loadingReview ? <div className="flex min-h-96 items-center justify-center text-sm text-ink-muted"><IconSpark className="mr-2 h-4 w-4 text-teal-300" /> Extracting and validating submission…</div> : review ? <ReviewDetail review={review} actioning={actioning} onApprove={() => void handleAction("approve")} onReject={() => void handleAction("reject")} /> : <div className="flex min-h-96 items-center justify-center text-sm text-ink-muted">Select a submission to review.</div>}
            </section>
          </div>
        )}
      </main>
    </AppShell>
  );
}

interface ReviewDetailProps {
  review: SubmissionReview;
  actioning: "approve" | "reject" | null;
  onApprove: () => void;
  onReject: () => void;
}

function ReviewDetail({ review, actioning, onApprove, onReject }: ReviewDetailProps) {
  const extracted = review.extracted;
  const fields = extracted ? [
    ["Title", extracted.title], ["Category", extracted.category], ["Organizer", extracted.organizer], ["Deadline", extracted.deadline], ["Mode", extracted.mode], ["Location", extracted.location || "Not specified"], ["Skills", extracted.skills.join(", ") || "None extracted"], ["Eligibility", [extracted.eligible_branches.join(", "), extracted.eligible_academic_levels.join(", ")].filter(Boolean).join(" · ") || "Not specified"],
  ] : [];

  return <div>
    <div className="flex flex-col gap-4 border-b border-navy-700 p-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-300">Submission #{review.id}</p><h2 className="mt-2 font-display text-2xl font-semibold text-ink">Extraction review</h2><p className="mt-1 text-sm text-ink-muted">Submitted {submittedDate(review.submitted_at)}</p></div><div className="flex gap-2"><button onClick={onReject} disabled={actioning !== null} className="rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm font-semibold text-ink-muted transition-colors hover:border-amber-400/50 hover:text-amber-300 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">{actioning === "reject" ? "Rejecting…" : "Reject"}</button><button onClick={onApprove} disabled={actioning !== null || !extracted} className="rounded-lg bg-teal-400 px-3 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">{actioning === "approve" ? "Approving…" : "Approve & publish"}</button></div></div>
    <div className="grid gap-6 p-5 xl:grid-cols-[1.1fr_.9fr]"><div><h3 className="mb-3 font-display text-sm font-semibold text-ink">Original submission</h3><pre className="max-h-[470px] overflow-auto whitespace-pre-wrap rounded-xl border border-navy-700 bg-navy-900 p-4 font-body text-sm leading-6 text-ink-muted">{review.raw_text}</pre></div><div><h3 className="mb-3 font-display text-sm font-semibold text-ink">Extracted opportunity</h3>{extracted ? <div className="overflow-hidden rounded-xl border border-navy-700"><dl className="divide-y divide-navy-700">{fields.map(([label, value]) => <div key={label} className="grid grid-cols-[92px_1fr] gap-3 px-3 py-2.5 text-sm"><dt className="text-ink-muted">{label}</dt><dd className="break-words text-ink">{value}</dd></div>)}</dl></div> : <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-300">No extraction was generated. This submission cannot be approved.</p>}
      {review.review && <div className={`mt-4 rounded-xl border p-4 ${review.review.needs_review ? "border-amber-400/35 bg-amber-400/10" : "border-teal-400/25 bg-teal-400/8"}`}><p className={`text-sm font-semibold ${review.review.needs_review ? "text-amber-300" : "text-teal-300"}`}>{review.review.needs_review ? "Review flags found" : "No critical review flags"}</p>{review.review.issues.length > 0 ? <ul className="mt-2 space-y-1 text-sm text-ink-muted">{review.review.issues.map((issue) => <li key={issue}>• {issue}</li>)}</ul> : <p className="mt-1 text-sm text-ink-muted">Extraction passed the available validation checks.</p>}{extracted?.uncertainty_notes && <p className="mt-3 border-t border-navy-700/60 pt-3 text-sm text-ink-muted">AI note: {extracted.uncertainty_notes}</p>}</div>}</div></div>
  </div>;
}
