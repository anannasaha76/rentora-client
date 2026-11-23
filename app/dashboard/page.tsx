"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BangladeshiTaka,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Layers,
  Package,
  PlusCircle,
  Receipt,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  getAdminAnalytics,
  getOwnerAnalytics,
  type AdminAnalyticsResponse,
  type MonthlyBookingStat,
  type OwnerAnalyticsResponse,
} from "@/lib/analytics"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

function formatCurrency(amount?: number) {
  const val = Number(amount) || 0
  return `৳${val.toLocaleString()}`
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

// Quick Navigation Cards
const ownerCards = [
  {
    href: "/dashboard/add-equipment",
    title: "Add Equipment",
    description: "Create a new rental listing for equipment with specifications and pricing.",
    icon: PlusCircle,
  },
  {
    href: "/dashboard/my-equipment",
    title: "My Equipment",
    description: "Review and manage all listed equipment inventory, stock, and status.",
    icon: Package,
  },
  {
    href: "/dashboard/my-equipment-rental",
    title: "My Equipment Rental",
    description: "Track incoming rental requests and monitor customer bookings.",
    icon: Receipt,
  },
  {
    href: "/dashboard/my-profile",
    title: "My Profile",
    description: "View and update your equipment owner account details and contacts.",
    icon: UserRound,
  },
]

const customerCards = [
  {
    href: "/dashboard/my-rentals",
    title: "My Rentals",
    description: "View and manage all your active and past equipment rental bookings.",
    icon: Receipt,
  },
  {
    href: "/dashboard/favorites",
    title: "Favorites",
    description: "Browse equipment listings you have saved for upcoming projects.",
    icon: Heart,
  },
  {
    href: "/equipment",
    title: "Browse Catalog",
    description: "Discover new gear, tools, and industrial machinery available for rent.",
    icon: Package,
  },
  {
    href: "/dashboard/my-profile",
    title: "My Profile",
    description: "Manage your contact info, delivery address, and account preferences.",
    icon: UserRound,
  },
]

const adminCards = [
  {
    href: "/dashboard/all-users",
    title: "All Users",
    description: "Manage registered customers, equipment owners, and administrators.",
    icon: Users,
  },
  {
    href: "/dashboard/all-equipment",
    title: "All Equipment",
    description: "Review, approve, reject, or moderate equipment listings platform-wide.",
    icon: Package,
  },
  {
    href: "/dashboard/all-rentals",
    title: "All Rentals",
    description: "Monitor global transactions and manage all platform rental activities.",
    icon: Receipt,
  },
  {
    href: "/dashboard/my-profile",
    title: "My Profile",
    description: "Update administrator credentials, security, and contact details.",
    icon: UserRound,
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const role = session?.user?.role || "customer"
  const userEmail = session?.user?.email || ""

  // Admin analytics state
  const [adminData, setAdminData] = React.useState<AdminAnalyticsResponse | null>(null)
  // Owner analytics state
  const [ownerData, setOwnerData] = React.useState<OwnerAnalyticsResponse | null>(null)

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch analytics data based on role
  const loadAnalytics = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (role === "admin") {
        const data = await getAdminAnalytics()
        setAdminData(data)
      } else if (role === "owner" && userEmail) {
        const data = await getOwnerAnalytics(userEmail)
        setOwnerData(data)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard analytics."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [role, userEmail])

  React.useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const quickCards =
    role === "owner" ? ownerCards : role === "admin" ? adminCards : customerCards

  return (
    <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {role === "admin"
                  ? "Admin Platform Analytics"
                  : role === "owner"
                  ? "Owner Rental Analytics"
                  : "Customer Dashboard"}
              </h1>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                {role} View
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {role === "admin"
                ? "Real-time platform performance, user registrations, bookings, and financial analytics."
                : role === "owner"
                ? "Track your individual equipment performance, rental volume, and revenue earnings."
                : "Manage your equipment rentals, saved favorites, and account details."}
            </p>
          </div>

          {(role === "admin" || role === "owner") && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadAnalytics}
              disabled={loading}
              className="gap-2 shadow-xs"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              <span>Refresh Analytics</span>
            </Button>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Failed to load analytics data</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAnalytics}
              className="border-destructive/30 hover:bg-destructive/10"
            >
              Retry
            </Button>
          </div>
        )}

        {/* =====================================================================
            1. ADMIN ANALYTICS DASHBOARD
            ===================================================================== */}
        {role === "admin" && (
          <div className="space-y-6">
            {/* 6 Key Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {/* Total Users */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Users
                  </span>
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Users className="size-4" />
                  </div>
                </div>
                <h3 className="mt-2 text-2xl font-bold text-foreground">
                  {loading ? "..." : adminData?.summary.totalUsers ?? 0}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {adminData
                    ? `${adminData.usersBreakdown.customerCount} customers, ${adminData.usersBreakdown.ownerCount} owners`
                    : "Registered users"}
                </p>
              </div>

              {/* Total Equipment */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Equipment
                  </span>
                  <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400">
                    <Package className="size-4" />
                  </div>
                </div>
                <h3 className="mt-2 text-2xl font-bold text-foreground">
                  {loading ? "..." : adminData?.summary.totalEquipment ?? 0}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {adminData
                    ? `${adminData.equipmentBreakdown.approvedEquipment} active listings`
                    : "Across all categories"}
                </p>
              </div>

              {/* Total Bookings */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Bookings
                  </span>
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                    <Receipt className="size-4" />
                  </div>
                </div>
                <h3 className="mt-2 text-2xl font-bold text-foreground">
                  {loading ? "..." : adminData?.summary.totalBookings ?? 0}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {adminData
                    ? `${adminData.bookingsBreakdown.paidBookingsCount} paid bookings`
                    : "Platform rental orders"}
                </p>
              </div>

              {/* Pending Approvals */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pending Approval
                  </span>
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                    <Clock className="size-4" />
                  </div>
                </div>
                <h3 className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {loading ? "..." : adminData?.summary.pendingApprovals ?? 0}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Requires moderation
                </p>
              </div>

              {/* Completed Rentals */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Completed
                  </span>
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                  </div>
                </div>
                <h3 className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {loading ? "..." : adminData?.summary.completedRentals ?? 0}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Successfully fulfilled
                </p>
              </div>

              {/* Total Revenue */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Revenue
                  </span>
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <BangladeshiTaka className="size-4" />
                  </div>
                </div>
                <h3 className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  {loading ? "..." : formatCurrency(adminData?.summary.totalRevenue)}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total paid transactions
                </p>
              </div>
            </div>

            {/* Monthly Booking & Revenue Trends Visual Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Monthly Stats Chart / Bar Breakdown */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                      <BarChart3 className="size-5 text-primary" />
                      <span>Monthly Booking & Revenue Trends</span>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Booking frequency and platform earnings over the past 6 months
                    </p>
                  </div>
                  <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    Last 6 Months
                  </span>
                </div>

                {loading ? (
                  <div className="flex h-56 items-center justify-center">
                    <RefreshCw className="size-6 animate-spin text-primary" />
                  </div>
                ) : !adminData?.monthlyBookingStats || adminData.monthlyBookingStats.length === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    No monthly trend data recorded yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {adminData.monthlyBookingStats.map((item: MonthlyBookingStat) => {
                      const maxRevenue = Math.max(
                        ...adminData.monthlyBookingStats.map((m) => m.revenue),
                        1000
                      )
                      const revenuePercent = Math.min(
                        100,
                        Math.round((item.revenue / maxRevenue) * 100)
                      )

                      return (
                        <div key={item.key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">
                              {item.label}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">
                                {item.bookings} booking{item.bookings === 1 ? "" : "s"}
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(item.revenue)}
                              </span>
                            </div>
                          </div>
                          {/* Progress bar visual */}
                          <div className="h-3 w-full overflow-hidden rounded-full bg-muted/70">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                              style={{ width: `${Math.max(revenuePercent, item.bookings > 0 ? 5 : 2)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Platform Distribution & Ratios */}
              <div className="space-y-6">
                {/* Equipment Status Distribution */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Package className="size-4 text-primary" />
                    <span>Equipment Moderation</span>
                  </h4>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Approved</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {adminData?.equipmentBreakdown.approvedEquipment ?? 0}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${
                              adminData?.equipmentBreakdown.totalEquipment
                                ? Math.round(
                                    (adminData.equipmentBreakdown.approvedEquipment /
                                      adminData.equipmentBreakdown.totalEquipment) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Pending Approval</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {adminData?.equipmentBreakdown.pendingApprovals ?? 0}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{
                            width: `${
                              adminData?.equipmentBreakdown.totalEquipment
                                ? Math.round(
                                    (adminData.equipmentBreakdown.pendingApprovals /
                                      adminData.equipmentBreakdown.totalEquipment) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Rejected</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {adminData?.equipmentBreakdown.rejectedEquipment ?? 0}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-rose-500"
                          style={{
                            width: `${
                              adminData?.equipmentBreakdown.totalEquipment
                                ? Math.round(
                                    (adminData.equipmentBreakdown.rejectedEquipment /
                                      adminData.equipmentBreakdown.totalEquipment) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Roles Ratio */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Users className="size-4 text-primary" />
                    <span>User Roles Breakdown</span>
                  </h4>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Customers</p>
                      <p className="mt-1 text-base font-bold text-foreground">
                        {adminData?.usersBreakdown.customerCount ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Owners</p>
                      <p className="mt-1 text-base font-bold text-foreground">
                        {adminData?.usersBreakdown.ownerCount ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Admins</p>
                      <p className="mt-1 text-base font-bold text-foreground">
                        {adminData?.usersBreakdown.adminCount ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Platform Bookings */}
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
              <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
                <div>
                  <h3 className="font-bold text-foreground">Recent Rental Activities</h3>
                  <p className="text-xs text-muted-foreground">
                    Latest booking transactions recorded across Rentora
                  </p>
                </div>
                <Link
                  href="/dashboard/all-rentals"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>View All Rentals</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3">Equipment</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Owner</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Booking Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {!adminData?.recentBookings || adminData.recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                          No recent booking transactions.
                        </td>
                      </tr>
                    ) : (
                      adminData.recentBookings.map((b) => (
                        <tr key={b._id || b.id} className="hover:bg-muted/30">
                          <td className="px-6 py-3.5 font-medium text-foreground">
                            {b.equipmentName}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {b.customerName}
                            </span>
                            <br />
                            {b.customerEmail}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {b.ownerName || "Platform"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-muted-foreground">
                            {formatDate(b.startDate)} - {formatDate(b.endDate)}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-foreground">
                            {formatCurrency(b.totalAmount)}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                b.bookingStatus === "Confirmed"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : b.bookingStatus === "In Progress"
                                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                                  : b.bookingStatus === "Completed"
                                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                  : b.bookingStatus === "Cancelled"
                                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              )}
                            >
                              {b.bookingStatus || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            2. OWNER ANALYTICS DASHBOARD
            ===================================================================== */}
        {role === "owner" && (
          <div className="space-y-6">
            {/* 4 Key Metric Cards for Equipment Owner */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Listed Equipment */}
              <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Listed Equipment
                  </span>
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Package className="size-5" />
                  </div>
                </div>
                <h3 className="mt-2 text-3xl font-bold text-foreground">
                  {loading ? "..." : ownerData?.summary.totalListedEquipment ?? 0}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ownerData
                    ? `${ownerData.equipmentBreakdown.approvedEquipment} approved, ${ownerData.equipmentBreakdown.pendingApprovals} pending`
                    : "In your inventory"}
                </p>
              </div>

              {/* Completed Rentals */}
              <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Completed Rentals
                  </span>
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="size-5" />
                  </div>
                </div>
                <h3 className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {loading ? "..." : ownerData?.summary.completedRentals ?? 0}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Successfully returned & fulfilled
                </p>
              </div>

              {/* Total Earnings */}
              <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Earnings
                  </span>
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                    <BangladeshiTaka className="size-5" />
                  </div>
                </div>
                <h3 className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  {loading ? "..." : formatCurrency(ownerData?.summary.totalEarnings)}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total revenue collected from rentals
                </p>
              </div>

              {/* Active / In-Progress Rentals */}
              <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Rentals
                  </span>
                  <div className="rounded-xl bg-sky-500/10 p-2.5 text-sky-600 dark:text-sky-400">
                    <Clock className="size-5" />
                  </div>
                </div>
                <h3 className="mt-2 text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {loading ? "..." : ownerData?.summary.activeRentals ?? 0}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Currently out with customers
                </p>
              </div>
            </div>

            {/* Monthly Earnings & Booking Frequency Visuals */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Monthly Earnings Breakdown */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                      <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Monthly Earnings & Booking Volume</span>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Revenue generated from your equipment over the past 6 months
                    </p>
                  </div>
                  <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    Monthly Breakdown
                  </span>
                </div>

                {loading ? (
                  <div className="flex h-56 items-center justify-center">
                    <RefreshCw className="size-6 animate-spin text-primary" />
                  </div>
                ) : !ownerData?.monthlyEarnings || ownerData.monthlyEarnings.length === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    No earnings history recorded yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {ownerData.monthlyEarnings.map((item: MonthlyBookingStat) => {
                      const maxEarnings = Math.max(
                        ...ownerData.monthlyEarnings.map((m) => m.earnings || m.revenue || 0),
                        5000
                      )
                      const currentVal = item.earnings || item.revenue || 0
                      const earnPercent = Math.min(
                        100,
                        Math.round((currentVal / maxEarnings) * 100)
                      )

                      return (
                        <div key={item.key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">
                              {item.label}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">
                                {item.bookings} rental{item.bookings === 1 ? "" : "s"}
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(currentVal)}
                              </span>
                            </div>
                          </div>
                          {/* Progress bar visual */}
                          <div className="h-3 w-full overflow-hidden rounded-full bg-muted/70">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500"
                              style={{ width: `${Math.max(earnPercent, item.bookings > 0 ? 5 : 2)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Equipment Inventory Status */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
                <h4 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Package className="size-5 text-primary" />
                  <span>Equipment Inventory Status</span>
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Approval status of your listed rental inventory
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-foreground">Approved & Live</span>
                    </div>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {ownerData?.equipmentBreakdown.approvedEquipment ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full bg-amber-500" />
                      <span className="text-sm font-medium text-foreground">Under Review</span>
                    </div>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {ownerData?.equipmentBreakdown.pendingApprovals ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full bg-rose-500" />
                      <span className="text-sm font-medium text-foreground">Rejected / Needs Fix</span>
                    </div>
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                      {ownerData?.equipmentBreakdown.rejectedEquipment ?? 0}
                    </span>
                  </div>

                  <Link
                    href="/dashboard/add-equipment"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "mt-2 w-full justify-center gap-2"
                    )}
                  >
                    <PlusCircle className="size-4" />
                    <span>List New Equipment</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Equipment Performance Table */}
            {ownerData?.equipmentPerformance && ownerData.equipmentPerformance.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
                <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
                  <div>
                    <h3 className="font-bold text-foreground">Top Performing Equipment</h3>
                    <p className="text-xs text-muted-foreground">
                      Earnings generated per equipment listing
                    </p>
                  </div>
                  <Link
                    href="/dashboard/my-equipment"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Manage My Equipment</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3">Equipment</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Daily Rate</th>
                        <th className="px-6 py-3">Times Rented</th>
                        <th className="px-6 py-3">Total Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {ownerData.equipmentPerformance.slice(0, 5).map((item) => (
                        <tr key={item.equipmentId} className="hover:bg-muted/30">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.equipmentName}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-muted-foreground">
                                    <Package className="size-5" />
                                  </div>
                                )}
                              </div>
                              <span className="font-semibold text-foreground">
                                {item.equipmentName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-muted-foreground">
                            {item.category || "General"}
                          </td>
                          <td className="px-6 py-3.5 font-medium text-foreground">
                            {formatCurrency(item.rentalPrice)} / {item.rentalType || "day"}
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-foreground">
                            {item.totalBookings}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(item.totalEarnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Navigation Cards Grid (for all roles) */}
        <div className="pt-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold tracking-tight text-foreground">
              Quick Shortcuts & Management
            </h3>
            <span className="text-xs text-muted-foreground">
              Direct access to dashboard tools
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickCards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-2xl border border-border/80 bg-card p-5 text-card-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h4 className="mt-3.5 text-base font-semibold text-foreground group-hover:text-primary">
                    {card.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {card.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                    <span>Open</span>
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
  )
}
