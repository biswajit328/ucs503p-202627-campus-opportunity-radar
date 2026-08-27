import { useEffect, useState, type FormEvent } from "react";
import { searchOpportunities } from "../api/opportunities";
import { addBookmark, getMyBookmarks, removeBookmark } from "../api/bookmarks";
import { OpportunityCard } from "../components/OpportunityCard";
import type { Opportunity, OpportunitySearchParams } from "../types/opportunity";

const CATEGORIES = [
  "INTERNSHIP", "HACKATHON", "COMPETITION", "SCHOLARSHIP",
  "RESEARCH", "WORKSHOP", "CONFERENCE", "CAMPUS_EVENT", "OTHER",
];
const MODES = ["ONLINE", "OFFLINE", "HYBRID"];

export function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<OpportunitySearchParams>({});

  const loadOpportunities = async (params: OpportunitySearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchOpportunities(params);
      setOpportunities(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load opportunities");
    } finally {
      setLoading(false);
    }
  };

 
    useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [results, bookmarks] = await Promise.all([
          searchOpportunities({}),
          getMyBookmarks().catch(() => []),
        ]);
        if (!cancelled) {
          setOpportunities(results);
          setBookmarkedIds(new Set(bookmarks.map((b) => b.opportunity_id)));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load opportunities");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
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
      setError(err instanceof Error ? err.message : "Could not update bookmark");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Opportunities</h1>

      <form onSubmit={handleSearch} className="bg-slate-800 rounded-lg p-5 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          placeholder="Keyword"
          value={filters.keyword ?? ""}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          className="px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />
        <select
          value={filters.category ?? ""}
          onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
          className="px-3 py-2 rounded bg-slate-700 text-white outline-none"
        >
          <option value="">Any category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filters.mode ?? ""}
          onChange={(e) => setFilters({ ...filters, mode: e.target.value || undefined })}
          className="px-3 py-2 rounded bg-slate-700 text-white outline-none"
        >
          <option value="">Any mode</option>
          {MODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          placeholder="Skill (e.g. Python)"
          value={filters.skill ?? ""}
          onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
          className="px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />
        <input
          placeholder="Branch (e.g. CSE)"
          value={filters.branch ?? ""}
          onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
          className="px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />
        <input
          type="number"
          min={1}
          max={8}
          placeholder="Semester"
          value={filters.semester ?? ""}
          onChange={(e) =>
            setFilters({ ...filters, semester: e.target.value ? Number(e.target.value) : undefined })
          }
          className="px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />
        <button
          type="submit"
          className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-semibold"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-400">Loading opportunities...</p>
      ) : opportunities.length === 0 ? (
        <p className="text-slate-400">No opportunities match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isBookmarked={bookmarkedIds.has(opp.id)}
              onToggleBookmark={handleToggleBookmark}
              toggling={togglingId === opp.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}