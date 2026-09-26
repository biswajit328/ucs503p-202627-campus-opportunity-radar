import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { RadarBackdrop } from "../components/RadarBackdrop";
import { PasswordInput } from "../components/PasswordInput";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ email, password });
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-navy-950 flex items-center justify-center overflow-hidden px-4">
      <RadarBackdrop />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8">
          <p className="font-display text-sm tracking-wide text-teal-400 mb-2">Nexora</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Get on the radar</h1>
          <p className="text-ink-muted mt-2">Your profile decides what surfaces. Nothing generic.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-navy-800/80 backdrop-blur border border-navy-700 rounded-2xl p-6"
        >
          {error && (
            <p className="text-sm text-amber-400 mb-4 border-l-2 border-amber-400 pl-3">{error}</p>
          )}

          <label className="block text-sm text-ink-muted mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-3 py-2.5 rounded-lg bg-navy-900 border border-navy-700 text-ink outline-none focus:border-teal-400 transition-colors"
          />

          <label className="block text-sm text-ink-muted mb-1.5" htmlFor="password">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mb-1.5"
          />
          <p className="text-xs text-ink-muted mb-6">At least 8 characters.</p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-400 hover:bg-teal-300 text-navy-950 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-ink-muted text-sm mt-5 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-400 hover:text-teal-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}