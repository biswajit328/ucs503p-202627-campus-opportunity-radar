import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileTopBar } from "./MobileTopBar";
import { GlobalTopBar } from "./GlobalTopBar";
import { GlobalSearchModal } from "./GlobalSearchModal";

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 md:flex relative overflow-hidden">
      {/* AMBIENT RADAR BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] opacity-[0.02] mix-blend-screen radar-sweep rounded-full border border-teal-400/20" style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(45, 212, 191, 0.4) 100%)' }} />
      </div>

      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative z-10 scrollbar-hide">
        <MobileTopBar />
        <GlobalTopBar onSearch={() => setSearchOpen(true)} />
        <div className="flex-1">
          {children}
        </div>
      </div>
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}