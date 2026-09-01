import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecommendations } from "../api/recommendations";
import { addBookmark, getMyBookmarks, removeBookmark } from "../api/bookmarks";
import { RecommendationCard } from "../components/RecommendationCard";
import type { Recommendation } from "../types/recommendation";

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [recs, bookmarks] = await Promise.all([
          getRecommendations(20),
          getMyBookmarks().catch(() => []),
        ]);
        if (!cancelled) {
          setRecommendations(recs);
          setBookmarkedIds(new Set(bookmarks.map((b) => b.opportunity_id)));
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof Error && err.message.toLowerCase().includes("profile")) {
            setNeedsProfile(true);
          } else {
            setError(err instanceof Error ? err.message : "Could not load recommendations");
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
      setError(err instanceof Error ? err.message : "Could not update bookmark");
    } finally {
      setTogglingId(null);
    }
  };

  if (needsProfile) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-10">
        <div className="text-center">
          <p className="text-slate-300 mb-4">Set up your profile to see personalized recommendations.</p>
          <Link to="/profile-setup" className="text-blue-400 hover:underline">
            Go to profile setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-2">Recommended for You</h1>
      <p className="text-slate-400 mb-6">Ranked by fit with your profile, skills, and interests.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-400">Finding your best matches...</p>
      ) : recommendations.length === 0 ? (
        <p className="text-slate-400">No recommendations yet — check back once more opportunities are added.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.opportunity.id}
              recommendation={rec}
              isBookmarked={bookmarkedIds.has(rec.opportunity.id)}
              onToggleBookmark={handleToggleBookmark}
              toggling={togglingId === rec.opportunity.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}