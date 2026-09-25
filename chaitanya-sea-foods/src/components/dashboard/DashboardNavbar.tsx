"use client";

import { useState } from "react";
import type { Role } from "@/types/dashboard";

type Props = {
  userName: string;
  role: Role;
};

export default function DashboardNavbar({ userName, role }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigation = [
    ["#purchase", "Purchase"],
    ["#sell", "Sell"],
    ["#expense", "Expense"],
    ["#reports", "Reports"],
  ];

  function handleLogout() {
    window.location.href = "/api/auth/signout";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        {/* Brand */}
        <div className="min-w-0">
          <h1 className="truncate text-xs font-black tracking-wide text-amber-800 sm:text-sm lg:text-base">
            CHAITANYA SEA FOODS SYNDICATE
          </h1>

          <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
            Business Management System
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map(([href, label], index) => (
            <a
              key={href}
              href={href}
              className={
                index === 0
                  ? "rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 shadow-sm transition hover:bg-orange-100"
                  : "rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
              }
            >
              {label}
            </a>
          ))}

          {/* Profile */}
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setShowProfile((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-orange-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-orange-400 hover:bg-orange-50"
              aria-label="Open profile"
            >
              {/* User Icon */}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21a8 8 0 0 0-16 0"
                  />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>

              <span className="hidden text-left xl:block">
                <span className="block max-w-28 truncate text-xs font-bold text-slate-800">
                  {userName}
                </span>
                <span className="block text-[10px] font-semibold text-orange-600">
                  {role}
                </span>
              </span>

              <svg
                className={`hidden h-4 w-4 text-slate-400 transition-transform xl:block ${
                  showProfile ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-xl">
                <div className="border-b border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-200 text-orange-700">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 21a8 8 0 0 0-16 0"
                        />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {userName}
                      </p>

                      <p className="mt-0.5 text-xs font-bold text-orange-700">
                        {role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Account
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {userName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Role: {role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 17l5-5-5-5"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12H3"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 19V5a2 2 0 0 0-2-2h-6"
                      />
                    </svg>

                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setShowMenu((value) => !value)}
          className="rounded-xl border border-orange-200 bg-orange-50 p-2.5 text-orange-700 shadow-sm transition hover:bg-orange-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          {showMenu ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="border-t border-orange-100 bg-white px-4 py-4 shadow-lg lg:hidden">
          {/* Mobile User Profile */}
          <div className="mb-3 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200 text-orange-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21a8 8 0 0 0-16 0"
                  />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">
                  {userName}
                </p>

                <p className="mt-1 text-xs font-bold text-orange-700">
                  {role}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="grid gap-1">
            {navigation.map(([href, label], index) => (
              <a
                key={href}
                href={href}
                onClick={() => setShowMenu(false)}
                className={
                  index === 0
                    ? "rounded-xl bg-orange-50 px-3 py-3 text-sm font-bold text-orange-700"
                    : "rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                }
              >
                {label}
              </a>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-2 rounded-xl border border-red-100 px-3 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 17l5-5-5-5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 19V5a2 2 0 0 0-2-2h-6"
                />
              </svg>

              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}