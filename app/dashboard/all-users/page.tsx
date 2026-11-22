"use client"

import * as React from "react"
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react"
import { toast } from "react-toastify"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  deleteUser,
  getAllUsers,
  manageUser,
  updateUserRole,
  type UserProfile,
} from "@/lib/user"
import { cn } from "@/lib/utils"

function formatDate(dateValue?: string | Date) {
  if (!dateValue) return "N/A"
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return String(dateValue)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return String(dateValue)
  }
}

export default function AdminAllUsersPage() {
  const { data: session } = useSession()
  const currentAdminEmail = session?.user?.email || ""

  const [users, setUsers] = React.useState<UserProfile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")

  // Role updating loading tracker
  const [updatingRoleId, setUpdatingRoleId] = React.useState<string | null>(null)

  // Modals state
  const [managingUser, setManagingUser] = React.useState<UserProfile | null>(null)
  const [deletingUser, setDeletingUser] = React.useState<UserProfile | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Fetch users
  const loadUsers = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllUsers({
        search: searchQuery.trim() || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      })
      const items = Array.isArray(response.users) ? response.users : []
      setUsers(items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load registered users."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, roleFilter])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Change Role Handler
  const handleChangeRole = async (targetUser: UserProfile, newRole: string) => {
    const id = targetUser._id || targetUser.id || targetUser.email
    if (!id) return

    // Prevent admin from accidentally demoting their own current account
    if (targetUser.email.toLowerCase() === currentAdminEmail.toLowerCase() && newRole !== "admin") {
      toast.warning("You cannot demote your own active admin account.")
      return
    }

    try {
      setUpdatingRoleId(id)
      const res = await updateUserRole(id, newRole)
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id || u.email) === id ? { ...u, role: newRole } : u))
      )
      toast.success(res.message || `Updated ${targetUser.name}'s role to ${newRole}.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role."
      toast.error(msg)
    } finally {
      setUpdatingRoleId(null)
    }
  }

  // Delete User Handler
  const handleConfirmDelete = async () => {
    if (!deletingUser) return
    const id = deletingUser._id || deletingUser.id || deletingUser.email
    if (!id) return

    if (deletingUser.email.toLowerCase() === currentAdminEmail.toLowerCase()) {
      toast.error("You cannot delete your own admin account.")
      return
    }

    try {
      setIsDeleting(true)
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => (u._id || u.id || u.email) !== id))
      toast.success("User deleted successfully.")
      setDeletingUser(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculated Metrics
  const metrics = React.useMemo(() => {
    const total = users.length
    const customer = users.filter((u) => (u.role || "customer").toLowerCase() === "customer").length
    const owner = users.filter((u) => (u.role || "").toLowerCase() === "owner").length
    const admin = users.filter((u) => (u.role || "").toLowerCase() === "admin").length
    return { total, customer, owner, admin }
  }, [users])

  // Filtered Users (client-side fast filter)
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phoneNumber || "").toLowerCase().includes(q)

      const r = (u.role || "customer").toLowerCase()
      const matchesRole = roleFilter === "all" || r === roleFilter.toLowerCase()

      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  return (
    <AuthRouteGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              All Users
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage platform accounts, monitor user registrations, and assign roles between Customer, Owner, and Admin.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={loading}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Total Registered Users */}
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Users</span>
              <Users className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{metrics.total}</p>
            <span className="text-[11px] text-muted-foreground">Registered accounts</span>
          </div>

          {/* Customers */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                Customers
              </span>
              <User className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-blue-700 dark:text-blue-300">
              {metrics.customer}
            </p>
            <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80">Equipment renters</span>
          </div>

          {/* Equipment Owners */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                Owners
              </span>
              <UserCheck className="size-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-purple-700 dark:text-purple-300">
              {metrics.owner}
            </p>
            <span className="text-[11px] text-purple-600/80 dark:text-purple-400/80">Equipment suppliers</span>
          </div>

          {/* Administrators */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Admins
              </span>
              <ShieldCheck className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-amber-700 dark:text-amber-300">
              {metrics.admin}
            </p>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">System moderators</span>
          </div>
        </div>

        {/* Toolbar: Search & Role Filter */}
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background pl-9 pr-8 py-2 text-sm focus:border-primary focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Role Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none"
            >
              <option value="all">All Roles ({metrics.total})</option>
              <option value="customer">Customers ({metrics.customer})</option>
              <option value="owner">Owners ({metrics.owner})</option>
              <option value="admin">Admins ({metrics.admin})</option>
            </select>

            {(searchQuery || roleFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setRoleFilter("all")
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Users Table Card */}
        <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <div className="space-y-4 p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto mb-2 size-8 text-destructive" />
              <p className="text-sm font-medium text-foreground">{error}</p>
              <Button onClick={loadUsers} variant="outline" size="sm" className="mt-3">
                Try Again
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-3 size-12 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">No users found</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                No user profiles match your search or role filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3.5 sm:px-6">Name</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Registration Date</th>
                    <th className="px-4 py-3.5 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => {
                    const id = u._id || u.id || u.email
                    const role = (u.role || "customer").toLowerCase()
                    const isSelf = u.email.toLowerCase() === currentAdminEmail.toLowerCase()
                    const isChangingRole = updatingRoleId === id

                    return (
                      <tr key={id} className="transition-colors hover:bg-muted/30">
                        {/* 1. Name & Avatar */}
                        <td className="px-4 py-3.5 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm overflow-hidden border">
                              {u.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={u.image}
                                  alt={u.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <span>{(u.name || "U")[0].toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-[200px] sm:max-w-[240px]">
                              <p className="truncate font-semibold text-foreground text-sm flex items-center gap-1.5">
                                {u.name || "Anonymous User"}
                                {isSelf && (
                                  <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-medium text-primary">
                                    You
                                  </span>
                                )}
                              </p>
                              {u.phoneNumber ? (
                                <p className="truncate text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="size-3 shrink-0" />
                                  {u.phoneNumber}
                                </p>
                              ) : (
                                <p className="text-[11px] text-muted-foreground">No phone recorded</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Email */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
                            <Mail className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[220px]">{u.email}</span>
                          </div>
                        </td>

                        {/* 3. Role */}
                        <td className="px-4 py-3.5">
                          {role === "admin" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                              <ShieldCheck className="size-3" />
                              Admin
                            </span>
                          ) : role === "owner" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-400">
                              <UserCheck className="size-3" />
                              Owner
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
                              <User className="size-3" />
                              Customer
                            </span>
                          )}
                        </td>

                        {/* 4. Registration Date */}
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {formatDate(u.createdAt)}
                        </td>

                        {/* 5. Actions: Change Role & Manage Users */}
                        <td className="px-4 py-3.5 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Change Role Selector */}
                            <div className="relative inline-block">
                              <select
                                disabled={isChangingRole || (isSelf && role === "admin")}
                                value={role}
                                onChange={(e) => handleChangeRole(u, e.target.value)}
                                className={cn(
                                  "h-8 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium focus:border-primary focus:outline-none transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                                  role === "admin"
                                    ? "border-amber-400 text-amber-700 dark:text-amber-300"
                                    : role === "owner"
                                    ? "border-purple-400 text-purple-700 dark:text-purple-300"
                                    : "border-blue-400 text-blue-700 dark:text-blue-300"
                                )}
                                title="Change User Role"
                              >
                                <option value="customer">Customer</option>
                                <option value="owner">Owner</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>

                            {/* Manage User Button */}
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setManagingUser(u)}
                              className="h-8 gap-1 font-medium"
                              title="Manage User Details"
                            >
                              <UserCog className="size-3.5" />
                              <span className="hidden sm:inline">Manage</span>
                            </Button>

                            {/* Delete Button Slot: Keeps alignment consistent for all rows including self/admin */}
                            {!isSelf ? (
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setDeletingUser(u)}
                                className="size-8 p-0 text-destructive hover:bg-destructive/10"
                                title="Delete User"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            ) : (
                              <div className="size-8" aria-hidden="true" />
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =========================================================================
            MODAL 1: MANAGE USER MODAL
           ========================================================================= */}
        {managingUser && (
          <ManageUserModal
            user={managingUser}
            onClose={() => setManagingUser(null)}
            onUpdated={(updated) => {
              setUsers((prev) =>
                prev.map((u) =>
                  (u._id || u.id || u.email) === (updated._id || updated.id || updated.email)
                    ? updated
                    : u
                )
              )
              setManagingUser(null)
            }}
          />
        )}

        {/* =========================================================================
            MODAL 2: DELETE CONFIRMATION MODAL
           ========================================================================= */}
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-foreground">
                Delete User Account?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Are you sure you want to delete <strong className="text-foreground">{deletingUser.name}</strong> (
                {deletingUser.email})? This action cannot be reversed.
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingUser(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="font-semibold"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthRouteGuard>
  )
}

// =========================================================================
// SUB-COMPONENT: MANAGE USER MODAL
// =========================================================================
function ManageUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: UserProfile
  onClose: () => void
  onUpdated: (updated: UserProfile) => void
}) {
  const [name, setName] = React.useState(user.name || "")
  const [phoneNumber, setPhoneNumber] = React.useState(user.phoneNumber || "")
  const [address, setAddress] = React.useState(user.address || "")
  const [image, setImage] = React.useState(user.image || "")
  const [role, setRole] = React.useState((user.role || "customer").toLowerCase())
  const [saving, setSaving] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = user._id || user.id || user.email
    if (!id) return

    try {
      setSaving(true)
      const res = await manageUser(id, {
        name,
        phoneNumber,
        address,
        image,
        role,
      })

      toast.success(res.message || "User profile updated successfully.")
      onUpdated(res.user)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update user.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <UserCog className="size-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Manage User Details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Email (Read-only credential) */}
          <div>
            <label className="block text-xs font-medium text-foreground">Email Address (Read-only)</label>
            <input
              type="email"
              readOnly
              disabled
              value={user.email}
              className="mt-1 w-full rounded-lg border bg-muted/60 px-3 py-2 text-sm text-muted-foreground font-mono"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-foreground">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-foreground">Assigned Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
            >
              <option value="customer">Customer (Equipment Renter)</option>
              <option value="owner">Owner (Equipment Supplier)</option>
              <option value="admin">Admin (System Administrator)</option>
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-foreground">Contact Phone</label>
            <input
              type="tel"
              placeholder="+880 1XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Delivery / Address */}
          <div>
            <label className="block text-xs font-medium text-foreground">Address / Location</label>
            <input
              type="text"
              placeholder="City, Division, Bangladesh"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Profile Avatar Image URL */}
          <div>
            <label className="block text-xs font-medium text-foreground">Avatar Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="font-semibold">
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
