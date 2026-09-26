import { useCurrentUser } from "../context/useCurrentUser";
import { IconSearch } from "./icons";

interface Props {
  onSearch: () => void;
}

export function GlobalTopBar({ onSearch }: Props) {
  const { user } = useCurrentUser();

  // Extract first name from email or use generic greeting
  const firstName = user?.email?.split('@')[0] || "User";
  const greetingName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="hidden md:flex items-center justify-between px-8 py-5 border-b border-navy-800/40 bg-navy-950/70 sticky top-0 z-40 backdrop-blur-xl">
      <div className="flex flex-col">
        <h2 className="text-[14px] font-semibold text-ink">Good morning, {greetingName}</h2>
        <p className="text-[12px] text-ink-muted">Your personalized opportunity radar</p>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={onSearch}
          className="group flex items-center gap-3 bg-navy-900/50 border border-navy-800 rounded-lg px-3 py-2 text-ink-muted hover:bg-navy-800 hover:border-navy-700 hover:text-ink transition-all w-64 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 shadow-inner"
        >
          <IconSearch className="w-4 h-4 shrink-0" />
          <span className="text-[13px] flex-1 text-left">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium text-ink-faint border border-navy-800 rounded shadow-[0_1px_0_rgba(255,255,255,0.05)] bg-navy-950">
            ⌘K
          </kbd>
        </button>

        <div className="w-9 h-9 rounded-full bg-teal-400/10 text-teal-400 border border-teal-400/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(45,212,191,0.1)]">
          <span className="text-[13px] font-bold uppercase tracking-wider">{greetingName.charAt(0)}</span>
        </div>
      </div>
    </div>
  );
}
