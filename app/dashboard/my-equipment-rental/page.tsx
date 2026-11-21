"use client"

import * as React from "react"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Filter,
  Layers,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "react-toastify"

import { OwnerRouteGuard } from "@/components/owner-route-guard"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  type BookingStatus,
  getOwnerRentals,
  type PaymentStatus,
  type RentalBooking,
  updateRentalStatus,
} from "@/lib/rental"
import { cn } from "@/lib/utils"

const inputClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"

const bookingStatuses: BookingStatus[] = [
  "Pending",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
]

function PaymentBadge({ status }: { status?: PaymentStatus | string }) {
  const current = status || "Unpaid"
  if (current === "Paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3" />
        Paid
      </span>
    )
  }
  if (current === "Refunded") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
        Refunded
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
      <Clock className="size-3" />
      {current}
    </span>
  )
}

function BookingBadge({ status }: { status?: BookingStatus | string }) {
  const current = status || "Pending"
  if (current === "Confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
        <CheckCircle2 className="size-3" />
        Confirmed
      </span>
    )
  }
  if (current === "In Progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
        <RefreshCw className="size-3 animate-spin" />
        In Progress
      </span>
    )
  }
  if (current === "Completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3" />
        Completed
      </span>
    )
  }
  if (current === "Cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
        <XCircle className="size-3" />
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
      <Clock className="size-3" />
      Pending
    </span>
  )
}

export default function MyEquipmentRentalPage() {
  const { data: session } = useSession()
  const [rentals, setRentals] = React.useState<RentalBooking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedBookingStatus, setSelectedBookingStatus] = React.useState<string>("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>("all")

  // Modal for viewing full booking details
  const [viewRental, setViewRental] = React.useState<RentalBooking | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const ownerEmail = session?.user?.email || ""
  const ownerId = session?.user?.id || ""

  const fetchRentals = React.useCallback(async () => {
    if (!ownerEmail && !ownerId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getOwnerRentals(ownerEmail, ownerId)
      setRentals(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load equipment rentals."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [ownerEmail, ownerId])

  React.useEffect(() => {
    if (ownerEmail || ownerId) {
      fetchRentals()
    } else {
      setLoading(false)
    }
  }, [ownerEmail, ownerId, fetchRentals])

  // Prevent background scroll when modal is active
  React.useEffect(() => {
    if (viewRental) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [viewRental])

  // Handle status update
  async function handleStatusChange(rentalId: string, newStatus: BookingStatus) {
    setUpdatingId(rentalId)
    try {
      const res = await updateRentalStatus(rentalId, { bookingStatus: newStatus })
      setRentals((prev) =>
        (prev || []).map((r) =>
          (r._id || r.id) === rentalId ? { ...r, ...res.rental } : r
        )
      )
      if (viewRental && (viewRental._id || viewRental.id) === rentalId) {
        setViewRental((prev) => (prev ? { ...prev, bookingStatus: newStatus } : null))
      }
      toast.success(`Booking status updated to ${newStatus}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update booking status.")
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtered rentals
  const filteredRentals = React.useMemo(() => {
    if (!Array.isArray(rentals)) return []
    return rentals.filter((r) => {
      if (!r) return false
      const q = (searchQuery || "").toLowerCase()
      const matchesSearch =
        q === "" ||
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.customerEmail || "").toLowerCase().includes(q) ||
        (r.customerPhone || "").toLowerCase().includes(q) ||
        (r.equipmentName || "").toLowerCase().includes(q)

      const matchesBookingStatus =
        selectedBookingStatus === "all" ||
        (r.bookingStatus || "Pending") === selectedBookingStatus

      const matchesPaymentStatus =
        selectedPaymentStatus === "all" ||
        (r.paymentStatus || "Unpaid") === selectedPaymentStatus

      return matchesSearch && matchesBookingStatus && matchesPaymentStatus
    })
  }, [rentals, searchQuery, selectedBookingStatus, selectedPaymentStatus])

  // Aggregate Stats
  const safeRentals = Array.isArray(rentals) ? rentals : []
  const totalBookings = safeRentals.length
  const activeRentals = safeRentals.filter((r) =>
    ["Confirmed", "In Progress"].includes(r?.bookingStatus || "")
  ).length
  const completedRentals = safeRentals.filter(
    (r) => r?.bookingStatus === "Completed"
  ).length
  const totalRevenue = safeRentals
    .filter((r) => r?.paymentStatus === "Paid")
    .reduce((sum, r) => sum + (Number(r?.totalAmount) || 0), 0)

  return (
    <OwnerRouteGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Equipment Rental</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review rental requests and monitor equipment bookings placed by customers.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRentals}
            disabled={loading}
            className="w-fit gap-1.5"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Rentals</span>
              <Package className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{totalBookings}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
              <span className="text-xs font-medium">Active Rentals</span>
              <Clock className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{activeRentals}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-medium">Completed</span>
              <CheckCircle2 className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{completedRentals}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-medium">Total Paid Revenue</span>
              <DollarSign className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Toolbar: Search and Status Filters */}
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer or equipment..."
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

            {/* Booking Status Filter */}
            <select
              value={selectedBookingStatus}
              onChange={(e) => setSelectedBookingStatus(e.target.value)}
              className={cn(inputClass, "h-9 w-auto text-xs")}
            >
              <option value="all">All Booking Status</option>
              {bookingStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Payment Status Filter */}
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className={cn(inputClass, "h-9 w-auto text-xs")}
            >
              <option value="all">All Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Rentals Table */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Loading rental requests...</p>
              <p className="text-xs text-muted-foreground">Fetching records from server</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Failed to load rentals</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRentals}
                className="mt-4 gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Try Again
              </Button>
            </div>
          ) : filteredRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Package className="size-7" />
              </div>
              {totalBookings === 0 ? (
                <>
                  <h3 className="mt-4 text-base font-semibold">No equipment rentals yet</h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    When customers book and rent your equipment, rental records with customer and duration information will appear here.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-base font-semibold">No matching rentals found</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search terms or status filters.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedBookingStatus("all")
                      setSelectedPaymentStatus("all")
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
                      Customer Information
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Equipment Information
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Rental Duration
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Required Quantity
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Booking Amount
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Payment Status
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Booking Status
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:px-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(filteredRentals || []).map((rental) => {
                    const id = rental._id || rental.id || ""
                    const isUpdating = updatingId === id

                    return (
                      <tr key={id} className="transition-colors hover:bg-muted/40">
                        {/* 1. Customer Information */}
                        <td className="px-4 py-3.5 sm:px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {(rental.customerName || "C").charAt(0).toUpperCase()}
                              </span>
                              <span className="font-semibold text-foreground">
                                {rental.customerName || "Customer"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="size-3" />
                              <span className="truncate max-w-[160px]">
                                {rental.customerEmail || "N/A"}
                              </span>
                            </div>
                            {rental.customerPhone && rental.customerPhone !== "N/A" && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="size-3" />
                                <span>{rental.customerPhone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 2. Equipment Information */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted">
                              {rental.equipmentImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={rental.equipmentImage}
                                  alt={rental.equipmentName}
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
                                {rental.equipmentName}
                              </p>
                              {rental.equipmentCategory && (
                                <span className="inline-block rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                  {rental.equipmentCategory}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Rental Duration */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                              <Calendar className="size-3.5 text-muted-foreground" />
                              <span>{rental.startDate || "N/A"}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              to <span className="font-medium text-foreground">{rental.endDate || "N/A"}</span>
                            </div>
                            {rental.durationDays && (
                              <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {rental.durationDays} {rental.durationDays === 1 ? "day" : "days"}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Required Quantity */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Layers className="size-3.5 text-muted-foreground" />
                            <span className="font-semibold text-foreground">
                              {rental.requiredQuantity || 1}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {(rental.requiredQuantity || 1) === 1 ? "unit" : "units"}
                            </span>
                          </div>
                        </td>

                        {/* 5. Booking Amount */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-foreground">
                            ${Number(rental.totalAmount || 0).toLocaleString()}
                          </div>
                        </td>

                        {/* 6. Payment Status */}
                        <td className="px-4 py-3.5">
                          <PaymentBadge status={rental.paymentStatus} />
                        </td>

                        {/* 7. Booking Status */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <select
                              value={rental.bookingStatus || "Pending"}
                              onChange={(e) =>
                                handleStatusChange(id, e.target.value as BookingStatus)
                              }
                              disabled={isUpdating}
                              className={cn(
                                "h-8 rounded-lg border border-input bg-background px-2 text-xs font-medium outline-none transition-colors focus-visible:border-ring",
                                isUpdating && "opacity-50"
                              )}
                            >
                              {bookingStatuses.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            {isUpdating && <RefreshCw className="size-3 animate-spin text-primary" />}
                          </div>
                        </td>

                        {/* Action Column */}
                        <td className="px-4 py-3.5 text-right sm:px-6">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setViewRental(rental)}
                            title="View Full Booking Details"
                            className="size-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="size-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Rental Details Modal */}
        {viewRental && (
          <RentalDetailsModal
            rental={viewRental}
            onClose={() => setViewRental(null)}
            onStatusChange={(newStatus) => {
              const id = viewRental._id || viewRental.id
              if (id) handleStatusChange(id, newStatus)
            }}
          />
        )}
      </div>
    </OwnerRouteGuard>
  )
}

/* =========================================================================
   RENTAL DETAILS MODAL
   ========================================================================= */
function RentalDetailsModal({
  rental,
  onClose,
  onStatusChange,
}: {
  rental: RentalBooking
  onClose: () => void
  onStatusChange: (status: BookingStatus) => void
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
            <h2 className="text-lg font-bold">Rental Booking Details</h2>
            <BookingBadge status={rental.bookingStatus} />
            <PaymentBadge status={rental.paymentStatus} />
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
          {/* Equipment Banner */}
          <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
              {rental.equipmentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={rental.equipmentImage}
                  alt={rental.equipmentName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <Package className="size-6" />
                </div>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-primary">
                {rental.equipmentCategory || "Equipment"}
              </span>
              <h3 className="text-base font-bold text-foreground">
                {rental.equipmentName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Requested Quantity:{" "}
                <span className="font-semibold text-foreground">
                  {rental.requiredQuantity || 1} units
                </span>
              </p>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer Information
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="size-3.5 text-primary" /> Full Name
                </span>
                <p className="font-medium text-foreground">{rental.customerName || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="size-3.5 text-primary" /> Email Address
                </span>
                <p className="font-medium text-foreground">{rental.customerEmail || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="size-3.5 text-primary" /> Contact Phone
                </span>
                <p className="font-medium text-foreground">{rental.customerPhone || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" /> Delivery Address
                </span>
                <p className="font-medium text-foreground">{rental.deliveryAddress || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Rental Duration & Financials */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border bg-card p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rental Period
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-xs text-muted-foreground">
                  Start: <span className="font-semibold text-foreground">{rental.startDate}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  End: <span className="font-semibold text-foreground">{rental.endDate}</span>
                </p>
                {rental.durationDays && (
                  <p className="text-xs text-muted-foreground">
                    Duration:{" "}
                    <span className="font-semibold text-foreground">
                      {rental.durationDays} Days
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border bg-card p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Payment Breakdown
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment Status:</span>
                  <PaymentBadge status={rental.paymentStatus} />
                </div>
                <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                  <span>Total Amount:</span>
                  <span>${Number(rental.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {rental.additionalNotes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer Notes / Special Requests
              </h4>
              <div className="rounded-xl border bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                {rental.additionalNotes}
              </div>
            </div>
          )}

          {/* Quick Status Update */}
          <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Update Booking Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {bookingStatuses.map((status) => (
                <Button
                  key={status}
                  variant={rental.bookingStatus === status ? "default" : "outline"}
                  size="xs"
                  onClick={() => onStatusChange(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
