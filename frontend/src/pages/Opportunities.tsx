import { useEffect, useState, useRef, useCallback } from "react";
import { searchOpportunities } from "../api/opportunities";
import { addBookmark, getMyBookmarks, removeBookmark } from "../api/bookmarks";
import { createApplication, getApplications } from "../api/applications";
import { OpportunityCard } from "../components/OpportunityCard";
import { OpportunityDetailModal } from "../components/OpportunityDetailModal";
import { FilterBar } from "../components/FilterBar";
import { SkeletonCard } from "../components/SkeletonCard";
import { EmptyState } from "../components/EmptyState";
import { AppShell } from "../components/AppShell";
import { IconList } from "../components/icons";
import type { Opportunity, OpportunitySearchParams } from "../types/opportunity";

import { useSearchParams } from "react-router-dom";

export function Opportunities() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OpportunitySearchParams>({ keyword: initialQuery });
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const loadOpportunities = useCallback(async (params: OpportunitySearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchOpportunities(params);
      setOpportunities(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load opportunities"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [results, bookmarks, apps] = await Promise.all([
          searchOpportunities({}),
          getMyBookmarks().catch(() => []),
          getApplications().catch(() => []),
        ]);
        if (!cancelled) {
          setOpportunities(results);
          setBookmarkedIds(new Set(bookmarks.map((b) => b.opportunity_id)));
          setTrackedIds(new Set(apps.map((a) => a.opportunity_id)));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load opportunities"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // Initial load

  const lastQ = useRef(searchParams.get("q"));

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== lastQ.current) {
      lastQ.current = q;
      setTimeout(() => {
        setFilters((prev) => {
          const next = { ...prev, keyword: q };
          loadOpportunities(next);
          return next;
        });
      }, 0);
    }
  }, [searchParams, loadOpportunities]);

  const handleSearch = () => {
    loadOpportunities(filters);
  };

  const handleToggleBookmark = async (opportunityId: number) => {
    setTogglingId(opportunityId);
    try {
      if (bookmarkedIds.has(opportunityId)) {
        await removeBookmark(opportunityId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(opportunityId);
          return next;
        });
      } else {
        await addBookmark(opportunityId);
        setBookmarkedIds((prev) => new Set(prev).add(opportunityId));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update bookmark"
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
        {/* Header */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">
            Explore
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
            Opportunities
          </h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Browse, filter, and discover what's available on campus and beyond.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onSearch={handleSearch}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm text-amber-300"
          >
            {error}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState
            icon={<IconList className="h-6 w-6" />}
            title="No opportunities found"
            description="Try adjusting your filters or check back later for new opportunities."
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

      {/* Detail modal */}
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