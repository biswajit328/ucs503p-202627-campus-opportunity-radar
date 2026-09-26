import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCurrentUser } from "../context/useCurrentUser";
import { IconClipboard, IconList, IconRadar, IconSpark } from "./icons";

function IconBookmark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function MobileTopBar() {
  const { logout } = useAuth();
  const { user } = useCurrentUser();
  const location = useLocation();
  const links = [
    { to: "/dashboard", label: "Home", Icon: IconRadar },
    { to: "/opportunities", label: "Explore", Icon: IconList },
    { to: "/recommendations", label: "Matches", Icon: IconSpark },
    { to: "/bookmarks", label: "Saved", Icon: IconBookmark },
    { to: "/applications", label: "Tracker", Icon: IconClipboard },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-navy-800 bg-navy-950/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-display text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-400 text-navy-950"><IconRadar className="h-4 w-4" /></span>Nexora
        </Link>
        <button onClick={logout} className="text-sm text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">Sign out</button>
      </div>
      <nav aria-label="Mobile navigation" className="grid grid-cols-5 border-t border-navy-800 px-2">
        {links.map(({ to, label, Icon }) => {
          const active = location.pathname === to;
          return <Link key={to} to={to} className={`flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium focus-visible:outline-2 focus-visible:outline-teal-300 ${active ? "text-teal-300" : "text-ink-muted"}`}><Icon className="h-4 w-4" />{label}</Link>;
        })}
      </nav>
      {user?.role === "ADMIN" && <p className="sr-only">Administrator account</p>}
    </header>
  );
}
