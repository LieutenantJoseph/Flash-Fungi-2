// admin/src/components/login-form.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const unauthorizedError = searchParams.get("error") === "unauthorized";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🍄</span>
          <h1 className="text-2xl font-bold mt-2 text-admin-text">
            Flash Fungi Admin
          </h1>
          <p className="text-admin-text-muted text-sm mt-1">
            Content management portal
          </p>
        </div>

        {unauthorizedError && (
          <div className="p-3 rounded-lg bg-admin-danger/10 border border-admin-danger/30 text-sm text-red-400 mb-4">
            Access denied. Your account does not have admin privileges.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-admin-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-admin-bg-secondary border border-admin-border text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/50 outline-none transition-colors"
              placeholder="admin@flashfungi.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-admin-text-secondary mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-admin-bg-secondary border border-admin-border text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/50 outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-admin-danger/10 border border-admin-danger/30 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-white bg-admin-accent hover:bg-admin-accent-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-admin-text-muted mt-6">
          Admin access requires the admin role in user_profiles.
        </p>
      </div>
    </div>
  );
}