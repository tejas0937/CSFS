"use client";

import { useState } from "react";

import {
  createUserAction,
  deleteUserAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
  updateUserAction,
} from "@/app/actions/users";

type Role = "ADMIN" | "MANAGER" | "VIEWER";

type User = {
  id: string;
  username: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

type UserManagementProps = {
  users: User[];
  currentUserId: string;
};

export default function UserManagement({
  users,
  currentUserId,
}: UserManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  async function handleCreateUser(formData: FormData) {
    clearMessages();
    setLoading(true);

    try {
      const result = await createUserAction(formData);

      if (!result.success) {
        setError(result.error ?? "Unable to create user.");
        return;
      }

      setMessage(result.message ?? "User created successfully.");
      setShowAddModal(false);

      window.location.reload();
    } catch {
      setError("Something went wrong while creating the user.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUser(formData: FormData) {
    clearMessages();
    setLoading(true);

    try {
      const result = await updateUserAction(formData);

      if (!result.success) {
        setError(result.error ?? "Unable to update user.");
        return;
      }

      setMessage(result.message ?? "User updated successfully.");
      setEditingUser(null);

      window.location.reload();
    } catch {
      setError("Something went wrong while updating the user.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(user: User) {
    clearMessages();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", user.id);

      const result = await toggleUserStatusAction(formData);

      if (!result.success) {
        setError(result.error ?? "Unable to update user status.");
        return;
      }

      setMessage(result.message ?? "User status updated.");

      window.location.reload();
    } catch {
      setError("Something went wrong while updating the user status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(formData: FormData) {
    clearMessages();
    setLoading(true);

    try {
      const result = await resetUserPasswordAction(formData);

      if (!result.success) {
        setError(result.error ?? "Unable to reset password.");
        return;
      }

      setMessage(result.message ?? "Password reset successfully.");
      setResetUser(null);
    } catch {
      setError("Something went wrong while resetting the password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!deletingUser) {
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", deletingUser.id);

      const result = await deleteUserAction(formData);

      if (!result.success) {
        setError(result.error ?? "Unable to delete user.");
        return;
      }

      setMessage(result.message ?? "User deleted successfully.");
      setDeletingUser(null);

      window.location.reload();
    } catch {
      setError("Something went wrong while deleting the user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Manage users and their system access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearMessages();
            setShowAddModal(true);
          }}
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
        >
          + Add User
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Username
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Created
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isCurrentUser = user.id === currentUserId;

                return (
                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {user.name}
                      </div>

                      {isCurrentUser && (
                        <span className="mt-1 inline-block text-xs font-medium text-orange-600">
                          You
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.username}
                    </td>

                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge isActive={user.isActive} />
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            clearMessages();
                            setEditingUser(user);
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                        >
                          Edit
                        </button>

                        {!isCurrentUser && (
                          <>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                handleToggleStatus(user)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                              {user.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                clearMessages();
                                setResetUser(user);
                              }}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Password
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                clearMessages();
                                setDeletingUser(user);
                              }}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No users found.
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal
          title="Add New User"
          onClose={() => setShowAddModal(false)}
        >
          <form
            action={handleCreateUser}
            className="space-y-5"
          >
            <Input
              label="Full Name"
              name="name"
              placeholder="Enter full name"
              required
            />

            <Input
              label="Username"
              name="username"
              placeholder="Enter username"
              required
            />

            <PasswordInput
  label="Password"
  name="password"
  placeholder="Minimum 8 characters"
  required
/>

            <RoleSelect />

            <ModalActions
              onCancel={() => setShowAddModal(false)}
              loading={loading}
              submitText="Create User"
            />
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          title="Edit User"
          onClose={() => setEditingUser(null)}
        >
          <form
            action={handleUpdateUser}
            className="space-y-5"
          >
            <input
              type="hidden"
              name="id"
              value={editingUser.id}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>

              <input
                value={editingUser.username}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
              />
            </div>

            <Input
              label="Full Name"
              name="name"
              defaultValue={editingUser.name}
              required
            />

            <RoleSelect
              defaultValue={editingUser.role}
              disabled={editingUser.id === currentUserId}
            />

            <ModalActions
              onCancel={() => setEditingUser(null)}
              loading={loading}
              submitText="Save Changes"
            />
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <Modal
          title="Reset Password"
          onClose={() => setResetUser(null)}
        >
          <div className="mb-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Reset password for
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {resetUser.name}
            </p>

            <p className="text-sm text-slate-500">
              @{resetUser.username}
            </p>
          </div>

          <form
            action={handleResetPassword}
            className="space-y-5"
          >
            <input
              type="hidden"
              name="id"
              value={resetUser.id}
            />

            <PasswordInput
  label="New Password"
  name="password"
  placeholder="Minimum 8 characters"
  required
/>

            <ModalActions
              onCancel={() => setResetUser(null)}
              loading={loading}
              submitText="Reset Password"
            />
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingUser && (
        <Modal
          title="Delete User"
          onClose={() => setDeletingUser(null)}
        >
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Are you sure you want to delete this user?
            </p>

            <p className="mt-2 font-semibold text-red-900">
              {deletingUser.name}
            </p>

            <p className="text-sm text-red-700">
              @{deletingUser.username}
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleDeleteUser}
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Helper Components                                                          */
/* -------------------------------------------------------------------------- */

function formatDate(dateString: string) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function RoleBadge({ role }: { role: Role }) {
  const styles = {
    ADMIN: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    VIEWER: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function Input({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
      />
    </div>
  );
}

function PasswordInput({
  label,
  name,
  placeholder,
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
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
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.58 10.58a2 2 0 002.83 2.83"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.88 4.24A10.94 10.94 0 0112 4c5 0 8.27 4.11 9 8a10.8 10.8 0 01-2.05 4.36"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.61 6.61C4.84 7.86 3.63 9.84 3 12c.73 3.89 4 8 9 8a9.8 9.8 0 004.2-.93"
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
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.06 12.35a1 1 0 010-.7C3.46 7.4 7.46 4 12 4s8.54 3.4 9.94 7.65a1 1 0 010 .7C20.54 16.6 16.54 20 12 20s-8.54-3.4-9.94-7.65z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function RoleSelect({
  defaultValue = "VIEWER",
  disabled = false,
}: {
  defaultValue?: Role;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor="role"
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        Role
      </label>

      <select
        id="role"
        name="role"
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="ADMIN">Admin</option>
        <option value="MANAGER">Manager</option>
        <option value="VIEWER">Viewer</option>
      </select>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  loading,
  submitText,
}: {
  onCancel: () => void;
  loading: boolean;
  submitText: string;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Please wait..." : submitText}
      </button>
    </div>
  );
}