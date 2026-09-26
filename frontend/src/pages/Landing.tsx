import { Link, Navigate } from "react-router-dom";
import { RadarBackdrop } from "../components/RadarBackdrop";
import { MatchRing } from "../components/MatchRing";
import {
  IconArrowRight,
  IconRadar,
  IconSpark,
  IconCap,
  IconCheck,
  IconSearch,
  IconPin,
  IconBuilding
} from "../components/icons";
import { useAuth } from "../context/useAuth";

// --- DEMO DATA FOR MOCKUPS ---
const DEMO_CATEGORIES = ["All", "Internships", "Hackathons", "Competitions", "Scholarships", "Research", "Campus Events"];

const DEMO_OPPS = [
  {
    id: 1,
    title: "Software Engineering Intern",
    organizer: "TechFlow Dynamics",
    category: "INTERNSHIP",
    deadline: "In 3 days",
    skills: ["React", "TypeScript", "Node.js"],
    match: 94,
    mode: "REMOTE",
  },
  {
    id: 2,
    title: "Global AI Hackathon 2026",
    organizer: "DevSphere",
    category: "HACKATHON",
    deadline: "In 1 week",
    skills: ["Python", "TensorFlow", "FastAPI"],
    match: 88,
    mode: "HYBRID",
  },
  {
    id: 3,
    title: "Undergrad Research Grant",
    organizer: "National Science Board",
    category: "RESEARCH",
    deadline: "In 2 weeks",
    skills: ["Data Analysis", "Machine Learning"],
    match: 76,
    mode: "IN_PERSON",
  },
];

// --- SUB-COMPONENTS ---

function Header() {
  return (
    <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8 border-b border-navy-800/40 bg-navy-950/50 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight hover:text-teal-400 transition-colors">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 text-navy-950 shadow-lg shadow-teal-400/20">
          <IconRadar className="h-5 w-5" />
        </span>
        Nexora
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/login" className="text-ink-muted transition-colors hover:text-ink focus-visible:outline-teal-400">Log in</Link>
        <Link to="/register" className="rounded-lg bg-ink px-4 py-2 text-navy-950 shadow-md transition-all hover:bg-white hover:scale-105 active:scale-95 focus-visible:outline-teal-400">
          Get Started
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.15] mix-blend-screen pointer-events-none">
        <RadarBackdrop size={800} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 flex flex-col items-center text-center">
        <div className="animate-fade-in-up stagger-1 mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-[11px] font-semibold tracking-widest text-teal-300 uppercase shadow-[0_0_20px_rgba(45,212,191,0.15)]">
          <IconSpark className="h-3.5 w-3.5" />
          The Intelligent Opportunity Platform
        </div>

        <h1 className="animate-fade-in-up stagger-2 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[5rem]">
          Find the signal in <br className="hidden sm:block" />
          <span className="text-gradient">campus noise.</span>
        </h1>

        <p className="animate-fade-in-up stagger-3 mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Stop scrolling through irrelevant opportunities. Nexora uses your skills, interests, eligibility and preferences to surface the opportunities that actually fit you.
        </p>

        <div className="animate-fade-in-up stagger-4 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
          <Link to="/register" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-3.5 text-base font-bold text-navy-950 shadow-lg shadow-teal-400/20 transition-all hover:bg-teal-300 hover:shadow-teal-400/40 hover:-translate-y-0.5 sm:w-auto">
            Build your radar
            <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/opportunities" className="flex w-full items-center justify-center rounded-xl border border-navy-700 bg-navy-900/50 px-6 py-3.5 text-base font-semibold text-ink backdrop-blur-sm transition-all hover:border-teal-400/40 hover:bg-navy-800 sm:w-auto">
            Explore opportunities
          </Link>
        </div>

        {/* Dashboard/Recommendation Mockup */}
        <div className="animate-fade-in-up stagger-5 relative mt-16 w-full max-w-5xl [perspective:1000px]">
          <div className="relative rounded-2xl border border-navy-700/60 bg-navy-900/60 p-2 shadow-2xl backdrop-blur-xl sm:p-4 transition-transform duration-500 hover:[transform:rotateX(0deg)_translateY(-5px)] [transform:rotateX(4deg)]">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-teal-400/20 to-transparent opacity-40 blur-sm pointer-events-none" />

            <div className="relative flex flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-950/80 shadow-inner h-[400px] sm:h-[500px]">
              {/* Mockup Header */}
              <div className="flex items-center gap-3 border-b border-navy-800/80 bg-navy-900/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-navy-700" />
                  <div className="h-3 w-3 rounded-full bg-navy-700" />
                  <div className="h-3 w-3 rounded-full bg-navy-700" />
                </div>
                <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-navy-950 text-[10px] text-ink-faint border border-navy-800">
                  <IconSearch className="w-3 h-3 mr-2" /> search opportunities...
                </div>
              </div>

              {/* Mockup Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Mockup Sidebar */}
                <div className="hidden w-48 flex-col gap-2 border-r border-navy-800/80 bg-navy-900/30 p-4 sm:flex">
                  <div className="h-4 w-24 rounded bg-navy-800 mb-4" />
                  <div className="h-8 w-full rounded bg-navy-800/50" />
                  <div className="h-8 w-full rounded bg-teal-400/10 border border-teal-400/20" />
                  <div className="h-8 w-full rounded bg-navy-800/50" />
                </div>

                {/* Mockup Content - Recommendation Focus */}
                <div className="flex-1 p-6 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />

                  <div className="h-6 w-48 rounded bg-navy-800 mb-6" />

                  {/* The Star Mock Card */}
                  <div className="glass-panel relative flex flex-col sm:flex-row gap-6 rounded-2xl p-6 shadow-xl shadow-navy-950/50 border-teal-400/30">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-flex rounded-md border border-teal-400/20 bg-teal-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                            Hackathon
                          </span>
                          <h3 className="mt-3 font-display text-2xl font-semibold text-ink">AI/ML Campus Hackathon</h3>
                          <p className="text-sm text-ink-muted mt-1">TechSphere University • In 5 days</p>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-navy-900/80 rounded-xl p-3 border border-navy-700">
                          <MatchRing score={91} size={64} />
                          <span className="text-[10px] uppercase tracking-wider text-teal-400 font-semibold mt-2">Match</span>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-navy-700/50 bg-navy-900/50 p-4">
                        <p className="text-sm text-ink-muted leading-relaxed mb-4">
                          <span className="text-teal-300 font-medium">Recommended:</span> Your profile strongly matches the required Python, Machine Learning, and Data Analysis skills.
                        </p>

                        <div className="space-y-2.5">
                          {[
                            { label: "Skills", val: 96, w: "96%", color: "bg-teal-400" },
                            { label: "Interests", val: 91, w: "91%", color: "bg-teal-300" },
                            { label: "Eligibility", val: 84, w: "84%", color: "bg-amber-400" },
                            { label: "Preferences", val: 93, w: "93%", color: "bg-amber-300" },
                          ].map((b) => (
                            <div key={b.label} className="flex items-center gap-3 text-xs">
                              <span className="w-20 text-ink-muted">{b.label}</span>
                              <div className="h-1.5 flex-1 rounded-full bg-navy-800 overflow-hidden">
                                <div className={`h-full ${b.color} rounded-full`} style={{ width: b.w }} />
                              </div>
                              <span className="w-8 text-right font-medium text-ink">{b.val}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Faded background mock cards */}
                  <div className="mt-4 flex gap-4 opacity-40">
                    <div className="h-32 flex-1 rounded-xl bg-navy-800 border border-navy-700" />
                    <div className="h-32 flex-1 rounded-xl bg-navy-800 border border-navy-700 hidden sm:block" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueStrip() {
  const values = [
    { icon: <IconSpark className="w-5 h-5 text-teal-400" />, title: "AI-powered matching", desc: "Rankings tailored to you" },
    { icon: <IconRadar className="w-5 h-5 text-amber-400" />, title: "Personalized discovery", desc: "Only see what fits" },
    { icon: <IconCheck className="w-5 h-5 text-teal-400" />, title: "Smart explanations", desc: "Know why you matched" },
    { icon: <IconPin className="w-5 h-5 text-amber-400" />, title: "Application tracking", desc: "Never miss a deadline" },
  ];
  return (
    <section className="border-y border-navy-800/60 bg-navy-900/30">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800 border border-navy-700 shadow-inner">
                {v.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{v.title}</p>
                <p className="text-[11px] text-ink-muted">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Discovery() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-12 md:flex md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Opportunities worth your attention.</h2>
            <p className="mt-4 text-lg text-ink-muted">From internships to hackathons, Nexora ranks opportunities based on your profile.</p>
          </div>
          <Link to="/opportunities" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300">
            View marketplace <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mb-8 flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {DEMO_CATEGORIES.map((cat, i) => (
            <span key={cat} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-default ${i === 0 ? 'bg-teal-400/10 border-teal-400/30 text-teal-300' : 'bg-navy-900 border-navy-700 text-ink-muted'}`}>
              {cat}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_OPPS.map((opp) => (
            <article key={opp.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-700/80 bg-gradient-to-b from-navy-800 to-navy-800/60 shadow-lg shadow-navy-950/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-600" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex rounded-md border border-navy-600 bg-navy-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    {opp.category}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-teal-400/10 px-2 py-1 border border-teal-400/20">
                    <IconSpark className="w-3 h-3 text-teal-400" />
                    <span className="text-xs font-bold text-teal-400">{opp.match}%</span>
                  </div>
                </div>

                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-teal-50 transition-colors mb-1">{opp.title}</h3>
                <p className="text-sm text-ink-muted mb-4">{opp.organizer}</p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {opp.skills.map((skill) => (
                    <span key={skill} className="rounded-md bg-navy-900 border border-navy-700 px-2 py-1 text-[11px] font-medium text-ink-muted">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-navy-700/50 pt-4">
                  <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                    <span>{opp.deadline}</span>
                    <span>•</span>
                    <span>{opp.mode}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiMatching() {
  return (
    <section className="py-24 bg-navy-900/30 border-y border-navy-800/60 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="mx-auto max-w-7xl px-6 sm:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold tracking-widest text-amber-400 uppercase mb-6">
              AI Recommendation Engine
            </div>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl leading-tight mb-6">
              Don't just find opportunities.<br />Find the right ones.
            </h2>
            <p className="text-lg text-ink-muted mb-8 leading-relaxed">
              Our matching engine evaluates opportunities across five dimensions: skills, interests, eligibility, mode, and deadlines. It doesn't just give you a score—it explains exactly <i>why</i> a position is a good fit.
            </p>
            <ul className="space-y-4">
              {[
                "Filters out roles you aren't eligible for.",
                "Prioritizes opportunities that align with your core skills.",
                "Explains the match logic transparently.",
                "Learns what you save to improve future recommendations."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400/10 text-teal-400">
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span className="text-ink-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative [perspective:1000px]">
            <div className="glass-panel rounded-2xl p-6 shadow-2xl border-teal-400/20 transition-transform duration-700 [transform:rotateY(-8deg)_translateZ(0)] hover:[transform:rotateY(0deg)_translateZ(10px)] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-transparent rounded-2xl pointer-events-none" />
              <div className="flex items-start justify-between border-b border-navy-700/60 pb-5 mb-5 relative z-10">
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">Google AI Challenge</h3>
                  <p className="text-sm text-ink-muted mt-1">Global Competition • Online</p>
                </div>
                <div className="flex flex-col items-center">
                  <MatchRing score={94} size={56} />
                  <span className="text-[9px] uppercase tracking-widest text-teal-400 font-bold mt-1.5">Match</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-ink leading-relaxed flex gap-2">
                  <IconSpark className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>Strong match because your profile includes Python, Machine Learning and AI-related interests. You also meet the 3rd-year eligibility requirement.</span>
                </p>
              </div>

              <div className="space-y-3 bg-navy-950/50 rounded-xl p-4 border border-navy-800">
                <p className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-3">Multi-dimensional Analysis</p>
                {[
                  { label: "Skills", val: 98, color: "bg-teal-400" },
                  { label: "Interests", val: 92, color: "bg-teal-300" },
                  { label: "Eligibility", val: 100, color: "bg-amber-400" },
                  { label: "Preferences", val: 85, color: "bg-amber-300" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-ink-muted font-medium">{b.label}</span>
                    <div className="h-2 flex-1 rounded-full bg-navy-800 overflow-hidden">
                      <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.val}%` }} />
                    </div>
                    <span className="w-8 text-right font-bold text-ink">{b.val}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { step: "01", title: "Build your profile", desc: "Add your branch, semester, technical skills, and specific interests." },
    { step: "02", title: "Nexora scans", desc: "We aggregate internships, hackathons, and campus events in real-time." },
    { step: "03", title: "AI matches", desc: "Your profile is compared against requirements to calculate exact fit scores." },
    { step: "04", title: "Take action", desc: "Save top matches, track applications, and stay ahead of deadlines." }
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">From profile to opportunity.</h2>
          <p className="mt-4 text-lg text-ink-muted">A streamlined pipeline for your career.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-teal-400/0 via-teal-400/20 to-teal-400/0 -translate-y-1/2 z-0" />

          {steps.map((f, i) => (
            <div key={f.step} className="relative z-10 glass-panel rounded-2xl p-6 hover:-translate-y-1 transition-transform border border-navy-700/80 bg-navy-900/80 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-950 border border-teal-400/30 text-teal-400 text-xs font-bold shadow-[0_0_10px_rgba(45,212,191,0.2)]">
                  {i + 1}
                </div>
                <span className="text-4xl font-display font-bold text-navy-800 select-none">{f.step}</span>
              </div>
              <p className="font-display text-lg font-semibold text-ink mb-2">{f.title}</p>
              <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiation() {
  return (
    <section className="py-24 bg-navy-950 relative overflow-hidden border-y border-navy-800">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Less searching. More relevant opportunities.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* The Noise */}
          <div className="rounded-2xl border border-navy-800 bg-navy-900/20 p-8 flex flex-col items-center text-center">
            <h3 className="text-xl font-display font-semibold text-ink-muted mb-8">The Noise</h3>
            <div className="flex flex-col gap-4 w-full max-w-xs opacity-50 grayscale">
              <div className="h-16 rounded-xl border border-navy-700 bg-navy-800 flex items-center justify-center text-xs text-ink-faint">Senior Dev Role (Requires 5 YOE)</div>
              <div className="h-16 rounded-xl border border-navy-700 bg-navy-800 flex items-center justify-center text-xs text-ink-faint">Design Internship (Wrong branch)</div>
              <div className="h-16 rounded-xl border border-navy-700 bg-navy-800 flex items-center justify-center text-xs text-ink-faint">Event Registration (Closed)</div>
            </div>
            <p className="mt-8 text-sm text-ink-faint uppercase tracking-widest font-semibold">Endless scrolling • Missed deadlines</p>
          </div>

          {/* The Signal */}
          <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 p-8 flex flex-col items-center text-center relative shadow-[inset_0_0_40px_rgba(45,212,191,0.05)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50" />
            <h3 className="text-xl font-display font-semibold text-teal-400 mb-8 flex items-center gap-2">
              <IconRadar className="w-5 h-5" /> The Signal
            </h3>
            <div className="flex flex-col gap-4 w-full max-w-xs relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400/10 via-teal-400/40 to-teal-400/10 -translate-x-1/2 -z-10" />

              <div className="h-12 rounded-xl border border-teal-400/30 bg-navy-900 shadow-lg flex items-center justify-center text-xs text-ink z-10 w-3/4 mx-auto">Your Profile</div>

              <div className="my-2 flex justify-center z-10">
                <div className="bg-navy-950 p-2 rounded-full border border-teal-400/30">
                  <IconSpark className="w-4 h-4 text-teal-400" />
                </div>
              </div>

              <div className="h-20 rounded-xl border border-teal-400/50 bg-navy-800 shadow-[0_0_20px_rgba(45,212,191,0.15)] flex flex-col items-center justify-center text-sm font-semibold text-ink z-10">
                <span className="text-teal-400 text-[10px] uppercase tracking-wider mb-1">94% Match</span>
                Perfect Internship
              </div>
            </div>
            <p className="mt-8 text-sm text-teal-400/60 uppercase tracking-widest font-semibold">Ranked results • Instant Action</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function UsersSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Built for both sides of opportunity.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border-teal-400/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 blur-[80px] rounded-full group-hover:bg-teal-400/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-navy-900 border border-navy-700 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <IconCap className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-teal-400 mb-2">Students</h3>
              <p className="font-display text-2xl font-semibold text-ink mb-6">Find opportunities that fit you.</p>

              <ul className="space-y-3 mb-10">
                {["Personalized recommendations", "AI match scores & explanations", "Saved opportunities", "Application tracking", "Deadline awareness"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-ink-muted">
                    <IconCheck className="w-4 h-4 text-teal-400/70" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-teal-400 transition-colors">
                Explore as a student <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 sm:p-12 border-amber-400/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 blur-[80px] rounded-full group-hover:bg-amber-400/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-navy-900 border border-navy-700 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <IconBuilding className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-2">Organizers</h3>
              <p className="font-display text-2xl font-semibold text-ink mb-6">Reach the right students.</p>

              <ul className="space-y-3 mb-10">
                {["Publish structured opportunities", "Manage student submissions", "Reach relevant profiles via AI", "Review applicant suitability", "Centralized dashboard"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-ink-muted">
                    <IconCheck className="w-4 h-4 text-amber-400/70" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/organizer" className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-amber-400 transition-colors">
                Become an organizer <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductProof() {
  const capabilities = [
    "AI-powered recommendations",
    "Profile-based matching",
    "Opportunity discovery",
    "Saved opportunities",
    "Application tracking",
    "Organizer workflows"
  ];
  return (
    <section className="py-16 border-y border-navy-800/60 bg-navy-900/30">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-ink-faint mb-8">
          Everything you need to manage your opportunity journey.
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
          {capabilities.map((cap, i) => (
            <span key={i} className="px-4 py-2 rounded-full border border-navy-700 bg-navy-800/50 text-sm font-medium text-ink-muted">
              {cap}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <RadarBackdrop size={800} />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-navy-950 mb-8 shadow-lg shadow-teal-400/20">
          <IconRadar className="w-8 h-8" />
        </div>
        <h2 className="font-display text-4xl font-semibold text-ink sm:text-5xl tracking-tight mb-6">
          Your next opportunity shouldn't be buried in the noise.
        </h2>
        <p className="text-lg text-ink-muted mb-10 max-w-2xl mx-auto">
          Build your profile. Let Nexora find the opportunities worth your attention.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-8 py-4 text-base font-bold text-navy-950 shadow-xl shadow-teal-400/20 transition-all hover:bg-teal-300 hover:scale-105 active:scale-95 sm:w-auto">
            Build your radar
            <IconArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/opportunities" className="inline-flex w-full items-center justify-center rounded-xl border border-navy-700 bg-navy-900/80 px-8 py-4 text-base font-semibold text-ink backdrop-blur-sm transition-colors hover:border-teal-400/50 hover:bg-navy-800 sm:w-auto">
            Explore opportunities
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-teal-400 text-navy-950">
                <IconRadar className="h-3.5 w-3.5" />
              </span>
              Nexora
            </Link>
            <p className="text-sm text-ink-muted max-w-xs">
              Find the signal in campus noise. The intelligent opportunity platform for students and organizers.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li><Link to="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/opportunities" className="hover:text-teal-400 transition-colors">Opportunities</Link></li>
              <li><Link to="/recommendations" className="hover:text-teal-400 transition-colors">Recommended</Link></li>
              <li><Link to="/bookmarks" className="hover:text-teal-400 transition-colors">Saved</Link></li>
              <li><Link to="/applications" className="hover:text-teal-400 transition-colors">Applications</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">For Students</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li><Link to="/profile-setup" className="hover:text-teal-400 transition-colors">Build your profile</Link></li>
              <li><Link to="/opportunities" className="hover:text-teal-400 transition-colors">Discover opportunities</Link></li>
              <li><Link to="/applications" className="hover:text-teal-400 transition-colors">Track applications</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">For Organizers</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li><Link to="/organizer" className="hover:text-teal-400 transition-colors">Become an organizer</Link></li>
              <li><Link to="/organizer" className="hover:text-teal-400 transition-colors">Publish opportunities</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-faint">
          <p>© {new Date().getFullYear()} Nexora Campus Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-ink-muted transition-colors">About</Link>
            <Link to="/" className="hover:text-ink-muted transition-colors">Contact</Link>
            <Link to="/" className="hover:text-ink-muted transition-colors">Privacy</Link>
            <Link to="/" className="hover:text-ink-muted transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-screen overflow-x-hidden bg-navy-950 text-ink font-body selection:bg-teal-400/30">
      <Header />
      <Hero />
      <ValueStrip />
      <Discovery />
      <AiMatching />
      <HowItWorks />
      <Differentiation />
      <UsersSection />
      <ProductProof />
      <FinalCta />
      <Footer />
    </main>
  );
}
