"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BangladeshiTaka,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Filter,
  Layers,
  Mail,
  MapPin,
  Package,
  PlusCircle,
  Receipt,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button, buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  type BookingStatus,
  getCustomerRentals,
  type PaymentStatus,
  type RentalBooking,
} from "@/lib/rental"
import { cn } from "@/lib/utils"

const inputClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"

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

export default function MyRentalsPage() {
  const { data: session } = useSession()
  const [rentals, setRentals] = React.useState<RentalBooking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedBookingStatus, setSelectedBookingStatus] = React.useState<string>("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>("all")

  // Modal
  const [viewRental, setViewRental] = React.useState<RentalBooking | null>(null)

  const customerEmail = session?.user?.email || ""
  const customerId = session?.user?.id || ""

  const fetchRentals = React.useCallback(async () => {
    if (!customerEmail && !customerId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getCustomerRentals(customerEmail, customerId)
      setRentals(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load rental bookings."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [customerEmail, customerId])

  React.useEffect(() => {
    if (customerEmail || customerId) {
      fetchRentals()
    } else {
      setLoading(false)
    }
  }, [customerEmail, customerId, fetchRentals])

  // Prevent background scrolling when modal is open
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

  // Filtered list
  const filteredRentals = React.useMemo(() => {
    if (!Array.isArray(rentals)) return []
    return rentals.filter((r) => {
      if (!r) return false
      const q = (searchQuery || "").toLowerCase()
      const matchesSearch =
        q === "" ||
        (r.equipmentName || "").toLowerCase().includes(q) ||
        (r.equipmentCategory || "").toLowerCase().includes(q) ||
        (r.ownerName || "").toLowerCase().includes(q)

      const matchesBookingStatus =
        selectedBookingStatus === "all" ||
        (r.bookingStatus || "Pending") === selectedBookingStatus

      const matchesPaymentStatus =
        selectedPaymentStatus === "all" ||
        (r.paymentStatus || "Unpaid") === selectedPaymentStatus

      return matchesSearch && matchesBookingStatus && matchesPaymentStatus
    })
  }, [rentals, searchQuery, selectedBookingStatus, selectedPaymentStatus])

  // Metric stats
  const safeRentals = Array.isArray(rentals) ? rentals : []
  const totalCount = safeRentals.length
  const activeCount = safeRentals.filter((r) =>
    ["Confirmed", "In Progress"].includes(r?.bookingStatus || "")
  ).length
  const completedCount = safeRentals.filter(
    (r) => r?.bookingStatus === "Completed"
  ).length
  const totalSpent = safeRentals
    .filter((r) => r?.paymentStatus === "Paid")
    .reduce((sum, r) => sum + (Number(r?.totalAmount) || 0), 0)

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Rentals</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your equipment bookings, active rentals, and payment history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRentals}
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
              Browse Equipment
            </Link>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Bookings</span>
              <Receipt className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
              <span className="text-xs font-medium">Active Rentals</span>
              <Clock className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{activeCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-medium">Completed</span>
              <CheckCircle2 className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{completedCount}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-medium">Total Spent</span>
              <BangladeshiTaka className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">৳{totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by equipment name..."
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
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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

        {/* Table Content */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Loading your rentals...</p>
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
              {totalCount === 0 ? (
                <>
                  <h3 className="mt-4 text-base font-semibold">No equipment rented yet</h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    You haven&apos;t booked any equipment yet. Explore our marketplace to find the perfect equipment for your needs.
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
                  <h3 className="mt-4 text-base font-semibold">No matching rentals found</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search query or clear your status filters.
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
                      Equipment Name
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Rental Start Date
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Rental End Date
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Booking Date
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Total Amount
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
                    return (
                      <tr key={id} className="transition-colors hover:bg-muted/40">
                        {/* 1. Equipment Name */}
                        <td className="px-4 py-3.5 sm:px-6">
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

                        {/* 2. Rental Start Date */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            <span>{formatDate(rental.startDate)}</span>
                          </div>
                        </td>

                        {/* 3. Rental End Date */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            <span>{formatDate(rental.endDate)}</span>
                          </div>
                        </td>

                        {/* 4. Booking Date */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(rental.createdAt)}
                          </span>
                        </td>

                        {/* 5. Total Amount */}
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground">
                            ৳{Number(rental.totalAmount || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* 6. Payment Status */}
                        <td className="px-4 py-3.5">
                          <PaymentBadge status={rental.paymentStatus} />
                        </td>

                        {/* 7. Booking Status */}
                        <td className="px-4 py-3.5">
                          <BookingBadge status={rental.bookingStatus} />
                        </td>

                        {/* Action Column */}
                        <td className="px-4 py-3.5 text-right sm:px-6">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setViewRental(rental)}
                            title="View Booking Details"
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

        {/* View Rental Modal */}
        {viewRental && (
          <CustomerRentalDetailsModal
            rental={viewRental}
            onClose={() => setViewRental(null)}
          />
        )}
      </div>
  )
}

/* =========================================================================
   CUSTOMER RENTAL DETAILS MODAL
   ========================================================================= */
function CustomerRentalDetailsModal({
  rental,
  onClose,
}: {
  rental: RentalBooking
  onClose: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-xl rounded-2xl border bg-card text-card-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Rental Booking Summary</h2>
            <BookingBadge status={rental.bookingStatus} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
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
                Quantity Booked:{" "}
                <span className="font-semibold text-foreground">
                  {rental.requiredQuantity || 1} units
                </span>
              </p>
            </div>
          </div>

          {/* Booking & Rental Schedule */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-xl border bg-card p-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Calendar className="size-3.5 text-primary" /> Rental Duration
              </span>
              <p className="mt-1 font-semibold text-foreground">
                {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
              </p>
              {rental.durationDays && (
                <p className="text-[11px] text-muted-foreground">
                  Total {rental.durationDays} days
                </p>
              )}
            </div>

            <div className="space-y-1 rounded-xl border bg-card p-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Clock className="size-3.5 text-primary" /> Booking Date
              </span>
              <p className="mt-1 font-semibold text-foreground">
                {formatDate(rental.createdAt)}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                ID: {rental._id || rental.id}
              </p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Summary
            </h4>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Payment Status:</span>
                <PaymentBadge status={rental.paymentStatus} />
              </div>
              <div className="flex items-center justify-between border-t pt-2 font-bold text-foreground">
                <span>Total Amount Paid:</span>
                <span className="text-base">
                  ৳{Number(rental.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Owner Details */}
          <div className="space-y-3 rounded-xl border bg-card p-4 text-xs">
            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground">
              Rental & Delivery Info
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Delivery Address:</span>
                <p className="font-medium text-foreground">
                  {rental.deliveryAddress || "Standard pickup/dispatch"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Owner Contact:</span>
                <p className="font-medium text-foreground">
                  {rental.ownerName || rental.ownerEmail || "Equipment Owner"}
                </p>
              </div>
            </div>
            {rental.additionalNotes && (
              <div className="border-t pt-2">
                <span className="text-muted-foreground">Your Notes:</span>
                <p className="mt-0.5 text-foreground">{rental.additionalNotes}</p>
              </div>
            )}
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

