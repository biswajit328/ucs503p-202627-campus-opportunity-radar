import { type FormEvent } from "react";
import type { OpportunitySearchParams } from "../types/opportunity";
import { getCategoryStyle } from "../utils/category";
import { IconSearch } from "./icons";

const CATEGORIES = [
  "INTERNSHIP", "HACKATHON", "COMPETITION", "SCHOLARSHIP",
  "RESEARCH", "WORKSHOP", "CONFERENCE", "CAMPUS_EVENT",
];
const MODES = ["ONLINE", "OFFLINE", "HYBRID"];

interface Props {
  filters: OpportunitySearchParams;
  onChange: (filters: OpportunitySearchParams) => void;
  onSearch: () => void;
}

export function FilterBar({ filters, onChange, onSearch }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4"
    >
      {/* Search input */}
      <div className="relative mb-3">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          placeholder="Search opportunities..."
          value={filters.keyword ?? ""}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
          className="w-full rounded-lg border border-navy-700 bg-navy-900 py-2.5 pl-10 pr-3 text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-teal-400"
        />
      </div>

      {/* Category pills + mode + search */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...filters, category: undefined })}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            !filters.category
              ? "border-teal-400/30 bg-teal-400/15 text-teal-300"
              : "border-navy-700 bg-navy-900 text-ink-muted hover:border-ink-muted hover:text-ink"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const style = getCategoryStyle(cat);
          const active = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  category: active ? undefined : cat,
                })
              }
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-teal-400/30 bg-teal-400/15 text-teal-300"
                  : "border-navy-700 bg-navy-900 text-ink-muted hover:border-ink-muted hover:text-ink"
              }`}
            >
              {style.label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={filters.mode ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                mode: e.target.value || undefined,
              })
            }
            className="rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-ink outline-none transition-colors focus:border-teal-400"
          >
            <option value="">Any mode</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0) + m.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
