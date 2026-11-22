import { getAuthHeader } from "@/lib/jwt"
import type { RentalBooking } from "@/lib/rental"

export const equipmentApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type MonthlyBookingStat = {
  key: string
  label: string
  shortMonth: string
  bookings: number
  revenue: number
  earnings?: number
  completed: number
}

export type EquipmentPerformance = {
  equipmentId: string
  equipmentName: string
  category?: string
  image?: string
  rentalPrice?: number
  rentalType?: string
  totalBookings: number
  totalEarnings: number
}

export type AdminAnalyticsResponse = {
  summary: {
    totalUsers: number
    totalEquipment: number
    totalBookings: number
    pendingApprovals: number
    completedRentals: number
    totalRevenue: number
  }
  usersBreakdown: {
    totalUsers: number
    customerCount: number
    ownerCount: number
    adminCount: number
  }
  equipmentBreakdown: {
    totalEquipment: number
    approvedEquipment: number
    pendingApprovals: number
    rejectedEquipment: number
  }
  bookingsBreakdown: {
    totalBookings: number
    completedRentals: number
    confirmedRentals: number
    inProgressRentals: number
    pendingRentals: number
    cancelledRentals: number
    paidBookingsCount: number
    unpaidBookingsCount: number
  }
  monthlyBookingStats: MonthlyBookingStat[]
  recentBookings: RentalBooking[]
}

export type OwnerAnalyticsResponse = {
  summary: {
    totalListedEquipment: number
    completedRentals: number
    totalEarnings: number
    activeRentals: number
    totalBookings: number
    pendingEarnings: number
  }
  equipmentBreakdown: {
    totalListedEquipment: number
    approvedEquipment: number
    pendingApprovals: number
    rejectedEquipment: number
  }
  bookingsBreakdown: {
    totalBookings: number
    completedRentals: number
    activeRentals: number
    pendingRentals: number
    cancelledRentals: number
  }
  monthlyEarnings: MonthlyBookingStat[]
  equipmentPerformance: EquipmentPerformance[]
  recentRentals: RentalBooking[]
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsResponse> {
  const res = await fetch(`${equipmentApiUrl}/api/analytics/admin`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to load admin analytics.")
  }

  return data
}

export async function getOwnerAnalytics(
  email: string,
  ownerId?: string
): Promise<OwnerAnalyticsResponse> {
  const query = new URLSearchParams()
  if (email) query.set("email", email)
  if (ownerId) query.set("ownerId", ownerId)

  const res = await fetch(`${equipmentApiUrl}/api/analytics/owner?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to load owner analytics.")
  }

  return data
}
