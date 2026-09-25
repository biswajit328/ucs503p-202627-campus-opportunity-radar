import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecommendations } from "../api/recommendations";
import { addBookmark, getMyBookmarks, removeBookmark } from "../api/bookmarks";
import { createApplication, getApplications } from "../api/applications";
import { RecommendationCard } from "../components/RecommendationCard";
import { SkeletonRecommendationCard } from "../components/SkeletonCard";
import { EmptyState } from "../components/EmptyState";
import { AppShell } from "../components/AppShell";
import { IconSpark } from "../components/icons";
import type { Recommendation } from "../types/recommendation";

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [recs, bookmarks, apps] = await Promise.all([
          getRecommendations(20),
          getMyBookmarks().catch(() => []),
          getApplications().catch(() => []),
        ]);
        if (!cancelled) {
          setRecommendations(recs);
          setBookmarkedIds(new Set(bookmarks.map((b) => b.opportunity_id)));
          setTrackedIds(new Set(apps.map((a) => a.opportunity_id)));
        }
      } catch (err) {
        if (!cancelled) {
          if (
            err instanceof Error &&
            err.message.toLowerCase().includes("profile")
          ) {
            setNeedsProfile(true);
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Could not load recommendations"
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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

  if (needsProfile) {
    return (
      <AppShell>
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <EmptyState
            icon={<IconSpark className="h-6 w-6" />}
            title="Profile needed for recommendations"
            description="Set up your profile with your skills, interests, and branch so Nexora can match you with the best opportunities."
            action={
              <Link
                to="/profile-setup"
                className="inline-block rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
              >
                Set up your profile
              </Link>
            }
          />
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-[1080px] px-6 py-10 lg:py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            AI-POWERED MATCHES
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink">
            Recommended for you
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-muted">
            Ranked by relevance to your skills, interests, eligibility, and preferences.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mb-8 rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-[13px] text-amber-300"
          >
            {error}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-0 border-t border-navy-800/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-6 border-b border-navy-800/60"><div className="h-16 rounded-lg skeleton-shimmer w-full" /></div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-12 border-t border-navy-800/60">
            <h2 className="text-[12px] font-semibold tracking-[0.15em] text-ink-muted uppercase mb-4">Your Radar Is Quiet</h2>
            <p className="text-[14px] font-medium text-ink mb-1">No opportunities match your profile yet.</p>
            <p className="text-[13px] text-ink-muted mb-6">We'll surface more relevant opportunities as they become available.</p>
            <Link to="/opportunities" className="inline-flex items-center text-[13px] font-medium text-teal-400 hover:text-teal-300 transition-colors">
              Explore all opportunities &rarr;
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold tracking-[0.15em] text-ink-muted uppercase">Matched Opportunities</h2>
              {recommendations.length === 1 && (
                <span className="text-[12px] font-medium text-teal-400">1 opportunity matches your profile</span>
              )}
            </div>

            <div className="flex flex-col gap-0 border-t border-navy-800/60">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.opportunity.id}
                  recommendation={rec}
                  isBookmarked={bookmarkedIds.has(rec.opportunity.id)}
                  onToggleBookmark={handleToggleBookmark}
                  toggling={togglingId === rec.opportunity.id}
                  isTracked={trackedIds.has(rec.opportunity.id)}
                  onTrack={handleTrack}
                  tracking={trackingId === rec.opportunity.id}
                />
              ))}
            </div>

            {recommendations.length === 1 && (
              <div className="mt-8 pt-8 border-t border-navy-800/60">
                <h2 className="text-[11px] font-semibold tracking-[0.15em] text-ink-muted uppercase mb-4">Your Radar Is Quiet</h2>
                <p className="text-[14px] text-ink-muted mb-6">
                  There's only one opportunity matching your current profile.<br/>
                  We'll surface more as new opportunities are added.
                </p>
                <Link to="/opportunities" className="inline-flex items-center text-[13px] font-medium text-teal-400 hover:text-teal-300 transition-colors">
                  Explore all opportunities &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </AppShell>
  );
}
