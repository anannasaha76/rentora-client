"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Layers,
  MapPin,
  Package,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "react-toastify"

import { OwnerRouteGuard } from "@/components/owner-route-guard"
import { Button, buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  deleteEquipment,
  equipmentCategories,
  equipmentConditions,
  type EquipmentListing,
  getOwnerEquipment,
  rentalTypes,
  type RentalType,
  updateEquipment,
} from "@/lib/equipment"
import { cn } from "@/lib/utils"

const defaultCategories = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
  "Excavators",
  "Loaders",
  "Cranes",
  "Forklifts",
  "Tractors",
  "Generators",
  "Power Tools",
  "Other",
]

const defaultRentalTypes: RentalType[] = ["Daily", "Weekly", "Monthly"]

const defaultConditions = [
  "New",
  "Excellent",
  "Good",
  "Fair",
  "For parts",
]

const safeCategories = equipmentCategories && equipmentCategories.length > 0 ? equipmentCategories : defaultCategories
const safeRentalTypes = rentalTypes && rentalTypes.length > 0 ? rentalTypes : defaultRentalTypes
const safeConditions = equipmentConditions && equipmentConditions.length > 0 ? equipmentConditions : defaultConditions

const inputClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
const textareaClass =
  "min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function StatusBadge({ status }: { status?: string }) {
  const current = status || "Pending"
  if (current === "Approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
        Approved
      </span>
    )
  }
  if (current === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
        <XCircle className="size-3.5" />
        Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
      <Clock className="size-3.5" />
      Pending
    </span>
  )
}

export default function MyEquipmentPage() {
  const { data: session } = useSession()
  const [equipmentList, setEquipmentList] = React.useState<EquipmentListing[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")

  // Modals
  const [viewItem, setViewItem] = React.useState<EquipmentListing | null>(null)
  const [editItem, setEditItem] = React.useState<EquipmentListing | null>(null)
  const [deleteItem, setDeleteItem] = React.useState<EquipmentListing | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const ownerEmail = session?.user?.email || ""
  const ownerId = session?.user?.id || ""

  const fetchEquipment = React.useCallback(async () => {
    if (!ownerEmail && !ownerId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getOwnerEquipment(ownerEmail, ownerId)
      setEquipmentList(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load equipment."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [ownerEmail, ownerId])

  React.useEffect(() => {
    if (ownerEmail || ownerId) {
      fetchEquipment()
    } else {
      setLoading(false)
    }
  }, [ownerEmail, ownerId, fetchEquipment])

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    const isModalOpen = Boolean(viewItem || editItem || deleteItem)
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [viewItem, editItem, deleteItem])

  // Handle Delete Confirmation
  async function handleDeleteConfirm() {
    if (!deleteItem) return
    const id = deleteItem._id || deleteItem.id
    if (!id) return

    setDeleting(true)
    try {
      await deleteEquipment(id)
      setEquipmentList((prev) => (prev || []).filter((item) => (item._id || item.id) !== id))
      toast.success("Equipment listing deleted successfully.")
      setDeleteItem(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete equipment.")
    } finally {
      setDeleting(false)
    }
  }

  // Handle Update Success
  function handleUpdateSuccess(updated: EquipmentListing) {
    const id = updated._id || updated.id
    setEquipmentList((prev) =>
      (prev || []).map((item) => ((item._id || item.id) === id ? { ...item, ...updated } : item))
    )
    setEditItem(null)
    toast.success("Equipment updated successfully.")
  }

  // Filtered list
  const filteredList = React.useMemo(() => {
    if (!Array.isArray(equipmentList)) return []
    return equipmentList.filter((item) => {
      if (!item) return false
      const name = item.equipmentName || ""
      const brand = item.brand || ""
      const model = item.model || ""
      const location = item.location || ""
      const q = (searchQuery || "").toLowerCase()

      const matchesSearch =
        q === "" ||
        name.toLowerCase().includes(q) ||
        brand.toLowerCase().includes(q) ||
        model.toLowerCase().includes(q) ||
        location.toLowerCase().includes(q)

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory

      const matchesStatus =
        selectedStatus === "all" || (item.status || "Pending") === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [equipmentList, searchQuery, selectedCategory, selectedStatus])

  // Quick stats
  const safeList = Array.isArray(equipmentList) ? equipmentList : []
  const totalCount = safeList.length
  const pendingCount = safeList.filter(
    (item) => (item?.status || "Pending") === "Pending"
  ).length
  const approvedCount = safeList.filter((item) => item?.status === "Approved").length
  const totalUnits = safeList.reduce(
    (sum, item) => sum + (Number(item?.availableQuantity) || 0),
    0
  )

  return (
    <OwnerRouteGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Equipment</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor, update, and manage all your rental equipment listings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEquipment}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            <Link
              href="/dashboard/add-equipment"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
            >
              <PlusCircle className="size-4" />
              Add Equipment
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Listings</span>
              <Package className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-xs font-medium">Pending Review</span>
              <Clock className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{pendingCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-medium">Approved & Live</span>
              <CheckCircle2 className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{approvedCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Units</span>
              <Layers className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{totalUnits}</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, model..."
              className={cn(inputClass, "pl-9")}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span>Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={cn(inputClass, "h-9 w-auto text-xs")}
            >
              <option value="all">All Categories</option>
              {(safeCategories || []).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={cn(inputClass, "h-9 w-auto text-xs")}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Loading your equipment...</p>
              <p className="text-xs text-muted-foreground">Fetching records from server</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Failed to load equipment</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEquipment}
                className="mt-4 gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Try Again
              </Button>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Package className="size-7" />
              </div>
              {totalCount === 0 ? (
                <>
                  <h3 className="mt-4 text-base font-semibold">No equipment listed yet</h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Get started by adding your first equipment for rent. New listings will undergo admin approval.
                  </p>
                  <Link
                    href="/dashboard/add-equipment"
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "mt-5 gap-1.5"
                    )}
                  >
                    <PlusCircle className="size-4" />
                    Add Your First Equipment
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-base font-semibold">No matching equipment found</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search query or clear the filters.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                      setSelectedStatus("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 sm:px-6">
                      Equipment Name
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Rental Price
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Available Quantity
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(filteredList || []).map((item) => {
                    const id = item._id || item.id || ""
                    return (
                      <tr
                        key={id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        {/* Equipment Name Column */}
                        <td className="px-4 py-3.5 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image}
                                  alt={item.equipmentName}
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    ;(e.target as HTMLElement).style.display = "none"
                                  }}
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                  <Package className="size-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {item.equipmentName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {[item.brand, item.model].filter(Boolean).join(" • ") ||
                                  item.location}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category Column */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                            {item.category}
                          </span>
                        </td>

                        {/* Rental Price Column */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-foreground">
                            ${Number(item.rentalPrice).toLocaleString()}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              / {item.rentalType}
                            </span>
                          </div>
                        </td>

                        {/* Available Quantity Column */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                item.availableQuantity > 0
                                  ? "bg-emerald-500"
                                  : "bg-destructive"
                              )}
                            />
                            <span className="font-medium text-foreground">
                              {item.availableQuantity}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.availableQuantity === 1 ? "unit" : "units"}
                            </span>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={item.status} />
                        </td>

                        {/* Actions Column */}
                        <td className="px-4 py-3.5 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            {/* View Details Action */}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setViewItem(item)}
                              title="View Details"
                              className="size-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="size-4" />
                              <span className="sr-only">View Details</span>
                            </Button>

                            {/* Update Action */}
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setEditItem(item)}
                              title="Update Equipment"
                              className="size-8 p-0 text-primary hover:bg-primary/10"
                            >
                              <Pencil className="size-4" />
                              <span className="sr-only">Update</span>
                            </Button>

                            {/* Delete Action */}
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setDeleteItem(item)}
                              title="Delete Equipment"
                              className="size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">Delete</span>
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

        {/* Modals */}
        {viewItem && (
          <ViewDetailsModal
            item={viewItem}
            onClose={() => setViewItem(null)}
            onEdit={() => {
              const target = viewItem
              setViewItem(null)
              setEditItem(target)
            }}
          />
        )}

        {editItem && (
          <UpdateEquipmentModal
            item={editItem}
            onClose={() => setEditItem(null)}
            onSuccess={handleUpdateSuccess}
          />
        )}

        {deleteItem && (
          <DeleteConfirmModal
            item={deleteItem}
            deleting={deleting}
            onClose={() => {
              if (!deleting) setDeleteItem(null)
            }}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </OwnerRouteGuard>
  )
}

/* =========================================================================
   VIEW DETAILS MODAL
   ========================================================================= */
function ViewDetailsModal({
  item,
  onClose,
  onEdit,
}: {
  item: EquipmentListing
  onClose: () => void
  onEdit: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-2xl rounded-2xl border bg-card text-card-foreground shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Equipment Details</h2>
            <StatusBadge status={item.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-5">
          {/* Image & Quick Highlight */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.equipmentName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <Package className="size-10" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between space-y-3">
              <div>
                <span className="inline-block rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {item.category}
                </span>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {item.equipmentName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {[item.brand, item.model].filter(Boolean).join(" • ")}
                </p>
              </div>

              <div className="rounded-xl bg-muted/60 p-3">
                <span className="text-xs text-muted-foreground">Rental Rate</span>
                <div className="text-2xl font-black text-foreground">
                  ${Number(item.rentalPrice).toLocaleString()}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    / {item.rentalType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary" /> Location
              </span>
              <p className="text-sm font-medium">{item.location || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Layers className="size-3.5 text-primary" /> Available Units
              </span>
              <p className="text-sm font-medium">
                {item.availableQuantity} {item.availableQuantity === 1 ? "unit" : "units"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="size-3.5 text-primary" /> Condition
              </span>
              <p className="text-sm font-medium">{item.equipmentCondition || "Standard"}</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5 text-primary" /> Listed On
              </span>
              <p className="text-sm font-medium">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "Recently"}
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5 text-primary" /> Status Note
              </span>
              <p className="text-xs font-medium text-muted-foreground">
                {item.status === "Approved"
                  ? "Approved by platform admin. Visible to public customers."
                  : item.status === "Rejected"
                  ? "Rejected by platform admin. Please update details to request re-review."
                  : "Pending admin review before being publicly bookable."}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h4>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
              {item.description || "No description provided."}
            </div>
          </div>

          {/* Rental Terms and Conditions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rental Terms & Conditions
            </h4>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
              {item.rentalTerms || "Standard platform rental terms apply."}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit} className="gap-1.5">
            <Pencil className="size-4" />
            Update Equipment
          </Button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   UPDATE EQUIPMENT MODAL
   ========================================================================= */
function UpdateEquipmentModal({
  item,
  onClose,
  onSuccess,
}: {
  item: EquipmentListing
  onClose: () => void
  onSuccess: (updated: EquipmentListing) => void
}) {
  const [form, setForm] = React.useState({
    equipmentName: item.equipmentName || "",
    category: item.category || "",
    description: item.description || "",
    location: item.location || "",
    rentalPrice: String(item.rentalPrice || ""),
    rentalType: (item.rentalType || "Daily") as RentalType,
    availableQuantity: String(item.availableQuantity || "1"),
    equipmentCondition: item.equipmentCondition || "",
    brand: item.brand || "",
    model: item.model || "",
    image: item.image || "",
    rentalTerms: item.rentalTerms || "",
  })

  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!key) {
      toast.error("Image upload is not configured. Please provide a direct image link.")
      e.target.value = ""
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data?.data?.url) {
        throw new Error(data?.error?.message || "Upload failed")
      }
      update("image", data.data.url)
      toast.success("New equipment image uploaded.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.equipmentName.trim()) {
      toast.error("Equipment name is required.")
      return
    }
    if (!form.category) {
      toast.error("Please select a category.")
      return
    }
    if (Number(form.rentalPrice) <= 0) {
      toast.error("Rental price must be greater than zero.")
      return
    }
    if (
      !Number.isInteger(Number(form.availableQuantity)) ||
      Number(form.availableQuantity) < 0
    ) {
      toast.error("Available quantity must be a non-negative whole number.")
      return
    }

    const id = item._id || item.id
    if (!id) {
      toast.error("Missing equipment ID.")
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        rentalPrice: Number(form.rentalPrice),
        availableQuantity: Number(form.availableQuantity),
      }
      const res = await updateEquipment(id, payload)
      onSuccess(res.equipment)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update equipment.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-3xl rounded-2xl border bg-card text-card-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Update Equipment</h2>
            <p className="text-xs text-muted-foreground">
              Modify the specifications and availability for this listing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[72vh] space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Equipment Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.equipmentName}
                  onChange={(e) => update("equipmentName", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select category</option>
                  {(safeCategories || []).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Location <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Rental Price ($) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.rentalPrice}
                  onChange={(e) => update("rentalPrice", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Rental Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={form.rentalType}
                  onChange={(e) => update("rentalType", e.target.value as RentalType)}
                  className={inputClass}
                  required
                >
                  {(safeRentalTypes || []).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Available Quantity <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.availableQuantity}
                  onChange={(e) => update("availableQuantity", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Equipment Condition <span className="text-destructive">*</span>
                </label>
                <select
                  value={form.equipmentCondition}
                  onChange={(e) => update("equipmentCondition", e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select condition</option>
                  {(safeConditions || []).map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Equipment Image URL + Upload */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Equipment Image URL <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => update("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                    required
                  />
                  <label
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "cursor-pointer shrink-0 gap-1.5",
                      uploading && "opacity-50 pointer-events-none"
                    )}
                  >
                    <UploadCloud className="size-4" />
                    {uploading ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border bg-muted/40 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Preview"
                      className="size-12 rounded object-cover"
                    />
                    <span className="truncate text-xs text-muted-foreground">
                      {form.image}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className={textareaClass}
                  required
                />
              </div>

              {/* Rental Terms and Conditions */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Rental Terms and Conditions <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.rentalTerms}
                  onChange={(e) => update("rentalTerms", e.target.value)}
                  className={textareaClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading} className="gap-1.5">
              {saving ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* =========================================================================
   DELETE CONFIRMATION MODAL
   ========================================================================= */
function DeleteConfirmModal({
  item,
  deleting,
  onClose,
  onConfirm,
}: {
  item: EquipmentListing
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-md rounded-2xl border bg-card p-6 text-card-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>

        <h2 className="mt-4 text-lg font-bold">Delete Equipment</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{item.equipmentName}&rdquo;
          </span>
          ? This action cannot be undone and will remove the item from all listings.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
            className="gap-1.5"
          >
            {deleting ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete Equipment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
