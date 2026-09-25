import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CategoryTiles } from "../components/CategoryTiles";
import { MatchRing } from "../components/MatchRing";
import { RadarBackdrop } from "../components/RadarBackdrop";
import { RecommendationCard } from "../components/RecommendationCard";
import { TopMatchBespoke } from "../components/TopMatchBespoke";
import { IconRadar, IconSpark, IconBriefcase, IconCheck, IconClipboard, IconSearch, IconArrowRight } from "../components/icons";
import { api } from "../api/client";
import { getRecommendations } from "../api/recommendations";
import { searchOpportunities } from "../api/opportunities";
import { getMyBookmarks, addBookmark, removeBookmark } from "../api/bookmarks";
import { getApplications } from "../api/applications";
import { getDeadlineUrgency, formatDeadline, urgencyStyles } from "../utils/deadline";
import { getCategoryStyle } from "../utils/category";
import { useCurrentUser } from "../context/useCurrentUser";
import type { StudentProfileOut } from "../types/profile";
import type { Recommendation } from "../types/recommendation";
import type { Opportunity } from "../types/opportunity";
import type { Application } from "../types/application";

export function Dashboard() {
  const { user } = useCurrentUser();
  const [profile, setProfile] = useState<StudentProfileOut | null>(null);
  const [topMatches, setTopMatches] = useState<Recommendation[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [bookmarksData, setBookmarksData] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const [opps, bookmarks, apps] = await Promise.all([
          searchOpportunities({}),
          getMyBookmarks().catch(() => []),
          getApplications().catch(() => []),
        ]);
        if (!cancelled) {
          setAllOpportunities(opps);
          setSavedIds(new Set(bookmarks.map((b) => b.opportunity_id)));
          setBookmarksData(bookmarks);
          setApplications(apps);
        }
      } catch {
        // non-fatal
      }

      try {
        const profileData = await api.get<StudentProfileOut>("/users/me/profile");
        if (!cancelled) setProfile(profileData);
        try {
          const recs = await getRecommendations(4);
          if (!cancelled) setTopMatches(recs);
        } catch {
          // leave empty
        }
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleBookmark = async (opportunityId: number) => {
    if (toggling.has(opportunityId)) return;
    setToggling((prev) => new Set(prev).add(opportunityId));
    try {
      const isCurrentlySaved = savedIds.has(opportunityId);
      if (isCurrentlySaved) {
        await removeBookmark(opportunityId);
      } else {
        await addBookmark(opportunityId);
      }
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(opportunityId)) next.delete(opportunityId);
        else next.add(opportunityId);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(opportunityId);
        return next;
      });
    }
  };

  // Deduplicate all opportunities by title + organizer
  const uniqueOppsMap = new Map();
  [
    ...allOpportunities,
    ...topMatches.map(r => r.opportunity),
    ...bookmarksData.map(b => b.opportunity),
    ...applications.map(a => a.opportunity)
  ].forEach(o => {
    if (!o) return;
    const key = `${o.title.toLowerCase().trim()}|${o.organizer.toLowerCase().trim()}`;
    if (!uniqueOppsMap.has(key)) uniqueOppsMap.set(key, o);
  });
  const uniqueOpps = Array.from(uniqueOppsMap.values());

  const now = new Date();
  const nowTime = now.getTime();

  const activeOpportunities = uniqueOpps.filter((o) => {
    const d = new Date(o.deadline).getTime();
    return isNaN(d) || d >= nowTime;
  });

  // Deduplicate active matches
  const uniqueMatchesMap = new Map<string, Recommendation>();
  for (const rec of topMatches) {
    const key = `${rec.opportunity.title.toLowerCase().trim()}|${rec.opportunity.organizer.toLowerCase().trim()}`;
    if (!uniqueMatchesMap.has(key)) {
      uniqueMatchesMap.set(key, rec);
    }
  }
  const activeMatches = Array.from(uniqueMatchesMap.values()).filter((rec) => {
    const d = new Date(rec.opportunity.deadline).getTime();
    return isNaN(d) || d >= nowTime;
  });

  const closingSoon = activeOpportunities
    .filter((o) => ["URGENT", "SOON"].includes(getDeadlineUrgency(o.deadline)))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Derive profile completeness
  let profileScore = 0;
  if (profile) {
    if (profile.branch) profileScore += 25;
    if (profile.semester) profileScore += 25;
    if (profile.skills.length > 0) profileScore += 25;
    if (profile.interests.length > 0) profileScore += 25;
  }

  const greeting = profile?.name ? profile.name.split(" ")[0] : user?.email.split("@")[0] || "there";

  const activeAppsCount = applications.filter(a => !["REJECTED", "ACCEPTED"].includes(a.status)).length;
  const completedAppsCount = applications.filter(a => ["REJECTED", "ACCEPTED"].includes(a.status)).length;
  const newSinceLastVisit = 0; // Placeholder for actual "new" data if available in future

  // Add filter state for the feed
  const [feedFilter, setFeedFilter] = useState("All");

  const feedMatches = activeMatches.slice(1).filter(rec => {
    if (feedFilter === "All") return true;
    return rec.opportunity.category.toLowerCase() === feedFilter.toLowerCase();
  });

  return (
    <AppShell>
      <main className="max-w-[1440px] mx-auto px-6 py-10 lg:py-12">
        {loading ? (
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="flex-1 min-w-0 space-y-6">
              <div className="h-8 w-64 rounded bg-navy-800/50 skeleton-shimmer" />
              <div className="h-64 rounded-lg bg-navy-800/50 skeleton-shimmer" />
              <div className="h-32 rounded-lg bg-navy-800/50 skeleton-shimmer" />
            </div>
            <div className="w-full lg:w-[280px] shrink-0 space-y-8">
              <div className="h-40 rounded-lg bg-navy-800/50 skeleton-shimmer" />
              <div className="h-40 rounded-lg bg-navy-800/50 skeleton-shimmer" />
            </div>
          </div>
        ) : !profile ? (
          <div className="animate-fade-in-up border border-navy-800 rounded-lg p-8 max-w-lg mt-10">
            <p className="font-display text-lg text-ink mb-2 font-semibold">Profile required</p>
            <p className="text-ink-muted text-[13px] mb-6 leading-relaxed">
              Nexora needs to know your branch, semester, skills, and interests to discover opportunities that match your specific profile.
            </p>
            <Link to="/profile-setup" className="inline-flex bg-teal-400 hover:bg-teal-300 text-navy-950 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors">
              Set up your profile
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

            {/* CENTER: PRIMARY WORKSPACE */}
            <div className="flex-1 min-w-0 w-full flex flex-col gap-14">

              {/* DASHBOARD HERO / METRIC STRIP */}
              <section className="animate-fade-in-up">
                <h2 className="text-[11px] font-semibold tracking-[0.2em] text-ink-muted uppercase mb-4">Your Radar</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]">
                  <span className="text-ink font-medium">{activeMatches.length} relevant opportunit{activeMatches.length === 1 ? 'y' : 'ies'}</span>
                  <span className="text-navy-700">&middot;</span>
                  <span className={closingSoon.length > 0 ? "text-amber-400 font-medium" : "text-ink-muted"}>{closingSoon.length} closing soon</span>
                  <span className="text-navy-700">&middot;</span>
                  <span className="text-ink-muted">{savedIds.size} saved</span>
                  <span className="text-navy-700">&middot;</span>
                  <span className="text-ink-muted">{activeAppsCount} application{activeAppsCount !== 1 ? 's' : ''}</span>
                </div>
              </section>

              {activeMatches.length > 0 && (
                <section className="animate-fade-in-up stagger-1">
                  <h2 className="text-[10px] font-semibold tracking-[0.2em] text-teal-400 uppercase mb-5">Top Match</h2>
                  <TopMatchBespoke
                    recommendation={activeMatches[0]}
                    isBookmarked={savedIds.has(activeMatches[0].opportunity.id)}
                    onToggleBookmark={handleToggleBookmark}
                    toggling={toggling.has(activeMatches[0].opportunity.id)}
                  />
                </section>
              )}

              {/* OPPORTUNITY DISCOVERY FEED */}
              {activeMatches.length > 1 ? (
                <section className="animate-fade-in-up stagger-2">
                  <h2 className="text-[10px] font-semibold tracking-[0.2em] text-ink-muted uppercase mb-5">Your Opportunities</h2>
                  <div className="flex items-center gap-6 mb-4 overflow-x-auto pb-2 scrollbar-hide border-b border-navy-800/60">
                    {['All', 'Internships', 'Hackathons', 'Competitions', 'Scholarships', 'Research', 'Workshops'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFeedFilter(filter)}
                        className={`text-[12px] font-medium whitespace-nowrap pb-3 border-b-2 transition-colors ${feedFilter === filter ? 'text-ink border-teal-400' : 'text-ink-muted border-transparent hover:text-ink'}`}
                      >
                        {filter}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button className="text-[12px] font-medium text-ink-muted hover:text-ink pb-3 whitespace-nowrap">Best match &darr;</button>
                  </div>
                  <div>
                    {feedMatches.length > 0 ? (
                      feedMatches.map((rec) => (
                        <RecommendationCard
                          key={rec.opportunity.id}
                          recommendation={rec}
                          isBookmarked={savedIds.has(rec.opportunity.id)}
                          onToggleBookmark={handleToggleBookmark}
                          toggling={toggling.has(rec.opportunity.id)}
                        />
                      ))
                    ) : (
                      <div className="py-8 text-center text-[13px] text-ink-muted">
                        No {feedFilter !== 'All' ? feedFilter.toLowerCase() : 'opportunities'} match your current profile.
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                /* LOW-DATA STATE FILLER */
                <div className="flex flex-col gap-10 animate-fade-in-up stagger-2">

                  {/* CLOSING SOON (if any) */}
                  {closingSoon.length > 0 && (
                    <section>
                      <h2 className="text-[10px] font-semibold tracking-[0.2em] text-amber-400 uppercase mb-4">Closing Soon</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {closingSoon.slice(0, 3).map(o => (
                          <Link key={o.id} to={`/opportunities/${o.id}`} className="surface-premium rounded-xl p-5 flex flex-col gap-3 group hover:-translate-y-1 transition-all">
                            <span className="text-[15px] font-semibold text-ink line-clamp-2 leading-snug group-hover:text-teal-400 transition-colors">{o.title}</span>
                            <div className="mt-auto flex items-center justify-between">
                              <span className="text-[12px] font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                                {getDeadlineUrgency(o.deadline) === "URGENT" || getDeadlineUrgency(o.deadline) === "SOON" ? `Closes in ${Math.ceil((new Date(o.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d` : formatDeadline(o.deadline)}
                              </span>
                              <span className="text-ink-muted group-hover:text-teal-400 transition-colors">&rarr;</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* SAVED */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[10px] font-semibold tracking-[0.2em] text-ink-muted uppercase">Saved</h2>
                      {savedIds.size > 3 && (
                        <Link to="/bookmarks" className="text-[11px] font-medium text-teal-400 hover:text-teal-300 uppercase tracking-wider">View All</Link>
                      )}
                    </div>
                    {savedIds.size > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from(savedIds).slice(0, 3).map(id => {
                          const o = uniqueOpps.find(opp => opp.id === id);
                          if (!o) return null;
                          return (
                            <Link key={o.id} to={`/opportunities/${o.id}`} className="surface-premium rounded-xl p-5 flex flex-col gap-3 group hover:-translate-y-1 transition-all">
                              <span className="text-[15px] font-semibold text-ink line-clamp-2 leading-snug group-hover:text-teal-400 transition-colors">{o.title}</span>
                              <span className="mt-auto text-[12px] font-medium text-ink-muted bg-navy-800 self-start px-2 py-1 rounded">
                                {o.category}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="surface-premium rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <IconSpark className="w-6 h-6 text-ink-faint mb-3" />
                        <p className="font-medium text-ink text-[14px]">Nothing saved yet</p>
                        <p className="text-[13px] text-ink-muted mt-1">Bookmark opportunities to build your personal radar.</p>
                      </div>
                    )}
                  </section>

                  {/* DISCOVER */}
                  <section>
                    <h2 className="text-[10px] font-semibold tracking-[0.2em] text-ink-muted uppercase mb-4">Discover</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['Internships', 'Hackathons', 'Competitions', 'Scholarships', 'Research', 'Workshops'].map((cat) => (
                        <Link key={cat} to="/opportunities" className="surface-premium rounded-xl p-4 flex items-center justify-between group hover:-translate-y-1 transition-all hover:border-teal-400/30 hover:bg-navy-800">
                          <span className="text-[13px] font-medium text-ink group-hover:text-teal-400 transition-colors">{cat}</span>
                          <span className="text-ink-muted opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">&rarr;</span>
                        </Link>
                      ))}
                    </div>
                  </section>

                </div>
              )}
            </div>

            {/* RIGHT: CONTEXTUAL INTELLIGENCE RAIL */}
            <aside className="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col gap-6 animate-fade-in-up stagger-3 lg:pt-2">

              {/* PROFILE STAT CARD */}
              <div className="surface-premium rounded-xl p-5 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[10px] font-semibold tracking-[0.2em] text-ink-muted uppercase">Profile</h2>
                  <Link to="/profile-setup" className="text-ink-muted hover:text-teal-400 transition-colors">
                    <IconClipboard className="w-4 h-4" />
                  </Link>
                </div>
                <h3 className="text-[15px] font-semibold text-ink uppercase tracking-wider truncate">{profile.name}</h3>
                <p className="text-[11px] text-ink-muted mt-1 uppercase tracking-wider truncate">{profile.branch} &middot; Sem {profile.semester}</p>

                <div className="mt-5 mb-2 bg-navy-900 rounded-full h-1 overflow-hidden relative">
                  <div className="bg-teal-400 h-full rounded-full transition-all duration-1000 ease-out absolute left-0 top-0" style={{ width: `${profileScore}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-teal-400">Signal Strength</span>
                  <span className="font-bold text-ink">{profileScore}%</span>
                </div>
              </div>

              {/* THIS WEEK STAT CARDS */}
              <div className="grid grid-cols-2 gap-4">
                <Link to="/applications" className="surface-premium rounded-xl p-4 flex flex-col items-start gap-3 hover:-translate-y-1 transition-transform group">
                  <div className="w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center text-ink-muted group-hover:text-teal-400 group-hover:bg-teal-400/10 transition-colors">
                    <IconBriefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-2xl font-display font-bold text-ink mb-0.5">{activeAppsCount}</span>
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted">Applications</span>
                  </div>
                </Link>
                <Link to="/bookmarks" className="surface-premium rounded-xl p-4 flex flex-col items-start gap-3 hover:-translate-y-1 transition-transform group">
                  <div className="w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center text-ink-muted group-hover:text-teal-400 group-hover:bg-teal-400/10 transition-colors">
                    <IconSpark className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-2xl font-display font-bold text-ink mb-0.5">{savedIds.size}</span>
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted">Saved</span>
                  </div>
                </Link>
              </div>

              {/* CLOSING SOON (if any) */}
              {closingSoon.length > 0 && (
                <div className="surface-premium rounded-xl p-4 flex items-center justify-between hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="text-[11px] font-semibold tracking-wider text-ink uppercase">Closing soon</span>
                  </div>
                  <span className="text-[15px] font-display font-bold text-amber-400">{closingSoon.length}</span>
                </div>
              )}

              {/* BECOME AN ORGANIZER CTA */}
              <Link to="/organizer" className="relative rounded-xl p-5 overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all border border-teal-400/20 bg-teal-400/5 mt-2 shadow-[0_4px_24px_-4px_rgba(45,212,191,0.1)] block">
                <div className="absolute top-[-50%] right-[-20%] w-40 h-40 bg-teal-400/20 blur-[50px] rounded-full group-hover:bg-teal-400/30 transition-colors duration-700 pointer-events-none" />
                <h2 className="text-[13px] font-semibold text-teal-400 mb-2 relative z-10 uppercase tracking-wider">Become an Organizer</h2>
                <p className="text-[12px] text-ink-muted mb-4 relative z-10 leading-relaxed">Host hackathons, list internships, and discover top student talent.</p>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink uppercase tracking-wider group-hover:text-teal-400 transition-colors relative z-10">
                  Get Started &rarr;
                </div>
              </Link>

            </aside>
          </div>
        )}
      </main>
    </AppShell>
  );
}
