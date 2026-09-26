import { Link } from "react-router-dom";
import {
  IconBriefcase,
  IconCode,
  IconTrophy,
  IconCap,
  IconFlask,
  IconWrench,
  IconMic,
  IconCalendar,
} from "./icons";

const CATEGORIES = [
  { key: "INTERNSHIP", label: "Internships", Icon: IconBriefcase, accent: "text-teal-400" },
  { key: "HACKATHON", label: "Hackathons", Icon: IconCode, accent: "text-amber-400" },
  { key: "COMPETITION", label: "Competitions", Icon: IconTrophy, accent: "text-teal-400" },
  { key: "SCHOLARSHIP", label: "Scholarships", Icon: IconCap, accent: "text-amber-400" },
  { key: "RESEARCH", label: "Research", Icon: IconFlask, accent: "text-teal-400" },
  { key: "WORKSHOP", label: "Workshops", Icon: IconWrench, accent: "text-amber-400" },
  { key: "CONFERENCE", label: "Conferences", Icon: IconMic, accent: "text-teal-400" },
  { key: "CAMPUS_EVENT", label: "Campus events", Icon: IconCalendar, accent: "text-amber-400" },
];

export function CategoryTiles() {
  return (
    <div className="flex flex-col">
      {CATEGORIES.map(({ key, label, Icon }) => (
        <Link
          key={key}
          to={`/opportunities?category=${key}`}
          className="group flex items-center justify-between py-2 border-b border-navy-800/50 last:border-0 hover:bg-navy-900/30 px-2 -mx-2 rounded transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-ink-muted group-hover:text-teal-400 transition-colors" />
            <span className="text-[13px] font-medium text-ink group-hover:text-teal-50 transition-colors">
              {label}
            </span>
          </div>
          <span className="text-ink-faint group-hover:text-teal-400/50 transition-colors">&rarr;</span>
        </Link>
      ))}
    </div>
  );
}