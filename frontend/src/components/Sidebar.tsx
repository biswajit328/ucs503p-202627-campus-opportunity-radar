import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCurrentUser } from "../context/useCurrentUser";
import { IconBuilding, IconClipboard, IconList, IconRadar, IconShield, IconSpark } from "./icons";

function IconBookmark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

const RADAR_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: IconRadar },
  { to: "/opportunities", label: "Opportunities", Icon: IconList },
  { to: "/recommendations", label: "Recommended", Icon: IconSpark },
];

const SPACE_ITEMS = [
  { to: "/bookmarks", label: "Saved", Icon: IconBookmark },
  { to: "/applications", label: "Applications", Icon: IconClipboard },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { user } = useCurrentUser();

  const CONTRIBUTE_ITEMS = [
    {
      to: "/organizer",
      label: user?.role === "ORGANIZER" ? "Submit opportunity" : "Become an organizer",
      Icon: IconBuilding,
    },
    ...(user?.role === "ADMIN" ? [{ to: "/admin/review-queue", label: "Review queue", Icon: IconShield }] : []),
  ];

  const renderNavGroup = (title: string, items: typeof RADAR_ITEMS) => (
    <div className="mb-6 relative">
      <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">{title}</p>
      <div className="flex flex-col gap-1 px-2">
        {items.map(({ to, label, Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 overflow-hidden ${
                active
                  ? "text-teal-400 bg-teal-400/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  : "text-ink-muted hover:text-ink hover:bg-navy-800/50 hover:translate-x-1"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] rounded-r" />
              )}
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-transparent pointer-events-none" />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-colors z-10 ${active ? "text-teal-400" : "text-ink-faint group-hover:text-ink-muted"}`} />
              <span className="flex-1 truncate z-10">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="hidden min-h-screen w-[240px] shrink-0 flex-col border-r border-navy-800/40 bg-navy-950/80 backdrop-blur-xl md:sticky md:top-0 md:flex relative z-50">
      <div className="px-6 py-8 mb-2">
        <Link to="/dashboard" className="flex items-center gap-3 font-display text-[15px] font-semibold tracking-[0.15em] text-ink uppercase">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-400/10 text-teal-400 border border-teal-400/20 shadow-[0_0_15px_rgba(45,212,191,0.15)]"><IconRadar className="h-4 w-4" /></span>
          NEXORA
        </Link>
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col px-3 relative z-10">
        {renderNavGroup("Radar", RADAR_ITEMS)}
        {renderNavGroup("Your Space", SPACE_ITEMS)}
        {renderNavGroup("Contribute", CONTRIBUTE_ITEMS)}
      </nav>

      <div className="px-3 py-4 border-t border-navy-800/40 relative z-10">
        {user && <p className="mb-2 truncate px-4 text-[10px] font-medium text-ink-faint">{user.email}</p>}
        <div className="flex flex-col gap-1">
          <Link
            to="/profile-setup"
            className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 overflow-hidden ${
              location.pathname === "/profile-setup"
                ? "text-teal-400 bg-teal-400/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                : "text-ink-muted hover:text-ink hover:bg-navy-800/50 hover:translate-x-1"
            }`}
          >
            {location.pathname === "/profile-setup" && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] rounded-r" />
            )}
            <IconUser className={`w-4 h-4 shrink-0 transition-colors z-10 ${location.pathname === "/profile-setup" ? "text-teal-400" : "text-ink-faint group-hover:text-ink-muted"}`} />
            <span className="flex-1 truncate z-10">Settings & Profile</span>
          </Link>
          <button
            onClick={logout}
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] text-ink-muted font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-400"
          >
            <div className="w-4 h-4 shrink-0" />
            <span className="flex-1 truncate">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
