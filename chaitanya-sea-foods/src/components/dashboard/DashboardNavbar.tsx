"use client";

import { useState } from "react";
import type { Role } from "@/types/dashboard";

type Props = { userName: string; role: Role };

export default function DashboardNavbar({ userName, role }: Props) {
  const [showMenu, setShowMenu] = useState(false);
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
        <div className="min-w-0">
          <h1 className="truncate text-xs font-black tracking-wide text-amber-800 sm:text-sm lg:text-base">
            CHAITANYA SEA FOODS SYNDICATE
          </h1>
          <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
            Business Management System
          </p>
        </div>

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
          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50"
          >
            Logout
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setShowMenu((value) => !value)}
          className="rounded-xl border border-orange-200 bg-orange-50 p-2.5 text-orange-700 shadow-sm transition hover:bg-orange-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          {showMenu ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {showMenu && (
        <div className="border-t border-orange-100 bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="mb-3 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-3">
            <p className="text-sm font-black text-slate-900">{userName}</p>
            <p className="mt-1 text-xs font-bold text-orange-700">{role}</p>
          </div>
          <nav className="grid gap-1">
            {navigation.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setShowMenu(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700">
                {label}
              </a>
            ))}
            <button type="button" onClick={handleLogout} className="mt-2 w-full rounded-xl border border-orange-200 px-3 py-3 text-left text-sm font-bold text-orange-700 hover:bg-orange-50">
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
