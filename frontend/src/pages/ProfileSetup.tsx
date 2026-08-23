import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { StudentProfileCreate, StudentProfileOut } from "../types/profile";

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
  const [skillsInput, setSkillsInput] = useState("");
  const [interestsInput, setInterestsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: StudentProfileCreate = {
        ...form,
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        interests: interestsInput.split(",").map((s) => s.trim()).filter(Boolean),
      };
      await api.post<StudentProfileOut>("/users/me/profile", payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-10">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Set up your profile</h1>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <label className="block text-slate-300 text-sm mb-1">Full name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full mb-4 px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />

        <label className="block text-slate-300 text-sm mb-1">Branch</label>
        <input
          value={form.branch}
          onChange={(e) => setForm({ ...form, branch: e.target.value })}
          required
          placeholder="e.g. CSE"
          className="w-full mb-4 px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-slate-300 text-sm mb-1">Semester</label>
            <input
              type="number"
              min={1}
              max={8}
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
              required
              className="w-full px-3 py-2 rounded bg-slate-700 text-white outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-slate-300 text-sm mb-1">Year</label>
            <input
              type="number"
              min={1}
              max={4}
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              required
              className="w-full px-3 py-2 rounded bg-slate-700 text-white outline-none"
            />
          </div>
        </div>

        <label className="block text-slate-300 text-sm mb-1">Preferred mode</label>
        <input
          value={form.preferred_mode ?? ""}
          onChange={(e) => setForm({ ...form, preferred_mode: e.target.value })}
          placeholder="e.g. Online, Campus"
          className="w-full mb-4 px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />

        <label className="block text-slate-300 text-sm mb-1">Skills (comma-separated)</label>
        <input
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          placeholder="Python, SQL, React"
          className="w-full mb-4 px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />

        <label className="block text-slate-300 text-sm mb-1">Interests (comma-separated)</label>
        <input
          value={interestsInput}
          onChange={(e) => setInterestsInput(e.target.value)}
          placeholder="AI, Hackathons"
          className="w-full mb-6 px-3 py-2 rounded bg-slate-700 text-white outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}