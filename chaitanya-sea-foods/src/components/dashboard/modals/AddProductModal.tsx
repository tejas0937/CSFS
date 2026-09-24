"use client";

import { GRADE_OPTIONS } from "@/types/dashboard";

type Props = {
  isOpen: boolean;
  vendorName?: string;
  productName: string;
  productGrade: string;
  countPerKg: string;
  error: string;
  isSubmitting: boolean;
  grades: readonly string[];
  onProductNameChange: (value: string) => void;
  onProductGradeChange: (value: string) => void;
  onCountPerKgChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function AddProductModal({
  isOpen, vendorName, productName, productGrade, countPerKg, error, isSubmitting, grades,
  onProductNameChange, onProductGradeChange, onCountPerKgChange, onClose, onSubmit,
}: Props) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-5 text-white">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-50">
                Add Product
              </p>
              <h2 className="mt-1 text-xl font-black">
                New Product
              </h2>
              <p className="mt-1 text-xs text-orange-50">
                Vendor {vendorName ?? ""}
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Product Name
                </label>
                <input
                  autoFocus
                  value={productName}
                  onChange={(event) =>
                    onProductNameChange(event.target.value)
                  }
                  placeholder="Example Prawns"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Grade
                  </label>
                  <select
                    value={productGrade}
                    onChange={(event) =>
                      onProductGradeChange(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    {grades.map((grade) => (
    <option key={grade} value={grade}>
      {grade}
    </option>
  ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Count / kg
                  </label>
                  <input
                    value={countPerKg}
                    onChange={(event) =>
                      onCountPerKgChange(event.target.value)
                    }
                    placeholder="Example 40"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onSubmit}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </>

  );
}