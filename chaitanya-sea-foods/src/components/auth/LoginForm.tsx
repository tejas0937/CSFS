"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-orange-500 hover:shadow-orange-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:opacity-90"
    >
      {pending ? (
        <>
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />

          <span>Signing in...</span>
        </>
      ) : (
        <>
          <span>Sign In</span>

          <span>→</span>
        </>
      )}
    </button>
  );
}

export default function LoginForm() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");

    const result = await loginAction(formData);

    if (!result?.success && result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Glow */}
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-orange-200/30 blur-3xl" />

      <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_25px_70px_-20px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
            Authorized Personnel Login
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Welcome back
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to access the Chaitanya Sea Foods management
            system.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="Enter your username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-orange-50 hover:text-orange-600"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.58 10.58a2 2 0 102.83 2.83"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.88 4.24A9.77 9.77 0 0112 4c5 0 8.27 4.27 9.5 8a16.76 16.76 0 01-3.1 4.93"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.61 6.61C4.88 7.74 3.67 9.32 2.5 12c1.23 3.73 4.5 8 9.5 8 1.61 0 3.04-.4 4.31-1.05"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <SubmitButton />
        </form>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Authorized personnel only
        </div>
      </div>
    </div>
  );
}