import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconSearch } from "./icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/opportunities?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-xl mx-4 bg-navy-900 border border-navy-700 shadow-2xl rounded-xl overflow-hidden animate-fade-in-up">
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-4 border-b border-navy-800">
          <IconSearch className="w-5 h-5 text-ink-muted shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities, organizations, skills..."
            className="flex-1 bg-transparent border-none text-[15px] text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-0"
          />
          <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[10px] font-medium text-ink-muted bg-navy-950 border border-navy-800 rounded">
            ESC
          </kbd>
        </form>
        <div className="px-4 py-8 text-center">
          <p className="text-[13px] text-ink-muted">Start typing to search opportunities...</p>
        </div>
      </div>
    </div>
  );
}
