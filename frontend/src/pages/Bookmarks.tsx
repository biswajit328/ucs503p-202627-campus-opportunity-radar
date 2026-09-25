import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookmarks, removeBookmark } from "../api/bookmarks";
import { getOpportunities } from "../api/opportunities";
import { createApplication, getApplications } from "../api/applications";
import { OpportunityCard } from "../components/OpportunityCard";
import { OpportunityDetailModal } from "../components/OpportunityDetailModal";
import { SkeletonCard } from "../components/SkeletonCard";
import { EmptyState } from "../components/EmptyState";
import { AppShell } from "../components/AppShell";
import { IconArrowRight } from "../components/icons";
import type { Opportunity } from "../types/opportunity";

export function Bookmarks() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [bookmarks, apps] = await Promise.all([
          getMyBookmarks(),
          getApplications().catch(() => []),
        ]);
        if (!cancelled) {
          const bookmarkSet = new Set(bookmarks.map((b) => b.opportunity_id));
          setBookmarkedIds(bookmarkSet);
          setTrackedIds(new Set(apps.map((a) => a.opportunity_id)));
          // Use the nested opportunity directly
          const savedOpps = bookmarks.map((b) => b.opportunity);
          setOpportunities(savedOpps);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load saved opportunities"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleToggleBookmark = async (opportunityId: number) => {
    setTogglingId(opportunityId);
    try {
      await removeBookmark(opportunityId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(opportunityId);
        return next;
      });
      setOpportunities((prev) => prev.filter((o) => o.id !== opportunityId));
      if (selectedOpp?.id === opportunityId) {
        setSelectedOpp(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove bookmark"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleTrack = async (opportunityId: number) => {
    setTrackingId(opportunityId);
    try {
      await createApplication(opportunityId);
      setTrackedIds((prev) => new Set(prev).add(opportunityId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not track application"
      );
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">
            Saved
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
            Your saved opportunities
          </h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Opportunities you've bookmarked for later. Remove them by clicking "Saved".
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm text-amber-300"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            }
            title="No saved opportunities"
            description="Browse opportunities and click 'Save' to bookmark them here for quick access."
            action={
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
              >
                Browse opportunities <IconArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <div key={opp.id} onClick={() => setSelectedOpp(opp)} className="cursor-pointer">
                <OpportunityCard
                  opportunity={opp}
                  isBookmarked={bookmarkedIds.has(opp.id)}
                  onToggleBookmark={handleToggleBookmark}
                  toggling={togglingId === opp.id}
                  isTracked={trackedIds.has(opp.id)}
                  onTrack={handleTrack}
                  tracking={trackingId === opp.id}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          isOpen={!!selectedOpp}
          onClose={() => setSelectedOpp(null)}
          isBookmarked={bookmarkedIds.has(selectedOpp.id)}
          onToggleBookmark={handleToggleBookmark}
          toggling={togglingId === selectedOpp.id}
        />
      )}
    </AppShell>
  );
}
