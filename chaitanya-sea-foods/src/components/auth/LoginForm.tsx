"use client";

import { useState } from "react";

import { loginAction } from "@/app/actions/auth";

export default function LoginForm() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");

    const result = await loginAction(formData);

    if (!result?.success && result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Chaitanya Sea Foods
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Syndicate Management System
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5 text-black">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-black">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-lg border text-amber-950 border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700 "
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}