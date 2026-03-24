// src/app/(auth)/signup/page.tsx
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-4xl">🍄</span>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mt-2 bg-gradient-to-r from-fungi-primary to-fungi-secondary bg-clip-text text-transparent">
              Flash Fungi
            </h1>
          </Link>
          <p className="text-fungi-text-muted text-sm mt-2">
            Create your account and start learning.
          </p>
        </div>

        {/* Form */}
        <AuthForm mode="signup" />

        {/* Footer */}
        <p className="text-center text-sm text-fungi-text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-fungi-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
