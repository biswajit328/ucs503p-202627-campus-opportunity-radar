import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/useAuth";
import type { StudentProfileOut } from "../types/profile";
import type { UserOut } from "../types/auth";
import { Link } from "react-router-dom";

export function Dashboard() {
  const { logout } = useAuth();
  const [user, setUser] = useState<UserOut | null>(null);
  const [profile, setProfile] = useState<StudentProfileOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<UserOut>("/users/me").then(setUser).catch(() => setError("Could not load user"));
    api
      .get<StudentProfileOut>("/users/me/profile")
      .then(setProfile)
      .catch(() => setError("No profile found"));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to Nexora 🎯</h1>
	<Link to="/opportunities" className="text-blue-400 hover:text-blue-300 text-sm mr-4">
  Browse Opportunities
</Link>
        <button onClick={logout} className="text-slate-400 hover:text-white text-sm">
          Log out
        </button>
      </div>

      {user && <p className="text-slate-300 mb-4">Logged in as {user.email}</p>}

      {profile ? (
        <div className="bg-slate-800 p-6 rounded-lg max-w-md">
          <p>
            <span className="text-slate-400">Name:</span> {profile.name}
          </p>
          <p>
            <span className="text-slate-400">Branch:</span> {profile.branch}
          </p>
          <p>
            <span className="text-slate-400">Semester:</span> {profile.semester}
          </p>
          <p>
            <span className="text-slate-400">Skills:</span> {profile.skills.join(", ") || "—"}
          </p>
          <p>
            <span className="text-slate-400">Interests:</span> {profile.interests.join(", ") || "—"}
          </p>
        </div>
      ) : (
        <p className="text-slate-400">{error === "No profile found" ? "No profile yet." : error}</p>
      )}
    </div>
  );
}