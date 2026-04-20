"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupApi } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, token } = await signupApi({ name, email, password });
      setAuth(user, token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-low p-8 shadow-xl shadow-black/30">
        <h1 className="mb-2 text-2xl font-semibold text-on-surface">
          Create account
        </h1>
        <p className="mb-8 text-sm text-on-surface-muted">
          Get started with SyncSpace
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-on-surface placeholder:text-on-surface-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-on-surface placeholder:text-on-surface-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-on-surface placeholder:text-on-surface-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-primary px-4 py-3 font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
