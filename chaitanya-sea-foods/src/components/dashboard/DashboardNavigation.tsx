"use client";

import type { Role } from "@/types/dashboard";

type Props = {
  role: Role;
  isNavigatingToUsers: boolean;
  onManageUsers: () => void;
};

export default function DashboardNavigation({
  role,
  isNavigatingToUsers,
  onManageUsers,
}: Props) {
  return (
    <>
      {/* SELL */}

      <section
        id="sell"
        className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            →
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">
              Sales
            </p>

            <h2 className="text-base font-black text-slate-900">
              Sales Management
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Sales management will be connected here.
        </p>
      </section>

      {/* EXPENSE */}

      <section
        id="expense"
        className="mt-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            ₹
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">
              Finance
            </p>

            <h2 className="text-base font-black text-slate-900">
              Expense Management
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Regular expenses and transport expenses
          will be connected here.
        </p>
      </section>

      {/* REPORTS */}

      <section
        id="reports"
        className="mt-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            ↗
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">
              Analytics
            </p>

            <h2 className="text-base font-black text-slate-900">
              Business Reports
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Purchase sales expense and supply chain
          reports will appear here.
        </p>
      </section>

      {/* MANAGE USERS */}

      {role === "ADMIN" && (
        <section className="mt-4">
          <button
            type="button"
            onClick={onManageUsers}
            disabled={isNavigatingToUsers}
            className="group flex w-full items-center justify-between rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md disabled:cursor-wait disabled:opacity-80"
          >
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
                Administration
              </p>

              <p className="mt-1 text-sm font-black text-orange-800">
                Manage Users
              </p>

              <p className="mt-0.5 text-[10px] text-orange-600">
                Manage employee portal access
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md">
              {isNavigatingToUsers ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="stroke-white/30"
                    strokeWidth="3"
                  />

                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    className="stroke-white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <span className="text-lg font-black transition group-hover:translate-x-1">
                  →
                </span>
              )}
            </div>
          </button>
        </section>
      )}
    </>
  );
}