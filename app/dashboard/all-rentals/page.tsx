"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Phone,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react"
import { toast } from "react-toastify"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { Button } from "@/components/ui/button"
import {
  getAllRentals,
  type RentalBooking,
  type RentalStats,
} from "@/lib/rental"
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

function formatCurrency(amount?: number) {
  const val = Number(amount) || 0
  return `৳${val.toLocaleString()}`
}

export default function AdminAllRentalsPage() {
  const [rentals, setRentals] = React.useState<RentalBooking[]>([])
  const [stats, setStats] = React.useState<RentalStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [bookingStatusFilter, setBookingStatusFilter] = React.useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("all")

  // Modals state
  const [viewingRental, setViewingRental] = React.useState<RentalBooking | null>(null)

  // Load rentals from backend
  const loadRentals = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllRentals({
        search: searchQuery.trim() || undefined,
        bookingStatus: bookingStatusFilter !== "all" ? bookingStatusFilter : undefined,
        paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
      })
      setRentals(response.rentals || [])
      if (response.stats) {
        setStats(response.stats)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load rental bookings."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, bookingStatusFilter, paymentStatusFilter])

  React.useEffect(() => {
    loadRentals()
  }, [loadRentals])

  // Badges styling
  const getBookingStatusBadge = (status?: string) => {
    const s = (status || "Pending").toLowerCase()
    switch (s) {
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
      case "in progress":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      case "cancelled":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
      default:
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
    }
  }

  const getPaymentStatusBadge = (status?: string) => {
    const s = (status || "Pending").toLowerCase()
    switch (s) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
      case "refunded":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
      case "unpaid":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
      default:
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
    }
  }

  return (
    <AuthRouteGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                All Rentals
              </h1>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Admin Control
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor, moderate, and manage all platform equipment rental bookings, transactions, and status updates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadRentals}
              disabled={loading}
              className="gap-2 shadow-xs"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Platform Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Bookings
                </p>
                <h3 className="mt-1.5 text-2xl font-bold text-foreground">
                  {stats ? stats.totalRentals : rentals.length}
                </h3>
              </div>
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Receipt className="size-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Across all customer accounts
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Platform Revenue
                </p>
                <h3 className="mt-1.5 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats ? formatCurrency(stats.totalRevenue) : formatCurrency(
                    rentals
                      .filter((r) => r.paymentStatus === "Paid")
                      .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0)
                  )}
                </h3>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="size-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Total paid rental transactions
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Active & Confirmed
                </p>
                <h3 className="mt-1.5 text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {stats
                    ? stats.confirmedCount + stats.inProgressCount
                    : rentals.filter(
                        (r) => r.bookingStatus === "Confirmed" || r.bookingStatus === "In Progress"
                      ).length}
                </h3>
              </div>
              <div className="rounded-xl bg-sky-500/10 p-2.5 text-sky-600 dark:text-sky-400">
                <Package className="size-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Confirmed or currently in progress
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Pending / Awaiting Action
                </p>
                <h3 className="mt-1.5 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats
                    ? stats.pendingCount
                    : rentals.filter((r) => r.bookingStatus === "Pending").length}
                </h3>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Requires confirmation or verification
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by customer, owner, equipment name, phone or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border/80 bg-background/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Booking Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="size-3.5" />
                <span>Booking:</span>
              </div>
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                aria-label="Filter by Booking Status"
                className="rounded-lg border border-border/80 bg-background py-1.5 pl-2.5 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Booking Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Payment Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Payment:</span>
              </div>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                aria-label="Filter by Payment Status"
                className="rounded-lg border border-border/80 bg-background py-1.5 pl-2.5 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Refunded">Refunded</option>
              </select>

              {(searchQuery || bookingStatusFilter !== "all" || paymentStatusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setBookingStatusFilter("all")
                    setPaymentStatusFilter("all")
                  }}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Failed to fetch rental records</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRentals}
              className="border-destructive/30 hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Rentals Table */}
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="border-b border-border/70 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3.5">
                    Customer Information
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Owner Information
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Equipment Name
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Rental Duration
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
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && rentals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="size-6 animate-spin text-primary" />
                        <p className="text-sm">Loading rental booking records...</p>
                      </div>
                    </td>
                  </tr>
                ) : rentals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-center">
                        <div className="rounded-full bg-muted p-3 text-muted-foreground">
                          <Package className="size-6" />
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          No rental records found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery || bookingStatusFilter !== "all" || paymentStatusFilter !== "all"
                            ? "Try adjusting your search criteria or reset filters."
                            : "No customer bookings have been recorded in the platform yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rentals.map((rental) => {
                    const id = rental._id || rental.id || ""

                    return (
                      <tr
                        key={id}
                        className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
                      >
                        {/* Customer Information */}
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground">
                              {rental.customerName || "Anonymous Customer"}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="size-3 shrink-0" />
                              <span className="truncate max-w-[160px]" title={rental.customerEmail}>
                                {rental.customerEmail || "No email"}
                              </span>
                            </div>
                            {rental.customerPhone && rental.customerPhone !== "N/A" && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="size-3 shrink-0" />
                                <span>{rental.customerPhone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Owner Information */}
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">
                              {rental.ownerName || "Platform Owner"}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="size-3 shrink-0" />
                              <span className="truncate max-w-[160px]" title={rental.ownerEmail}>
                                {rental.ownerEmail || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Equipment Name */}
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex items-start gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                              {rental.equipmentImage ? (
                                <Image
                                  src={rental.equipmentImage}
                                  alt={rental.equipmentName}
                                  fill
                                  unoptimized
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                                  <Package className="size-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span
                                className="font-medium text-foreground truncate max-w-[180px]"
                                title={rental.equipmentName}
                              >
                                {rental.equipmentName}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground/80">
                                  {rental.equipmentCategory || "Equipment"}
                                </span>
                                {rental.equipmentId && (
                                  <Link
                                    href={`/equipment/${rental.equipmentId}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-0.5 text-primary hover:underline"
                                    title="View public equipment page"
                                  >
                                    <span>View</span>
                                    <ExternalLink className="size-2.5" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Rental Duration */}
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1 font-medium text-foreground">
                              <Calendar className="size-3.5 text-primary shrink-0" />
                              <span>{formatDate(rental.startDate)}</span>
                              <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                              <span>{formatDate(rental.endDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                {rental.durationDays || 1} day{(rental.durationDays || 1) > 1 ? "s" : ""}
                              </span>
                              <span>•</span>
                              <span>Qty: {rental.requiredQuantity || 1}</span>
                            </div>
                          </div>
                        </td>

                        {/* Booking Amount */}
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-foreground">
                              {formatCurrency(rental.totalAmount)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {rental.rentalPrice ? `${formatCurrency(rental.rentalPrice)} / ${rental.rentalType || "day"}` : "Flat total"}
                            </span>
                          </div>
                        </td>

                        {/* Payment Status */}
                        <td className="px-4 py-3.5 align-top">
                          <span
                            className={cn(
                              "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                              getPaymentStatusBadge(rental.paymentStatus)
                            )}
                          >
                            {rental.paymentStatus || "Pending"}
                          </span>
                        </td>

                        {/* Booking Status */}
                        <td className="px-4 py-3.5 align-top">
                          <span
                            className={cn(
                              "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                              getBookingStatusBadge(rental.bookingStatus)
                            )}
                          >
                            {rental.bookingStatus || "Pending"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Full Details */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingRental(rental)}
                              title="View full booking receipt & details"
                              className="size-8 text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count indicator */}
          <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <span>
              Showing <span className="font-semibold text-foreground">{rentals.length}</span> rental booking records
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500"></span> Confirmed / Paid
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500"></span> Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-500"></span> Cancelled
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODAL 1: VIEW FULL DETAILS MODAL
            ========================================================================= */}
        {viewingRental && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Receipt className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Rental Booking Details
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Booking ID: {viewingRental._id || viewingRental.id}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewingRental(null)}
                  className="size-8 rounded-full"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="mt-5 space-y-6">
                {/* Equipment Overview Banner */}
                <div className="flex items-start gap-4 rounded-xl border border-border/70 bg-muted/30 p-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {viewingRental.equipmentImage ? (
                      <Image
                        src={viewingRental.equipmentImage}
                        alt={viewingRental.equipmentName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                        <Package className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-foreground">
                        {viewingRental.equipmentName}
                      </h4>
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(viewingRental.totalAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Category: {viewingRental.equipmentCategory || "General Equipment"}
                    </p>
                    {viewingRental.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3 text-primary" />
                        <span>{viewingRental.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border/70 bg-card p-3">
                    <p className="text-xs text-muted-foreground">Booking Status</p>
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                        getBookingStatusBadge(viewingRental.bookingStatus)
                      )}
                    >
                      {viewingRental.bookingStatus || "Pending"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-3">
                    <p className="text-xs text-muted-foreground">Payment Status</p>
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                        getPaymentStatusBadge(viewingRental.paymentStatus)
                      )}
                    >
                      {viewingRental.paymentStatus || "Pending"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-3">
                    <p className="text-xs text-muted-foreground">Rental Duration</p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {viewingRental.durationDays || 1} day{(viewingRental.durationDays || 1) > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-3">
                    <p className="text-xs text-muted-foreground">Quantity Rented</p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {viewingRental.requiredQuantity || 1} unit(s)
                    </p>
                  </div>
                </div>

                {/* Customer & Owner Info Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Customer Information */}
                  <div className="rounded-xl border border-border/80 bg-card p-4">
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <User className="size-4 text-primary" />
                      <span>Customer Details</span>
                    </h5>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="font-semibold text-foreground">
                          {viewingRental.customerName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="text-foreground">{viewingRental.customerEmail || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="text-foreground">{viewingRental.customerPhone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Delivery / Pickup Address</p>
                        <p className="text-foreground">{viewingRental.deliveryAddress || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner Information */}
                  <div className="rounded-xl border border-border/80 bg-card p-4">
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <ShieldCheck className="size-4 text-primary" />
                      <span>Owner Details</span>
                    </h5>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Owner Name</p>
                        <p className="font-semibold text-foreground">
                          {viewingRental.ownerName || "Platform / Unassigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Owner Email</p>
                        <p className="text-foreground">{viewingRental.ownerEmail || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Booking Created</p>
                        <p className="text-foreground">{formatDate(viewingRental.createdAt)}</p>
                      </div>
                      {viewingRental.updatedAt && (
                        <div>
                          <p className="text-xs text-muted-foreground">Last Updated</p>
                          <p className="text-foreground">{formatDate(viewingRental.updatedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                {viewingRental.additionalNotes && (
                  <div className="rounded-xl border border-border/80 bg-card p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Customer Special Instructions / Notes
                    </p>
                    <p className="mt-1 text-sm text-foreground whitespace-pre-line">
                      {viewingRental.additionalNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-border/80 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-2"
                >
                  <Printer className="size-4" />
                  <span>Print Receipt</span>
                </Button>
                <Button onClick={() => setViewingRental(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthRouteGuard>
  )
}
