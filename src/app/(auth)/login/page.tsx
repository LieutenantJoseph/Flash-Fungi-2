// src/app/(auth)/login/page.tsx
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Log In",
};

export default function LoginPage() {
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
            Welcome back — let&apos;s keep learning.
          </p>
        </div>

        {/* Form */}
        <AuthForm mode="login" />

        {/* Footer */}
        <p className="text-center text-sm text-fungi-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-fungi-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
