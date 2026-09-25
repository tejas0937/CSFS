"use client";

import {

  GRADE_OPTIONS,

  type Product,

  type Role,

  type Tub,

  type Vendor,

} from "@/types/dashboard";

type Props = {

  purchaseDate: string;

  onPurchaseDateChange: (date: string) => void;

  canCreate: boolean;

  canEditProducts: boolean;

  canOverrideNetWeight: boolean;

  role: Role;

  vendors: Vendor[];

  selectedVendorId: string;

  selectedProductId: string;

  selectedVendor?: Vendor;

  onAddProduct: () => void;

  selectedProduct?: Product;

  isLoadingVendors: boolean;

  completedVendors: string[];

  purchaseCompleted: boolean;

  selectedVendorCompleted: boolean;

  workspaceFrozen: boolean;

  currentTubs: Tub[];

  totalWeight: number;

  netWeight: number;

  nextTubNumber: number;

  manualNetWeight: boolean;

  netWeightOverride: string;

  tubWeight: string;

  purchaseMessage: string;

  productMessage: string;

  isSavingPurchase: boolean;

  isSavingProduct: boolean;

  setTubWeight: (value: string) => void;

  setNetWeightOverride: (value: string) => void;

  setNewVendorError: (value: string) => void;

  setShowAddVendorModal: (value: boolean) => void;

  setNewProductError: (value: string) => void;

  setShowAddProductModal: (value: boolean) => void;

  selectVendor: (vendorId: string) => void;

  cancelVendor: (vendorId: string) => void;

  selectProduct: (productId: string) => void;

  cancelProduct: (productId: string) => void;

  updateProductName: (value: string) => void;

  updateGrade: (value: string) => void;

  updateCountPerKg: (value: string) => void;

  addTub: () => void;

  removeTub: (tubId: string) => void;

  applyNetWeightOverride: () => void;

  resetNetWeight: () => void;

  saveCurrentProduct: () => void;

  completeVendor: () => void;

  completePurchase: () => void;

  createNewPurchase: () => void;

};

export default function PurchaseSection({

  purchaseDate, onPurchaseDateChange, canCreate, onAddProduct, canEditProducts, canOverrideNetWeight, role, vendors, selectedVendorId, selectedProductId, selectedVendor, selectedProduct,

  isLoadingVendors, completedVendors, purchaseCompleted, selectedVendorCompleted, workspaceFrozen, currentTubs, totalWeight, netWeight, nextTubNumber, manualNetWeight, netWeightOverride, tubWeight, purchaseMessage, productMessage, isSavingPurchase, isSavingProduct,

  setTubWeight, setNetWeightOverride, setNewVendorError, setShowAddVendorModal, setNewProductError, setShowAddProductModal, selectVendor, cancelVendor, selectProduct, cancelProduct, updateProductName, updateGrade, updateCountPerKg, addTub, removeTub, applyNetWeightOverride, resetNetWeight, saveCurrentProduct, completeVendor, completePurchase, createNewPurchase,

}: Props) {

  return (

    <>

          <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_12px_40px_rgba(120,53,15,0.08)]">

            <div className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-4 py-4 text-white">

              <div className="absolute right-[-30px] top-[-50px] h-32 w-32 rounded-full bg-white/10" />

              <div className="absolute bottom-[-50px] right-[20%] h-24 w-24 rounded-full bg-white/10" />

              <div className="relative flex items-center justify-between gap-3">

                <div>

                  <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">

                    <span className="h-1.5 w-1.5 rounded-full bg-white" />

                    Current Purchase

                  </div>

                  <h2 className="text-xl font-black tracking-tight">

                    Today&apos;s Purchase

                  </h2>

                </div>

                <label
  className="cursor-pointer rounded-2xl border border-white/20 bg-white/15 px-3 py-2 text-right backdrop-blur-sm transition hover:bg-white/20"
  title="Click to change purchase date"
>
  <p className="text-[9px] font-semibold uppercase tracking-wider text-orange-50">
    Date
  </p>
  <div className="relative flex items-center justify-end gap-1.5">
    <p className="text-xs font-black text-white">{purchaseDate}</p>
    <svg
      className="h-3.5 w-3.5 text-white/90"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
      />
    </svg>
    <input
      type="date"
      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      value={(() => {
        const parsed = new Date(purchaseDate);

        if (Number.isNaN(parsed.getTime())) {
          return "";
        }

        return `${parsed.getFullYear()}-${String(
          parsed.getMonth() + 1,
        ).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
      })()}
      onChange={(event) => {
        const value = event.target.value;

        if (!value) {
          return;
        }

        const [year, month, day] = value.split("-");

        const formattedDate = new Intl.DateTimeFormat("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(
          new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
          ),
        );

        onPurchaseDateChange(formattedDate);
      }}
    />
  </div>
</label>

              </div>

            </div>

            <div className="space-y-4 p-3 sm:p-5">

              {/* CURRENT VENDOR */}

              <section>

                <div className="mb-2 flex items-center justify-between">

                  <div>

                    <p className="text-sm font-black text-slate-800">

                      Current Vendor

                    </p>

                  </div>

                  {canCreate &&

                    !purchaseCompleted && (

                      <button

                        type="button"

                        onClick={() => {

                          setNewVendorError("");

                          setShowAddVendorModal(true);

                        }}

                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-xl font-bold text-orange-600 shadow-sm transition hover:scale-105 hover:bg-orange-100"

                      >

                        +

                      </button>

                    )}

                </div>

                {isLoadingVendors ? (

                  <div className="flex min-h-[58px] items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-inner">

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />

                      Loading vendors...

                    </div>

                  </div>

                ) : (

                  <div className="flex overflow-x-auto rounded-2xl border border-sky-200 bg-sky-50 p-1 shadow-inner">

                  {vendors.map(

                    (vendor) => {

                      const active =

                        vendor.id ===

                        selectedVendorId;

                      const completed =

                        completedVendors.includes(

                          vendor.id,

                        );

                      return (

                        <div

                          key={vendor.id}

                          className={`mr-1 flex min-w-[74px] shrink-0 items-center overflow-hidden rounded-xl transition ${

                            active

                              ? "bg-white shadow-md ring-2 ring-orange-300"

                              : "hover:bg-white/70"

                          }`}

                        >

                          <button

                            type="button"

                            disabled={

                              purchaseCompleted

                            }

                            onClick={() =>

                              selectVendor(

                                vendor.id,

                              )

                            }

                            className={`flex-1 px-4 py-3 text-xs font-black ${

                              active

                                ? "text-orange-700"

                                : "text-slate-600"

                            }`}

                          >

                            {vendor.name}

                            {completed && (

                              <span className="ml-1 text-green-600">

                                ✓

                              </span>

                            )}

                          </button>

                          {!completed &&

                            !purchaseCompleted && (

                              <button

                                type="button"

                                onClick={() =>

                                  cancelVendor(

                                    vendor.id,

                                  )

                                }

                                className="px-2 text-sm font-black text-slate-300 transition hover:text-red-500"

                              >

                                ×

                              </button>

                            )}

                        </div>

                      );

                    },

                  )}

                  {canCreate &&

                    !purchaseCompleted && (

                      <button

                        type="button"

                        onClick={() => {

                          setNewVendorError("");

                          setShowAddVendorModal(true);

                        }}

                        className="flex min-w-[68px] shrink-0 items-center justify-center rounded-xl text-3xl font-light text-slate-500 transition hover:bg-white hover:text-orange-500"

                      >

                        +

                      </button>

                    )}

                  </div>

                )}

              </section>

              {/* PRODUCT LIST */}

              {isLoadingVendors ? (

                <section className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4">

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">

                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500" />

                    Loading products...

                  </div>

                </section>

              ) : selectedVendor ? (

                <section>

                  <div className="mb-2">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-black text-slate-800">

                        Product List

                      </p>

                      <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-600">

                        Vendor{" "}

                        {selectedVendor.name}

                      </span>

                    </div>

                  </div>

                  <div className="flex overflow-x-auto rounded-2xl border border-pink-200 bg-pink-50 p-1 shadow-inner">

                    {selectedVendor.products.map(

                      (product) => {

                        const active =

                          product.id ===

                          selectedProductId;

                        return (

                          <div

                            key={product.id}

                            className={`mr-1 flex min-w-[105px] shrink-0 items-center overflow-hidden rounded-xl transition ${

                              active

                                ? "bg-white shadow-md ring-2 ring-pink-300"

                                : "hover:bg-white/70"

                            }`}

                          >

                            <button

                              type="button"

                              disabled={purchaseCompleted}
                              onClick={() => selectProduct(product.id)}

                              className={`flex-1 px-4 py-3 text-xs font-black ${

                                active

                                  ? "text-pink-700"

                                  : "text-slate-600"

                              }`}

                            >

                              {product.name}

                            </button>

                            {!workspaceFrozen && role === "ADMIN" && (

                              <button

                                type="button"

                                onClick={() =>

                                  cancelProduct(

                                    product.id,

                                  )

                                }

                                className="px-2 text-sm font-black text-slate-300 hover:text-red-500"

                              >

                                ×

                              </button>

                            )}

                          </div>

                        );

                      },

                    )}

                    {canCreate &&

                      !workspaceFrozen && (

                        <button

                          type="button"

                          onClick={onAddProduct}

                          className="flex min-w-[68px] shrink-0 items-center justify-center rounded-xl text-3xl font-light text-slate-500 hover:bg-white hover:text-orange-500"

                        >

                          +

                        </button>

                      )}

                  </div>

                </section>

              ) : null}

              {!isLoadingVendors && vendors.length === 0 && (

                <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">

                  <p className="text-xs font-black text-slate-600">

                    No active vendors found.

                  </p>

                  {canCreate && (

                    <button

                      type="button"

                      onClick={() => {

                        setNewVendorError("");

                        setShowAddVendorModal(true);

                      }}

                      className="mt-3 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-orange-600"

                    >

                      Add First Vendor

                    </button>

                  )}

                </section>

              )}

              {/* ACTIVE PRODUCT */}

              {selectedProduct && (

                <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/60 p-4 shadow-sm">

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <p className="text-sm font-black text-slate-900">

                        Active Product

                      </p>

                    </div>

                    {selectedVendorCompleted && (

                      <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700">

                        Completed

                      </span>

                    )}

                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">

                        Product Name

                      </label>

                      <input

                        value={

                          selectedProduct.name

                        }

                        disabled={

                          workspaceFrozen || !canEditProducts

                        }

                        onChange={(event) =>

                          updateProductName(

                            event.target.value,

                          )

                        }

                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"

                      />

                    </div>

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">

                        Grade

                      </label>

                      <select

                        value={

                          selectedProduct.grade

                        }

                        disabled={

                          workspaceFrozen || !canEditProducts

                        }

                        onChange={(event) =>

                          updateGrade(

                            event.target.value,

                          )

                        }

                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold shadow-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"

                      >

                        {GRADE_OPTIONS.map(

                          (grade) => (

                            <option

                              key={grade}

                              value={grade}

                            >

                              {grade}

                            </option>

                          ),

                        )}

                      </select>

                    </div>

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">

                        Count / kg

                      </label>

                      <input

                        value={

                          selectedProduct.countPerKg

                        }

                        disabled={

                          workspaceFrozen || !canEditProducts

                        }

                        onChange={(event) =>

                          updateCountPerKg(

                            event.target.value,

                          )

                        }

                        placeholder="Example 40"

                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold shadow-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"

                      />

                    </div>

                  </div>

                </section>

              )}

              {/* TUB MANAGEMENT */}

              {selectedProduct && (

                <section>

                  <div className="mb-3 flex items-center justify-between">

                    <div>

                      <p className="text-sm font-black text-slate-900">

                        Tub Management

                      </p>

                    </div>

                    <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">

                      <span className="text-[10px] font-black text-orange-700">

                        {currentTubs.length} Tubs

                      </span>

                    </div>

                  </div>

                  <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">

                    {/* LEFT CONTROL PANEL */}

                    <div className="space-y-3">

                      <div className="rounded-3xl border-2 border-yellow-300 bg-gradient-to-b from-yellow-50 to-amber-50 p-3 shadow-[0_8px_25px_rgba(234,179,8,0.12)]">

                        <div className="mb-3">

                          <div className="mb-1.5 flex items-center justify-between">

                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">

                              Tub Number

                            </label>

                          </div>

                          <div className="flex h-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-sm font-black text-slate-700 shadow-inner">

                            TN{" "}

                            {nextTubNumber}

                          </div>

                        </div>

                        <div>

                          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-600">

                            Tub Weight

                          </label>

                          <div className="relative">

                            <input

                              value={tubWeight}

                              disabled={

                                workspaceFrozen

                              }

                              onChange={(

                                event,

                              ) =>

                                setTubWeight(

                                  event.target

                                    .value,

                                )

                              }

                              type="number"

                              min="0"

                              step="0.01"

                              placeholder="0.00"

                              className="h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 pr-8 text-center text-sm font-black outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"

                            />

                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">

                              kg

                            </span>

                          </div>

                        </div>

                        <button

                          type="button"

                          disabled={

                            workspaceFrozen

                          }

                          onClick={addTub}

                          className="mt-3 w-full rounded-xl bg-red-500 px-3 py-2.5 text-xs font-black text-white shadow-md shadow-red-200 transition hover:bg-red-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"

                        >

                          Add Tub

                        </button>

                      </div>

                      {/* WEIGHT SUMMARY */}

                      <div className="rounded-3xl border-2 border-purple-300 bg-gradient-to-b from-purple-50 to-fuchsia-50 p-3 shadow-[0_8px_25px_rgba(168,85,247,0.10)]">

                        <div className="mb-3">

                          <p className="text-[9px] font-black uppercase tracking-wider text-purple-500">

                            Total Weight

                          </p>

                          <p className="mt-1 text-lg font-black text-purple-700">

                            {totalWeight.toFixed(

                              2,

                            )}

                            <span className="ml-1 text-[10px]">

                              kg

                            </span>

                          </p>

                        </div>

                        <div className="border-t border-purple-200 pt-3">

                          <p className="text-[9px] font-black uppercase tracking-wider text-purple-500">

                            Net Weight

                          </p>

                          <p className="mt-1 text-lg font-black text-purple-700">

                            {netWeight.toFixed(

                              2,

                            )}

                            <span className="ml-1 text-[10px]">

                              kg

                            </span>

                          </p>

                        </div>

                      </div>

                    </div>

{/* RIGHT TUB GRID */}

<div className="min-w-0">

  <div className="mb-2 flex items-center justify-between">

    <div>

      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">

        Tub Records

      </p>

      <p className="text-[10px] font-bold text-slate-600">

        {selectedVendor?.name} → {selectedProduct.name}

      </p>

    </div>

    <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-500">

      {currentTubs.length} Tubs

    </span>

  </div>

  <div className="overflow-hidden rounded-2xl border-2 border-slate-800 bg-yellow-50 shadow-sm">

    {/* HEADER */}

    <div className="grid grid-cols-3 border-b-2 border-slate-800 bg-slate-900 text-white">

      <div className="border-r border-slate-700 px-1 py-1.5 text-center text-[7px] font-black uppercase">

        Tub

      </div>

      <div className="border-r border-slate-700 px-1 py-1.5 text-center text-[7px] font-black uppercase">

        Weight

      </div>

      <div className="px-1 py-1.5 text-center text-[7px] font-black uppercase">

        Action

      </div>

    </div>

    {/* SCROLL AREA */}

    <div className="max-h-[300px] overflow-y-auto">

      {currentTubs.length > 0 ? (

        <div className="grid grid-cols-3 gap-1 bg-yellow-50 p-1">

          {currentTubs.map((tub) => (

            <div

              key={tub.id}

              className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"

            >

              {/* NUMBER */}

              <div className="border-b border-slate-200 bg-yellow-100 px-1 py-1 text-center">

                <p className="text-[6px] font-bold uppercase text-slate-400">

                  Tub

                </p>

                <p className="text-[11px] font-black leading-tight text-slate-800">

                  TN {tub.number}

                </p>

              </div>

              {/* WEIGHT */}

              <div className="border-b border-slate-200 bg-yellow-50 px-1 py-1 text-center">

                <p className="text-[6px] font-bold uppercase text-slate-400">

                  Weight

                </p>

                <p className="text-[9px] font-black leading-tight text-slate-700">

                  {tub.weight.toFixed(2)} kg

                </p>

              </div>

              {/* REMOVE */}

              <div className="bg-white px-1 py-1 text-center">

                {!workspaceFrozen ? (

                  <button

                    type="button"

                    onClick={() => removeTub(tub.id)}

                    className="w-full rounded-md px-1 py-0.5 text-[7px] font-black text-red-500 transition hover:bg-red-50 hover:text-red-700"

                  >

                    Remove

                  </button>

                ) : (

                  <span className="text-[7px] font-bold text-slate-400">

                    Locked

                  </span>

                )}

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="flex min-h-[150px] items-center justify-center bg-yellow-50 p-4 text-center">

          <div>

            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200 text-sm">

              +

            </div>

            <p className="text-[10px] font-black text-slate-600">

              No tubs added

            </p>

            <p className="mt-1 text-[8px] text-slate-400">

              Add the first tub from the left panel

            </p>

          </div>

        </div>

      )}

    </div>

  </div>

</div>

                  </div>

                </section>

              )}

              {/* ADMIN NET WEIGHT */}

              {canOverrideNetWeight &&

                selectedProduct && (

                  <section className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

                      <div className="flex-1">

                        <div className="mb-1 flex items-center gap-2">

                          <label className="text-[10px] font-black uppercase tracking-wider text-orange-700">

                            Update Net Weight

                          </label>

                        </div>

                        <input

                          value={

                            netWeightOverride

                          }

                          disabled={

                            workspaceFrozen

                          }

                          onChange={(

                            event,

                          ) =>

                            setNetWeightOverride(

                              event.target

                                .value,

                            )

                          }

                          type="number"

                          min="0"

                          step="0.01"

                          placeholder="Enter net weight"

                          className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"

                        />

                      </div>

                      <div className="flex gap-2">

                        <button

                          type="button"

                          disabled={

                            workspaceFrozen

                          }

                          onClick={

                            applyNetWeightOverride

                          }

                          className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-orange-600 disabled:opacity-40"

                        >

                          Update

                        </button>

                        {manualNetWeight && (

                          <button

                            type="button"

                            disabled={

                              workspaceFrozen

                            }

                            onClick={

                              resetNetWeight

                            }

                            className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-xs font-black text-orange-700 hover:bg-orange-50"

                          >

                            Reset

                          </button>

                        )}

                      </div>

                    </div>

                    {manualNetWeight && (

                      <div className="mt-3 rounded-xl bg-orange-100 px-3 py-2">

                        <p className="text-[10px] font-bold text-orange-700">

                          Manual override active. Every

                          newly added tub contributes

                          95% of its gross weight to

                          the overridden baseline.

                        </p>

                      </div>

                    )}

                  </section>

                )}

              {/* SAVE */}

              {selectedProduct && canEditProducts && (

                <button

                  type="button"

                  disabled={

                    workspaceFrozen || isSavingProduct

                  }

                  onClick={

                    saveCurrentProduct

                  }

                  className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"

                >

                  {isSavingProduct ? "Saving Product..." : "Save Product Details"}

                </button>

              )}

              {productMessage && (

                <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">

                  {productMessage}

                </div>

              )}

              {/* COMPLETE VENDOR */}

              {selectedVendor && (

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">

                        Vendor Status

                      </p>

                      <p className="mt-1 text-sm font-black text-slate-800">

                        Vendor{" "}

                        {selectedVendor.name}

                      </p>

                    </div>

                    {selectedVendorCompleted ? (

                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">

                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">

                          ✓

                        </span>

                        Completed

                      </span>

                    ) : (

                      <button

                        type="button"

                        disabled={

                          purchaseCompleted ||

                          isSavingPurchase

                        }

                        onClick={

                          completeVendor

                        }

                        className="rounded-xl bg-red-500 px-5 py-3 text-xs font-black text-white shadow-md shadow-red-100 transition hover:bg-red-600 disabled:opacity-40"

                      >

                        Complete Vendor

                      </button>

                    )}

                  </div>

                </section>

              )}

            </div>

          </section>

          {/* COMPLETE PURCHASE */}

          <section className="mt-4 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">

            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h3 className="mt-1 text-lg font-black text-slate-900">

                  {purchaseCompleted

                    ? "Purchase Completed"

                    : "Complete Today's Purchase"}

                </h3>

                <p className="mt-1 text-xs text-slate-500">

                  Complete the purchase after all

                  vendor entries are finished.

                </p>

              </div>

              {purchaseCompleted ? (

                <div className="flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">

                      ✓

                    </span>

                    Completed

                  </span>

                  <button

                    type="button"

                    onClick={

                      createNewPurchase

                    }

                    className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-orange-600"

                  >

                    Create New Purchase

                  </button>

                </div>

              ) : (

                <button

                  type="button"

                  onClick={

                    completePurchase

                  }

                  disabled={isSavingPurchase}

                  className="rounded-xl bg-red-500 px-6 py-3 text-xs font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-600"

                >

                  Complete Purchase

                </button>

              )}

            </div>

          </section>

    </>

  );

}
