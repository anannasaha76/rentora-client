"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button, buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  equipmentCategories,
  type EquipmentListing,
  getAllEquipment,
  rentalTypes,
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

const safeCategories =
  equipmentCategories && equipmentCategories.length > 0
    ? equipmentCategories
    : defaultCategories

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default function AllEquipmentPage() {
  const router = useRouter()
  const { data: session } = useSession()

  // Equipment data & pagination state
  const [equipmentList, setEquipmentList] = React.useState<EquipmentListing[]>([])
  const [totalItems, setTotalItems] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Search parameters
  const [nameQuery, setNameQuery] = React.useState("")
  const [locationQuery, setLocationQuery] = React.useState("")

  // Filter parameters
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [selectedRentalType, setSelectedRentalType] = React.useState("all")
  const [minPrice, setMinPrice] = React.useState("")
  const [maxPrice, setMaxPrice] = React.useState("")
  const [availability, setAvailability] = React.useState("all")

  // Sorting parameter
  const [sortBy, setSortBy] = React.useState("recentlyAdded")

  // Mobile filter drawer toggle
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false)

  // Fetch equipment with active search, filter & sort queries from backend
  const fetchEquipment = React.useCallback(
    async (pageToLoad = 1) => {
      setLoading(true)
      setError(null)
      try {
        const response = await getAllEquipment({
          search: nameQuery.trim() || undefined,
          name: nameQuery.trim() || undefined,
          location: locationQuery.trim() || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          rentalType: selectedRentalType !== "all" ? selectedRentalType : undefined,
          minPrice: minPrice !== "" ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
          availability: availability !== "all" ? availability : undefined,
          sort: sortBy,
          page: pageToLoad,
          limit: 9, // 9 items per page (fits 3-column grid cleanly)
        })

        const items = Array.isArray(response.equipment) ? response.equipment : []
        setEquipmentList(items)
        setTotalItems(response.total ?? items.length)
        setTotalPages(response.totalPages ?? 1)
        setCurrentPage(response.page ?? pageToLoad)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load equipment."
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    },
    [
      nameQuery,
      locationQuery,
      selectedCategory,
      selectedRentalType,
      minPrice,
      maxPrice,
      availability,
      sortBy,
    ]
  )

  // Trigger fetch on filter or sort change (reset to page 1)
  React.useEffect(() => {
    fetchEquipment(1)
  }, [fetchEquipment])

  // Handle page change
  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchEquipment(newPage)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Clear all filters & search fields
  function handleResetFilters() {
    setNameQuery("")
    setLocationQuery("")
    setSelectedCategory("all")
    setSelectedRentalType("all")
    setMinPrice("")
    setMaxPrice("")
    setAvailability("all")
    setSortBy("recentlyAdded")
  }

  // Handle "View Details" Click
  function handleViewDetails(id: string) {
    if (!session) {
      toast.info("Please log in to view equipment details and book equipment.")
      router.push(`/login?callbackUrl=/equipment/${id}`)
    } else {
      router.push(`/equipment/${id}`)
    }
  }

  const hasActiveFilters =
    nameQuery !== "" ||
    locationQuery !== "" ||
    selectedCategory !== "all" ||
    selectedRentalType !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    availability !== "all" ||
    sortBy !== "recentlyAdded"

  return (
    <div className="min-h-screen bg-muted/20 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span>/</span>
              <span className="font-medium text-foreground">All Equipment</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Equipment Marketplace
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
              Discover verified heavy machinery, power tools, vehicles, and electronics ready for rent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEquipment(currentPage)}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen((prev) => !prev)}
              className="lg:hidden gap-1.5"
            >
              <SlidersHorizontal className="size-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>
        </div>

        {/* Search, Filter & Sort Controls Card */}
        <div className="mt-8 rounded-2xl border bg-card p-5 shadow-xs">
          {/* Top Search Inputs (Equipment Name & Location) */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            {/* Search by Equipment Name */}
            <div className="relative sm:col-span-1 lg:col-span-5">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Search equipment by title or category..."
                className={cn(inputClass, "pl-9")}
              />
              {nameQuery && (
                <button
                  type="button"
                  onClick={() => setNameQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Search by Location */}
            <div className="relative sm:col-span-1 lg:col-span-4">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search by location (e.g. Chicago, CA)..."
                className={cn(inputClass, "pl-9")}
              />
              {locationQuery && (
                <button
                  type="button"
                  onClick={() => setLocationQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="relative sm:col-span-2 lg:col-span-3">
              <div className="relative">
                <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={cn(inputClass, "pl-9 text-xs")}
                >
                  <option value="recentlyAdded">Recently Added</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secondary Filters Bar (Category, Rental Type, Price, Availability) */}
          <div
            className={cn(
              "mt-4 pt-4 border-t border-border/60 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
              mobileFilterOpen ? "block" : "hidden lg:grid"
            )}
          >
            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={cn(inputClass, "h-9 text-xs")}
              >
                <option value="all">All Categories</option>
                {(safeCategories || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Rental Type Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Rental Type</label>
              <select
                value={selectedRentalType}
                onChange={(e) => setSelectedRentalType(e.target.value)}
                className={cn(inputClass, "h-9 text-xs")}
              >
                <option value="all">All Rental Types</option>
                {rentalTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Price Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className={cn(inputClass, "h-9 text-xs")}
                />
                <span className="text-muted-foreground text-xs">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className={cn(inputClass, "h-9 text-xs")}
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={cn(inputClass, "h-9 text-xs")}
              >
                <option value="all">All Availability</option>
                <option value="available">In Stock (Available)</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips & Reset Bar */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">Active Filters:</span>
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground font-medium">
                    {selectedCategory}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {selectedRentalType !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground font-medium">
                    {selectedRentalType}
                    <button
                      type="button"
                      onClick={() => setSelectedRentalType("all")}
                      className="hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground font-medium">
                    ${minPrice || "0"} – ${maxPrice || "Any"}
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice("")
                        setMaxPrice("")
                      }}
                      className="hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {availability !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground font-medium">
                    {availability === "available" ? "In Stock" : "Out of Stock"}
                    <button
                      type="button"
                      onClick={() => setAvailability("all")}
                      className="hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {sortBy !== "recentlyAdded" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground font-medium">
                    Sorted
                    <button
                      type="button"
                      onClick={() => setSortBy("recentlyAdded")}
                      className="hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="xs"
                onClick={handleResetFilters}
                className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcw className="size-3" />
                Reset all filters
              </Button>
            </div>
          )}
        </div>

        {/* Results Bar */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Showing <span className="font-bold text-foreground">{equipmentList.length}</span> of{" "}
            <span className="font-bold text-foreground">{totalItems}</span> approved equipment
          </p>
          {totalPages > 1 && (
            <p>
              Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </p>
          )}
        </div>

        {/* Main 3-Column Equipment Grid */}
        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col h-[400px] rounded-2xl border bg-card p-4 animate-pulse"
                >
                  <div className="aspect-video w-full rounded-xl bg-muted" />
                  <div className="mt-4 space-y-2 flex-1">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="h-6 w-20 rounded bg-muted" />
                    <div className="h-9 w-24 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Failed to load equipment</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEquipment(currentPage)}
                className="mt-4 gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Try Again
              </Button>
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-20 text-center shadow-xs">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Package className="size-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold">No equipment found</h3>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-md">
                We couldn&apos;t find any approved equipment matching your current search and filter criteria.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-5 gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(equipmentList || []).map((item) => {
                const id = item._id || item.id || ""
                const isAvailable = (Number(item.availableQuantity) || 0) > 0

                return (
                  <div
                    key={id}
                    className="group flex flex-col h-full rounded-2xl border bg-card text-card-foreground shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Equipment Image Container */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.equipmentName}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = "none"
                          }}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <Package className="size-10" />
                        </div>
                      )}

                      {/* Category Badge (Top-Left) */}
                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs">
                          {item.category}
                        </span>
                      </div>

                      {/* Availability Status Badge (Top-Right) */}
                      <div className="absolute right-3 top-3">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-xs">
                            <CheckCircle2 className="size-3" />
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/90 px-2.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-xs">
                            <XCircle className="size-3" />
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-col flex-1 p-5 justify-between gap-4">
                      {/* Top Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="truncate font-medium">
                            {[item.brand, item.model].filter(Boolean).join(" • ") || "Verified Listing"}
                          </span>
                          <span className="shrink-0 text-[11px]">
                            {item.availableQuantity} {item.availableQuantity === 1 ? "unit" : "units"}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {item.equipmentName}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                          <MapPin className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">{item.location || "Available Nationwide"}</span>
                        </div>
                      </div>

                      {/* Card Footer: Price & View Details Button */}
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                            Rental Price
                          </span>
                          <div className="text-lg font-extrabold text-foreground leading-tight">
                            ${Number(item.rentalPrice).toLocaleString()}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              / {item.rentalType || "Daily"}
                            </span>
                          </div>
                        </div>

                        {/* View Details Button */}
                        <Button
                          onClick={() => handleViewDetails(id)}
                          size="sm"
                          className="shrink-0 font-medium shadow-xs"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className="size-9 p-0"
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="gap-1"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

