import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import { TagInput } from "../components/TagInput";
import type { StudentProfileCreate, StudentProfileOut } from "../types/profile";

const BRANCHES = ["CSE", "ECE", "EE", "ME", "CE", "CHE", "COE", "CSBS", "IT", "Other"];
const MODES = ["ONLINE", "OFFLINE", "HYBRID"];

export function ProfileSetup() {
  const [form, setForm] = useState<StudentProfileCreate>({
    name: "",
    branch: "",
    semester: 1,
    year: 1,
    preferred_mode: "",
    preferred_location: "",
    skills: [],
    interests: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Check if profile already exists (edit mode)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = await api.get<StudentProfileOut>("/users/me/profile");
        if (!cancelled && existing) {
          setForm({
            name: existing.name,
            branch: existing.branch,
            semester: existing.semester,
            year: existing.year,
            preferred_mode: existing.preferred_mode ?? "",
            preferred_location: existing.preferred_location ?? "",
            skills: existing.skills,
            interests: existing.interests,
          });
          setIsEditing(true);
        }
      } catch {
        // No profile exists — creation mode
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isEditing) {
        await api.put<StudentProfileOut>("/users/me/profile", form);
      } else {
        await api.post<StudentProfileOut>("/users/me/profile", form);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="h-8 w-48 rounded skeleton-shimmer mb-4" />
          <div className="h-4 w-64 rounded skeleton-shimmer" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">
            {isEditing ? "Edit profile" : "Profile setup"}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
            {isEditing ? "Update your profile" : "Set up your profile"}
          </h1>
          <p className="mt-3 leading-7 text-ink-muted">
            Tell Nexora about your branch, semester, skills, and interests so we can find opportunities that fit you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-navy-700 bg-navy-800 p-6 sm:p-8"
        >
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-lg border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm text-amber-300"
            >
              {error}
            </p>
          )}

          {/* Full name */}
          <label className="block text-sm text-ink-muted mb-1.5" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full mb-5 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-ink outline-none transition-colors focus:border-teal-400"
          />

          {/* Branch */}
          <label className="block text-sm text-ink-muted mb-1.5" htmlFor="branch">
            Branch
          </label>
          <select
            id="branch"
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            required
            className="w-full mb-5 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-ink outline-none transition-colors focus:border-teal-400"
          >
            <option value="">Select branch</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Semester + Year */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-ink-muted mb-1.5" htmlFor="semester">
                Semester
              </label>
              <input
                id="semester"
                type="number"
                min={1}
                max={8}
                value={form.semester}
                onChange={(e) =>
                  setForm({ ...form, semester: Number(e.target.value) })
                }
                required
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-ink outline-none transition-colors focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-muted mb-1.5" htmlFor="year">
                Year
              </label>
              <input
                id="year"
                type="number"
                min={1}
                max={4}
                value={form.year}
                onChange={(e) =>
                  setForm({ ...form, year: Number(e.target.value) })
                }
                required
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-ink outline-none transition-colors focus:border-teal-400"
              />
            </div>
          </div>

          {/* Preferred mode */}
          <label className="block text-sm text-ink-muted mb-1.5" htmlFor="preferred_mode">
            Preferred mode
          </label>
          <select
            id="preferred_mode"
            value={form.preferred_mode ?? ""}
            onChange={(e) =>
              setForm({ ...form, preferred_mode: e.target.value || null })
            }
            className="w-full mb-5 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-ink outline-none transition-colors focus:border-teal-400"
          >
            <option value="">No preference</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0) + m.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          {/* Skills */}
          <label className="block text-sm text-ink-muted mb-1.5">
            Skills
          </label>
          <div className="mb-5">
            <TagInput
              tags={form.skills}
              onChange={(skills) => setForm({ ...form, skills })}
              placeholder="Type a skill and press Enter (e.g. Python)"
              accent="teal"
            />
          </div>

          {/* Interests */}
          <label className="block text-sm text-ink-muted mb-1.5">
            Interests
          </label>
          <div className="mb-6">
            <TagInput
              tags={form.interests}
              onChange={(interests) => setForm({ ...form, interests })}
              placeholder="Type an interest and press Enter (e.g. AI)"
              accent="amber"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-400 py-2.5 font-semibold text-navy-950 transition-colors hover:bg-teal-300 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
          >
            {loading
              ? "Saving..."
              : isEditing
                ? "Update profile"
                : "Save profile"}
          </button>
        </form>
      </main>
    </AppShell>
  );
}