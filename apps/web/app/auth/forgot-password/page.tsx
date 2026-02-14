"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeLogo } from "../../components";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to backend password reset endpoint when implemented
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-surface-secondary to-surface py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <ThemeLogo className="h-10 w-auto" />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-heading">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-body">
          Enter your email and we&apos;ll send you instructions to reset your
          password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-lg shadow-gray-200/50 rounded-2xl sm:px-10 border border-edge-subtle">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-heading mb-2">
                Check your email
              </h3>
              <p className="text-sm text-body mb-6">
                If an account exists for <strong>{email}</strong>, you&apos;ll
                receive password reset instructions shortly.
              </p>
              <Link
                href="/auth/login"
                className="text-sm font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-body"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-0 py-2.5 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] placeholder:text-caption focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                Send reset instructions
              </button>
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
