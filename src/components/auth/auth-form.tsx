// src/components/auth/auth-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/callback`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setMessage("Check your email for a confirmation link.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-fungi-text-secondary mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-lg bg-fungi-bg-secondary border border-fungi-bg-tertiary text-fungi-text placeholder:text-fungi-text-muted focus:border-fungi-secondary focus:ring-1 focus:ring-fungi-secondary/50 outline-none transition-colors"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-fungi-text-secondary mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
          minLength={mode === "signup" ? 8 : undefined}
          className="w-full px-4 py-2.5 rounded-lg bg-fungi-bg-secondary border border-fungi-bg-tertiary text-fungi-text placeholder:text-fungi-text-muted focus:border-fungi-secondary focus:ring-1 focus:ring-fungi-secondary/50 outline-none transition-colors"
        />
      </div>

      {/* Error / Success messages */}
      {error && (
        <div className="p-3 rounded-lg bg-fungi-danger/10 border border-fungi-danger/30 text-sm text-red-400">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 rounded-lg bg-fungi-success/10 border border-fungi-success/30 text-sm text-green-400">
          {message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-fungi-primary to-fungi-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {mode === "signup" ? "Creating account..." : "Signing in..."}
          </span>
        ) : mode === "signup" ? (
          "Create Account"
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
