"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  MapPin,
  Package,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "react-toastify"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  defaultCategories,
  defaultConditions,
  defaultRentalTypes,
  type EquipmentListing,
  type EquipmentStatus,
  deleteEquipment,
  getAllEquipment,
  type RentalType,
  updateEquipment,
  updateEquipmentStatus,
} from "@/lib/equipment"
import { cn } from "@/lib/utils"

export default function AdminAllEquipmentPage() {
  const [equipmentList, setEquipmentList] = React.useState<EquipmentListing[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")

  // Action states
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null)

  // Modals state
  const [viewingItem, setViewingItem] = React.useState<EquipmentListing | null>(null)
  const [updatingItem, setUpdatingItem] = React.useState<EquipmentListing | null>(null)
  const [deletingItem, setDeletingItem] = React.useState<EquipmentListing | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Fetch all equipment
  const loadEquipment = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllEquipment({
        status: "all", // Load all equipment for admin oversight
        limit: 100,
      })
      const items = Array.isArray(response.equipment) ? response.equipment : []
      setEquipmentList(items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load equipment catalog."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadEquipment()
  }, [loadEquipment])

  // Approve action
  const handleApprove = async (item: EquipmentListing) => {
    const id = item._id || item.id || ""
    if (!id) return
    try {
      setActionLoadingId(id)
      const res = await updateEquipmentStatus(id, "Approved")
      setEquipmentList((prev) =>
        prev.map((eq) => ((eq._id || eq.id) === id ? { ...eq, status: "Approved" } : eq))
      )
      toast.success(res.message || `Equipment "${item.equipmentName}" approved.`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve equipment.")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Reject action
  const handleReject = async (item: EquipmentListing) => {
    const id = item._id || item.id || ""
    if (!id) return
    try {
      setActionLoadingId(id)
      const res = await updateEquipmentStatus(id, "Rejected")
      setEquipmentList((prev) =>
        prev.map((eq) => ((eq._id || eq.id) === id ? { ...eq, status: "Rejected" } : eq))
      )
      toast.info(res.message || `Equipment "${item.equipmentName}" marked as rejected.`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject equipment.")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Delete action
  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    const id = deletingItem._id || deletingItem.id || ""
    if (!id) return

    try {
      setIsDeleting(true)
      await deleteEquipment(id)
      setEquipmentList((prev) => prev.filter((eq) => (eq._id || eq.id) !== id))
      toast.success("Equipment deleted successfully.")
      setDeletingItem(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete equipment.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculated Metrics
  const metrics = React.useMemo(() => {
    const total = equipmentList.length
    const pending = equipmentList.filter((e) => (e.status || "").toLowerCase() === "pending").length
    const approved = equipmentList.filter((e) => (e.status || "").toLowerCase() === "approved").length
    const rejected = equipmentList.filter((e) => (e.status || "").toLowerCase() === "rejected").length
    return { total, pending, approved, rejected }
  }, [equipmentList])

  // Filtered Equipment
  const filteredEquipment = React.useMemo(() => {
    return equipmentList.filter((item) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (item.equipmentName || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.brand || "").toLowerCase().includes(q) ||
        (item.model || "").toLowerCase().includes(q) ||
        (item.ownerName || "").toLowerCase().includes(q) ||
        (item.ownerEmail || "").toLowerCase().includes(q) ||
        (item.location || "").toLowerCase().includes(q)

      // 2. Status Filter
      const matchesStatus =
        statusFilter === "all" ||
        (item.status || "").toLowerCase() === statusFilter.toLowerCase()

      // 3. Category Filter
      const matchesCategory =
        categoryFilter === "all" ||
        (item.category || "").toLowerCase() === categoryFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [equipmentList, searchQuery, statusFilter, categoryFilter])

  return (
    <AuthRouteGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              All Equipment
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Review, moderate, approve, update, or remove equipment across the Rentora platform.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadEquipment}
            disabled={loading}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Total Equipment */}
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Listings</span>
              <Package className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{metrics.total}</p>
            <span className="text-[11px] text-muted-foreground">Platform-wide equipment</span>
          </div>

          {/* Pending Approval */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Pending Approval
              </span>
              <Clock className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-amber-700 dark:text-amber-300">
              {metrics.pending}
            </p>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">Requires moderation</span>
          </div>

          {/* Approved Equipment */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Approved
              </span>
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {metrics.approved}
            </p>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Live in marketplace</span>
          </div>

          {/* Rejected Equipment */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                Rejected
              </span>
              <XCircle className="size-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-rose-700 dark:text-rose-300">
              {metrics.rejected}
            </p>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80">Declined listings</span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, owner, brand, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none"
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

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none"
            >
              <option value="all">All Statuses ({metrics.total})</option>
              <option value="Pending">Pending ({metrics.pending})</option>
              <option value="Approved">Approved ({metrics.approved})</option>
              <option value="Rejected">Rejected ({metrics.rejected})</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none"
            >
              <option value="all">All Categories</option>
              {defaultCategories.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setCategoryFilter("all")
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Main Equipment Table Card */}
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
              <Button onClick={loadEquipment} variant="outline" size="sm" className="mt-3">
                Try Again
              </Button>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto mb-3 size-12 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">No equipment found</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                No items match your active search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3.5 sm:px-6">Equipment</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Owner</th>
                    <th className="px-4 py-3.5">Rate</th>
                    <th className="px-4 py-3.5">Stock</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEquipment.map((item) => {
                    const id = item._id || item.id || ""
                    const status = (item.status || "Pending") as EquipmentStatus
                    const isOperating = actionLoadingId === id

                    return (
                      <tr key={id} className="transition-colors hover:bg-muted/30">
                        {/* 1. Equipment Details */}
                        <td className="px-4 py-3.5 sm:px-6">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                item.image ||
                                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80"
                              }
                              alt={item.equipmentName}
                              className="size-12 rounded-lg border object-cover"
                            />
                            <div className="min-w-0 max-w-[200px] sm:max-w-[260px]">
                              <p className="truncate font-bold text-foreground text-sm">
                                {item.equipmentName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {[item.brand, item.model].filter(Boolean).join(" • ") || "Standard"}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <MapPin className="size-3 text-primary shrink-0" />
                                <span className="truncate">{item.location || "Nationwide"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Category */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            <Tag className="size-3 text-primary" />
                            {item.category}
                          </span>
                        </td>

                        {/* 3. Owner Information */}
                        <td className="px-4 py-3.5">
                          <div className="min-w-0 max-w-[160px]">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {item.ownerName || "Owner"}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {item.ownerEmail || "N/A"}
                            </p>
                          </div>
                        </td>

                        {/* 4. Rental Rate */}
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground">
                            ${Number(item.rentalPrice).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /{item.rentalType?.toLowerCase() || "day"}
                          </span>
                        </td>

                        {/* 5. Available Stock */}
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                              item.availableQuantity > 0
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-destructive/10 text-destructive"
                            )}
                          >
                            <Package className="size-3" />
                            {item.availableQuantity} in stock
                          </span>
                        </td>

                        {/* 6. Status Badge */}
                        <td className="px-4 py-3.5">
                          {status === "Approved" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                              <CheckCircle2 className="size-3" />
                              Approved
                            </span>
                          ) : status === "Rejected" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
                              <XCircle className="size-3" />
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                              <Clock className="size-3" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* 7. Action Buttons */}
                        <td className="px-4 py-3.5 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Approve Button */}
                            {status !== "Approved" && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={isOperating}
                                onClick={() => handleApprove(item)}
                                className="border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                                title="Approve Equipment"
                              >
                                <Check className="size-3.5" />
                                <span className="hidden sm:inline">Approve</span>
                              </Button>
                            )}

                            {/* Reject Button */}
                            {status !== "Rejected" && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={isOperating}
                                onClick={() => handleReject(item)}
                                className="border-rose-600/30 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                title="Reject Equipment"
                              >
                                <X className="size-3.5" />
                                <span className="hidden sm:inline">Reject</span>
                              </Button>
                            )}

                            {/* Update Button */}
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setUpdatingItem(item)}
                              title="Update Equipment"
                            >
                              <Edit3 className="size-3.5" />
                              <span className="hidden sm:inline">Update</span>
                            </Button>

                            {/* View Details Button */}
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setViewingItem(item)}
                              title="View Details"
                            >
                              <Eye className="size-3.5" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setDeletingItem(item)}
                              className="text-destructive hover:bg-destructive/10"
                              title="Delete Equipment"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
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
            MODAL 1: VIEW EQUIPMENT DETAILS
           ========================================================================= */}
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-bold text-foreground">Equipment Details</h3>
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={viewingItem.image}
                    alt={viewingItem.equipmentName}
                    className="size-full object-cover"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-xs">
                      {viewingItem.category}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-foreground">
                    {viewingItem.equipmentName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {[viewingItem.brand, viewingItem.model].filter(Boolean).join(" • ")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-3 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-muted-foreground">Rate:</span>
                    <p className="font-bold text-primary">
                      ${viewingItem.rentalPrice}/{viewingItem.rentalType?.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock:</span>
                    <p className="font-bold text-foreground">{viewingItem.availableQuantity} units</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Condition:</span>
                    <p className="font-bold text-foreground">{viewingItem.equipmentCondition || "Good"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-bold capitalize text-foreground">{viewingItem.status}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground">Description</h5>
                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-foreground">
                    {viewingItem.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground">
                    Rental Terms & Conditions
                  </h5>
                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                    {viewingItem.rentalTerms || "Standard platform rental terms apply."}
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/20 p-3 text-xs space-y-1">
                  <p className="text-muted-foreground">
                    Listed By: <strong className="text-foreground">{viewingItem.ownerName}</strong> (
                    {viewingItem.ownerEmail})
                  </p>
                  <p className="text-muted-foreground">
                    Location: <strong className="text-foreground">{viewingItem.location}</strong>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setViewingItem(null)}>
                  Close
                </Button>
                <Link href={`/equipment/${viewingItem._id || viewingItem.id}`} target="_blank">
                  <Button size="sm" className="gap-1.5">
                    Open Public Page
                    <ExternalLink className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: UPDATE EQUIPMENT DETAILS
           ========================================================================= */}
        {updatingItem && (
          <UpdateEquipmentModal
            equipment={updatingItem}
            onClose={() => setUpdatingItem(null)}
            onUpdated={(updated) => {
              setEquipmentList((prev) =>
                prev.map((eq) =>
                  (eq._id || eq.id) === (updated._id || updated.id) ? updated : eq
                )
              )
              setUpdatingItem(null)
            }}
          />
        )}

        {/* =========================================================================
            MODAL 3: DELETE CONFIRMATION
           ========================================================================= */}
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-foreground">
                Delete Equipment Listing?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Are you sure you want to permanently delete{" "}
                <strong className="text-foreground">{deletingItem.equipmentName}</strong>? This action
                cannot be undone.
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingItem(null)}
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
// SUB-COMPONENT: UPDATE EQUIPMENT MODAL
// =========================================================================
function UpdateEquipmentModal({
  equipment,
  onClose,
  onUpdated,
}: {
  equipment: EquipmentListing
  onClose: () => void
  onUpdated: (updated: EquipmentListing) => void
}) {
  const [equipmentName, setEquipmentName] = React.useState(equipment.equipmentName || "")
  const [description, setDescription] = React.useState(equipment.description || "")
  const [category, setCategory] = React.useState(equipment.category || defaultCategories[0])
  const [location, setLocation] = React.useState(equipment.location || "")
  const [rentalPrice, setRentalPrice] = React.useState(String(equipment.rentalPrice || ""))
  const [rentalType, setRentalType] = React.useState<RentalType>(equipment.rentalType || "Daily")
  const [availableQuantity, setAvailableQuantity] = React.useState(
    String(equipment.availableQuantity || "1")
  )
  const [equipmentCondition, setEquipmentCondition] = React.useState(
    equipment.equipmentCondition || "Good"
  )
  const [brand, setBrand] = React.useState(equipment.brand || "")
  const [model, setModel] = React.useState(equipment.model || "")
  const [image, setImage] = React.useState(equipment.image || "")
  const [rentalTerms, setRentalTerms] = React.useState(equipment.rentalTerms || "")
  const [status, setStatus] = React.useState<EquipmentStatus>(equipment.status || "Pending")

  const [saving, setSaving] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = equipment._id || equipment.id || ""
    if (!id) return

    try {
      setSaving(true)
      const res = await updateEquipment(id, {
        equipmentName,
        description,
        category,
        location,
        rentalPrice: Number(rentalPrice),
        rentalType,
        availableQuantity: Number(availableQuantity),
        equipmentCondition,
        brand,
        model,
        image,
        rentalTerms,
        status,
      })

      toast.success(res.message || "Equipment updated successfully.")
      onUpdated(res.equipment)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update equipment.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-bold text-foreground">Update Equipment Listing</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Equipment Name */}
          <div>
            <label className="block text-xs font-medium text-foreground">Equipment Name *</label>
            <input
              type="text"
              required
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-foreground">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {defaultCategories.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground">Listing Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Price, Rental Type, Quantity */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-foreground">Rental Price ($) *</label>
              <input
                type="number"
                required
                min={1}
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground">Rental Type *</label>
              <select
                value={rentalType}
                onChange={(e) => setRentalType(e.target.value as RentalType)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {defaultRentalTypes.map((t: string) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground">Available Quantity *</label>
              <input
                type="number"
                required
                min={0}
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Location & Condition */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-foreground">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground">Condition</label>
              <select
                value={equipmentCondition}
                onChange={(e) => setEquipmentCondition(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {defaultConditions.map((cond: string) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-foreground">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-medium text-foreground">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-foreground">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Rental Terms */}
          <div>
            <label className="block text-xs font-medium text-foreground">Rental Terms</label>
            <textarea
              rows={2}
              value={rentalTerms}
              onChange={(e) => setRentalTerms(e.target.value)}
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

