"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Eye,
  Filter,
  Heart,
  HeartOff,
  Layers,
  MapPin,
  Package,
  PlusCircle,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button, buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  type FavoriteItem,
  getCustomerFavorites,
  removeFavorite,
} from "@/lib/favorite"
import { cn } from "@/lib/utils"

const inputClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"

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

function formatCurrency(value?: number | string) {
  const num = Number(value) || 0
  return `৳${num.toLocaleString()}`
}

export default function FavoritesPage() {
  const { data: session } = useSession()
  const [favorites, setFavorites] = React.useState<FavoriteItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")

  // Modals
  const [viewItem, setViewItem] = React.useState<FavoriteItem | null>(null)
  const [removingItem, setRemovingItem] = React.useState<FavoriteItem | null>(null)
  const [isRemoving, setIsRemoving] = React.useState(false)

  const customerEmail = session?.user?.email || ""

  const fetchFavorites = React.useCallback(async () => {
    if (!customerEmail) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getCustomerFavorites(customerEmail)
      setFavorites(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load favorites."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [customerEmail])

  React.useEffect(() => {
    if (customerEmail) {
      fetchFavorites()
    } else {
      setLoading(false)
    }
  }, [customerEmail, fetchFavorites])

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    const isModalOpen = Boolean(viewItem || removingItem)
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [viewItem, removingItem])

  // Handle Remove Favorite Confirmation
  async function handleConfirmRemove() {
    if (!removingItem) return
    const id = removingItem._id || removingItem.id
    if (!id) return

    setIsRemoving(true)
    try {
      await removeFavorite(id)
      setFavorites((prev) => (prev || []).filter((item) => (item._id || item.id) !== id))
      toast.success("Removed from favorites.")
      setRemovingItem(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove favorite.")
    } finally {
      setIsRemoving(false)
    }
  }

  // Categories list for filter
  const categoriesList = React.useMemo(() => {
    const safe = Array.isArray(favorites) ? favorites : []
    const set = new Set(safe.map((item) => item.category).filter(Boolean))
    return Array.from(set)
  }, [favorites])

  // Filtered list
  const filteredFavorites = React.useMemo(() => {
    if (!Array.isArray(favorites)) return []
    return favorites.filter((item) => {
      if (!item) return false
      const q = (searchQuery || "").toLowerCase()
      const matchesSearch =
        q === "" ||
        (item.equipmentName || "").toLowerCase().includes(q) ||
        (item.brand || "").toLowerCase().includes(q) ||
        (item.model || "").toLowerCase().includes(q) ||
        (item.location || "").toLowerCase().includes(q)

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [favorites, searchQuery, selectedCategory])

  // Aggregate stats
  const safeFavorites = Array.isArray(favorites) ? favorites : []
  const totalCount = safeFavorites.length
  const uniqueCategories = categoriesList.length
  const availableCount = safeFavorites.filter(
    (item) => (Number(item?.availableQuantity) || 0) > 0
  ).length

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and manage equipment you have saved for upcoming rental bookings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFavorites}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            <Link
              href="/equipment"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
            >
              <PlusCircle className="size-4" />
              Browse More Equipment
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Saved Items</span>
              <Heart className="size-4 text-rose-500 fill-rose-500/20" />
            </div>
            <p className="mt-2 text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Categories</span>
              <Tag className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{uniqueCategories}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Available in Stock</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{availableCount}</p>
          </div>
        </div>

        {/* Toolbar: Search and Filter */}
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved equipment..."
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
              <span>Category:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={cn(inputClass, "h-9 w-auto text-xs")}
            >
              <option value="all">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Loading your favorites...</p>
              <p className="text-xs text-muted-foreground">Fetching saved items</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Failed to load favorites</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFavorites}
                className="mt-4 gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Try Again
              </Button>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <HeartOff className="size-7" />
              </div>
              {totalCount === 0 ? (
                <>
                  <h3 className="mt-4 text-base font-semibold">No favorites saved yet</h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Browse our equipment catalog and click the favorite button on any item to save it here for quick rental access.
                  </p>
                  <Link
                    href="/equipment"
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "mt-5 gap-1.5"
                    )}
                  >
                    <PlusCircle className="size-4" />
                    Browse All Equipment
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-base font-semibold">No matching favorites found</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search query or clear the category filter.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
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
                      Location
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Availability
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Date Added
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(filteredFavorites || []).map((item) => {
                    const id = item._id || item.id || ""
                    const inStock = (Number(item.availableQuantity) || 0) > 0

                    return (
                      <tr key={id} className="transition-colors hover:bg-muted/40">
                        {/* 1. Equipment Name */}
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
                                  "Standard Model"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Category */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                            {item.category || "General"}
                          </span>
                        </td>

                        {/* 3. Rental Price */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.rentalPrice)}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              / {item.rentalType || "Daily"}
                            </span>
                          </div>
                        </td>

                        {/* 4. Location */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="size-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {item.location || "Available Nationwide"}
                            </span>
                          </div>
                        </td>

                        {/* 5. Availability */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                inStock ? "bg-emerald-500" : "bg-destructive"
                              )}
                            />
                            <span className="text-xs font-medium text-foreground">
                              {inStock
                                ? `${Number(item.availableQuantity) || 0} in stock`
                                : "Out of stock"}
                            </span>
                          </div>
                        </td>

                        {/* 6. Date Added */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </span>
                        </td>

                        {/* 7. Actions */}
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

                            {/* Remove Favorite Action */}
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setRemovingItem(item)}
                              title="Remove Favorite"
                              className="size-8 p-0 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400"
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">Remove Favorite</span>
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

        {/* View Details Modal */}
        {viewItem && (
          <FavoriteDetailsModal
            item={viewItem}
            onClose={() => setViewItem(null)}
            onRemove={() => {
              const target = viewItem
              setViewItem(null)
              setRemovingItem(target)
            }}
          />
        )}

        {/* Remove Confirmation Modal */}
        {removingItem && (
          <RemoveFavoriteModal
            item={removingItem}
            isRemoving={isRemoving}
            onClose={() => {
              if (!isRemoving) setRemovingItem(null)
            }}
            onConfirm={handleConfirmRemove}
          />
        )}
      </div>
  )
}

/* =========================================================================
   FAVORITE DETAILS MODAL
   ========================================================================= */
function FavoriteDetailsModal({
  item,
  onClose,
  onRemove,
}: {
  item: FavoriteItem
  onClose: () => void
  onRemove: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-2xl rounded-2xl border bg-card text-card-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Equipment Details</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Heart className="size-3 fill-rose-500/30" /> Saved
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Banner */}
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
                  {item.category || "General"}
                </span>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {item.equipmentName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {[item.brand, item.model].filter(Boolean).join(" • ") || "Standard Model"}
                </p>
              </div>

              <div className="rounded-xl bg-muted/60 p-3">
                <span className="text-xs text-muted-foreground">Rental Rate</span>
                <div className="text-2xl font-black text-foreground">
                  {formatCurrency(item.rentalPrice)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    / {item.rentalType || "Daily"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3 text-xs">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5 text-primary" /> Location
              </span>
              <p className="font-medium text-foreground">{item.location || "Nationwide"}</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Layers className="size-3.5 text-primary" /> Units Available
              </span>
              <p className="font-medium text-foreground">
                {(Number(item.availableQuantity) || 0) > 0
                  ? `${Number(item.availableQuantity)} units`
                  : "Out of stock"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5 text-primary" /> Saved On
              </span>
              <p className="font-medium text-foreground">{formatDate(item.createdAt)}</p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Equipment Description
              </h4>
              <div className="rounded-xl border bg-muted/30 p-3.5 text-xs leading-relaxed text-foreground">
                {item.description}
              </div>
            </div>
          )}

          {/* Owner info */}
          {(item.ownerName || item.ownerEmail) && (
            <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground">
              Listed by:{" "}
              <span className="font-semibold text-foreground">
                {item.ownerName || item.ownerEmail}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:bg-destructive/10"
          >
            Remove from Favorites
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Link
              href={`/equipment/${item.equipmentId || item._id || item.id}`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Rent Equipment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   REMOVE FAVORITE CONFIRMATION MODAL
   ========================================================================= */
function RemoveFavoriteModal({
  item,
  isRemoving,
  onClose,
  onConfirm,
}: {
  item: FavoriteItem
  isRemoving: boolean
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
        <div className="flex size-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <HeartOff className="size-6" />
        </div>

        <h2 className="mt-4 text-lg font-bold">Remove Favorite</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Remove{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{item.equipmentName}&rdquo;
          </span>{" "}
          from your saved favorites list?
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isRemoving}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isRemoving}
            className="gap-1.5"
          >
            {isRemoving ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Remove
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

