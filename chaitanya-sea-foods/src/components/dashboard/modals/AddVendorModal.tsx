"use client";

type Props = {
  isOpen: boolean;
  vendorName: string;
  shipName: string;
  phone: string;
  location: string;
  error: string;
  isSubmitting: boolean;

  onVendorNameChange: (value: string) => void;
  onShipNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onLocationChange: (value: string) => void;

  onErrorClear: () => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function AddVendorModal({
  isOpen,
  vendorName,
  shipName,
  phone,
  location,
  error,
  isSubmitting,
  onVendorNameChange,
  onShipNameChange,
  onPhoneChange,
  onLocationChange,
  onErrorClear,
  onClose,
  onSubmit,
}: Props) {
  if (!isOpen) {
    return null;
  }

  function handleClose() {
    onErrorClear();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Add New Vendor
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Add vendor details to the system
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 p-5">
          {/* Vendor Name */}
          <div>
            <label
              htmlFor="vendor-name"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Vendor Name
            </label>

            <input
              id="vendor-name"
              type="text"
              value={vendorName}
              onChange={(event) => {
                onVendorNameChange(event.target.value);
                onErrorClear();
              }}
              placeholder="Enter vendor name"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Ship Name */}
          <div>
            <label
              htmlFor="vendor-ship-name"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Ship Name
            </label>

            <input
              id="vendor-ship-name"
              type="text"
              value={shipName}
              onChange={(event) => {
                onShipNameChange(event.target.value);
                onErrorClear();
              }}
              placeholder="Enter ship name"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="vendor-phone"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Phone
            </label>

            <input
              id="vendor-phone"
              type="tel"
              value={phone}
              onChange={(event) => {
                onPhoneChange(event.target.value);
                onErrorClear();
              }}
              placeholder="Enter phone number"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="vendor-location"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Location
            </label>

            <input
              id="vendor-location"
              type="text"
              value={location}
              onChange={(event) => {
                onLocationChange(event.target.value);
                onErrorClear();
              }}
              placeholder="Enter location"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Adding..." : "Add Vendor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}