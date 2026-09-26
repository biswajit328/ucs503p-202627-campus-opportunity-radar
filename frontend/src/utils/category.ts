const categoryStyles: Record<string, { label: string; chip: string; rule: string; icon: string }> = {
  INTERNSHIP: {
    label: "Internship",
    chip: "bg-teal-400/10 text-teal-300 border-teal-400/25",
    rule: "bg-teal-400",
    icon: "bg-teal-400/10 text-teal-300",
  },
  HACKATHON: {
    label: "Hackathon",
    chip: "bg-amber-400/10 text-amber-300 border-amber-400/25",
    rule: "bg-amber-400",
    icon: "bg-amber-400/10 text-amber-300",
  },
  COMPETITION: {
    label: "Competition",
    chip: "bg-teal-400/10 text-teal-300 border-teal-400/25",
    rule: "bg-teal-400",
    icon: "bg-teal-400/10 text-teal-300",
  },
  SCHOLARSHIP: {
    label: "Scholarship",
    chip: "bg-amber-400/10 text-amber-300 border-amber-400/25",
    rule: "bg-amber-400",
    icon: "bg-amber-400/10 text-amber-300",
  },
  RESEARCH: {
    label: "Research",
    chip: "bg-teal-400/10 text-teal-300 border-teal-400/25",
    rule: "bg-teal-400",
    icon: "bg-teal-400/10 text-teal-300",
  },
  WORKSHOP: {
    label: "Workshop",
    chip: "bg-amber-400/10 text-amber-300 border-amber-400/25",
    rule: "bg-amber-400",
    icon: "bg-amber-400/10 text-amber-300",
  },
  CONFERENCE: {
    label: "Conference",
    chip: "bg-teal-400/10 text-teal-300 border-teal-400/25",
    rule: "bg-teal-400",
    icon: "bg-teal-400/10 text-teal-300",
  },
  CAMPUS_EVENT: {
    label: "Campus event",
    chip: "bg-amber-400/10 text-amber-300 border-amber-400/25",
    rule: "bg-amber-400",
    icon: "bg-amber-400/10 text-amber-300",
  },
  OTHER: {
    label: "Opportunity",
    chip: "bg-navy-900 text-ink-muted border-navy-700",
    rule: "bg-ink-muted",
    icon: "bg-navy-900 text-ink-muted",
  },
};

export function getCategoryStyle(category: string) {
  return categoryStyles[category] ?? categoryStyles.OTHER;
}
