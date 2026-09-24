"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createVendor,
  deleteVendor,
  toggleVendorStatus,
  updateVendor,
} from "@/app/actions/vendors";

type ManagedBy = {
  id: string;
  name: string;
  role: string;
};

type Vendor = {
  id: string;
  name: string;
  shipName: string | null;
  phone: string;
  alternatePhone: string | null;
  location: string | null;
  address: string | null;
  notes: string | null;
  managedById: string | null;
  managedBy: ManagedBy | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type VendorManagementProps = {
  initialVendors: Vendor[];
  userRole: "ADMIN" | "MANAGER" | "VIEWER";
};

type VendorForm = {
  name: string;
  shipName: string;
  phone: string;
  alternatePhone: string;
  location: string;
  address: string;
  notes: string;
};

const emptyForm: VendorForm = {
  name: "",
  shipName: "",
  phone: "",
  alternatePhone: "",
  location: "",
  address: "",
  notes: "",
};

export default function VendorManagement({
  initialVendors,
  userRole,
}: VendorManagementProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const [form, setForm] = useState<VendorForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isPending, startTransition] = useTransition();
  const [loadingVendorId, setLoadingVendorId] = useState<string | null>(null);

  const canCreate = userRole === "ADMIN" || userRole === "MANAGER";
  const canEdit = userRole === "ADMIN";
  const canDelete = userRole === "ADMIN";

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesSearch =
        !query ||
        vendor.name.toLowerCase().includes(query) ||
        vendor.shipName?.toLowerCase().includes(query) ||
        vendor.phone.toLowerCase().includes(query) ||
        vendor.location?.toLowerCase().includes(query) ||
        vendor.managedBy?.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && vendor.isActive) ||
        (statusFilter === "INACTIVE" && !vendor.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  const activeCount = vendors.filter((vendor) => vendor.isActive).length;
  const inactiveCount = vendors.length - activeCount;

  function openAddModal() {
    setEditingVendor(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  }

  function openEditModal(vendor: Vendor) {
    setEditingVendor(vendor);

    setForm({
      name: vendor.name,
      shipName: vendor.shipName ?? "",
      phone: vendor.phone,
      alternatePhone: vendor.alternatePhone ?? "",
      location: vendor.location ?? "",
      address: vendor.address ?? "",
      notes: vendor.notes ?? "",
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isPending) return;

    setIsModalOpen(false);
    setEditingVendor(null);
    setForm(emptyForm);
    setError("");
  }

  function updateField(field: keyof VendorForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = editingVendor
        ? await updateVendor(editingVendor.id, form)
        : await createVendor(form);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.vendor) {
        if (editingVendor) {
          setVendors((previous) =>
            previous.map((vendor) =>
              vendor.id === result.vendor.id
                ? {
                    ...vendor,
                    ...result.vendor,
                  }
                : vendor,
            ),
          );

          setSuccess("Vendor updated successfully.");
        } else {
          setVendors((previous) => [
            result.vendor as Vendor,
            ...previous,
          ]);

          setSuccess("Vendor created successfully.");
        }
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setEditingVendor(null);
        setForm(emptyForm);
        setSuccess("");
      }, 700);
    });
  }

  function handleToggleStatus(vendor: Vendor) {
    setError("");
    setSuccess("");
    setLoadingVendorId(vendor.id);

    startTransition(async () => {
      const result = await toggleVendorStatus(vendor.id);

      if (!result.success) {
        setError(result.error);
        setLoadingVendorId(null);
        return;
      }

      if (result.vendor) {
        setVendors((previous) =>
          previous.map((item) =>
            item.id === result.vendor!.id
              ? {
                  ...item,
                  isActive: result.vendor!.isActive,
                }
              : item,
          ),
        );
      }

      setLoadingVendorId(null);
    });
  }

  function openDeleteModal(vendor: Vendor) {
    setVendorToDelete(vendor);
    setError("");
    setIsDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (isPending) return;

    setIsDeleteOpen(false);
    setVendorToDelete(null);
  }

  function handleDelete() {
    if (!vendorToDelete) return;

    setError("");

    startTransition(async () => {
      const result = await deleteVendor(vendorToDelete.id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setVendors((previous) =>
        previous.filter((vendor) => vendor.id !== vendorToDelete.id),
      );

      setIsDeleteOpen(false);
      setVendorToDelete(null);
      setSuccess("Vendor deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    });
  }

  function formatManagedBy(managedBy: ManagedBy | null) {
    if (!managedBy) {
      return "—";
    }

    const roleLabel =
      managedBy.role === "ADMIN"
        ? "Admin"
        : managedBy.role === "MANAGER"
          ? "Manager"
          : managedBy.role;

    return `${roleLabel} - ${managedBy.name}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl text-white shadow-lg shadow-cyan-500/20">
              V
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Vendor Management
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage seafood suppliers and vendor information
              </p>
            </div>
          </div>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
          >
            <span className="text-lg">+</span>
            Add Vendor
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Vendors"
          value={vendors.length}
          icon="◈"
        />

        <StatCard
          label="Active Vendors"
          value={activeCount}
          icon="✓"
        />

        <StatCard
          label="Inactive Vendors"
          value={inactiveCount}
          icon="○"
        />
      </div>

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Error */}
      {error && !isModalOpen && !isDeleteOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vendors, ships, phone, location or manager..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === filter
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vendor
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ship Name
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Location
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Managed By
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                {(canEdit || canDelete) && (
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit || canDelete ? 7 : 6}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400 dark:bg-slate-800">
                        ◈
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        No vendors found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {search || statusFilter !== "ALL"
                          ? "Try changing your search or filter."
                          : "Add your first vendor to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0 dark:border-slate-800 dark:hover:bg-slate-800/30"
                  >
                    {/* Vendor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 font-bold text-cyan-600 dark:text-cyan-400">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {vendor.name}
                          </p>

                          {vendor.address && (
                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                              {vendor.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Ship Name */}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {vendor.shipName || "—"}
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {vendor.phone}
                      </p>

                      {vendor.alternatePhone && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {vendor.alternatePhone}
                        </p>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {vendor.location || "—"}
                    </td>

                    {/* Managed By */}
                    <td className="px-6 py-4">
                      {vendor.managedBy ? (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {vendor.managedBy.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {vendor.managedBy.role === "ADMIN"
                              ? "Admin"
                              : vendor.managedBy.role === "MANAGER"
                                ? "Manager"
                                : vendor.managedBy.role}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          vendor.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            vendor.isActive
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />

                        {vendor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(vendor)}
                                disabled={isPending}
                                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleStatus(vendor)
                                }
                                disabled={
                                  isPending ||
                                  loadingVendorId === vendor.id
                                }
                                className="rounded-lg px-3 py-2 text-xs font-semibold text-cyan-600 transition hover:bg-cyan-50 disabled:opacity-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30"
                              >
                                {loadingVendorId === vendor.id ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <Spinner />
                                    Updating
                                  </span>
                                ) : vendor.isActive ? (
                                  "Deactivate"
                                ) : (
                                  "Activate"
                                )}
                              </button>
                            </>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => openDeleteModal(vendor)}
                              disabled={isPending}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingVendor ? "Edit Vendor" : "Add Vendor"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {editingVendor
                    ? "Update vendor information"
                    : "Add a new seafood supplier"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Vendor Name"
                  required
                  value={form.name}
                  onChange={(value) => updateField("name", value)}
                  placeholder="e.g. Coastal Fisheries"
                />

                <FormField
                  label="Ship Name"
                  value={form.shipName}
                  onChange={(value) =>
                    updateField("shipName", value)
                  }
                  placeholder="e.g. Sea Queen"
                />

                <FormField
                  label="Phone"
                  required
                  value={form.phone}
                  onChange={(value) =>
                    updateField("phone", value)
                  }
                  placeholder="e.g. 9876543210"
                />

                <FormField
                  label="Alternate Phone"
                  value={form.alternatePhone}
                  onChange={(value) =>
                    updateField("alternatePhone", value)
                  }
                  placeholder="Optional"
                />

                <FormField
                  label="Location"
                  value={form.location}
                  onChange={(value) =>
                    updateField("location", value)
                  }
                  placeholder="e.g. Ratnagiri"
                />
              </div>

              {/* Managed By */}
              {editingVendor?.managedBy && (
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 dark:border-cyan-900/40 dark:bg-cyan-950/20">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
                    Managed By
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatManagedBy(editingVendor.managedBy)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Manager is assigned automatically when the vendor is
                    created.
                  </p>
                </div>
              )}

              <FormField
                label="Address"
                value={form.address}
                onChange={(value) =>
                  updateField("address", value)
                }
                placeholder="Vendor address"
                textarea
              />

              <FormField
                label="Notes"
                value={form.notes}
                onChange={(value) =>
                  updateField("notes", value)
                }
                placeholder="Additional notes about this vendor..."
                textarea
              />

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && <Spinner />}

                  {isPending
                    ? editingVendor
                      ? "Updating..."
                      : "Creating..."
                    : editingVendor
                      ? "Update Vendor"
                      : "Create Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && vendorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600 dark:bg-red-950/30 dark:text-red-400">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              Delete vendor?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              You are about to permanently delete{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {vendorToDelete.name}
              </span>
              . This action cannot be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isPending}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && <Spinner />}
                {isPending ? "Deleting..." : "Delete Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-lg font-bold text-cyan-600 dark:text-cyan-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  const className =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800";

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className={className}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </label>
  );
}

/* =========================================================
   SPINNER
========================================================= */

function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}