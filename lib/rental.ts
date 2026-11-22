export type PaymentStatus = "Paid" | "Unpaid" | "Pending" | "Refunded"
export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled"

export type RentalBooking = {
  _id: string
  id?: string

  // Customer Information
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress?: string
  additionalNotes?: string

  // Equipment Information
  equipmentId: string
  equipmentName: string
  equipmentImage?: string
  equipmentCategory?: string
  location?: string

  // Owner Information
  ownerId?: string
  ownerName?: string
  ownerEmail?: string

  // Rental Duration & Quantities
  startDate: string
  endDate: string
  durationDays?: number
  requiredQuantity: number

  // Pricing & Statuses
  rentalPrice?: number
  rentalType?: string
  totalAmount: number
  paymentStatus: PaymentStatus
  bookingStatus: BookingStatus
  createdAt: string
  updatedAt?: string
}

export const equipmentApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function getOwnerRentals(
  ownerEmail: string,
  ownerId?: string
): Promise<RentalBooking[]> {
  const query = new URLSearchParams()
  if (ownerEmail) query.set("email", ownerEmail)
  if (ownerId) query.set("ownerId", ownerId)

  const res = await fetch(`${equipmentApiUrl}/api/rentals/owner?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || "Failed to fetch equipment rentals.")
  }

  return res.json()
}

export async function getCustomerRentals(
  customerEmail: string,
  customerId?: string
): Promise<RentalBooking[]> {
  const query = new URLSearchParams()
  if (customerEmail) query.set("email", customerEmail)
  if (customerId) query.set("customerId", customerId)

  const res = await fetch(`${equipmentApiUrl}/api/rentals/customer?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || "Failed to fetch customer rentals.")
  }

  return res.json()
}

export async function updateRentalStatus(
  id: string,
  updates: { bookingStatus?: BookingStatus; paymentStatus?: PaymentStatus }
): Promise<{ message: string; rental: RentalBooking }> {
  const res = await fetch(`${equipmentApiUrl}/api/rentals/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update rental status.")
  }

  return data
}

export type CreateBookingPayload = {
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  deliveryAddress?: string
  additionalNotes?: string
  equipmentId: string
  equipmentName: string
  equipmentImage?: string
  equipmentCategory?: string
  location?: string
  ownerId?: string
  ownerName?: string
  ownerEmail?: string
  startDate: string
  endDate: string
  durationDays?: number
  requiredQuantity: number
  rentalPrice?: number
  rentalType?: string
  totalAmount: number
  paymentStatus?: PaymentStatus
  bookingStatus?: BookingStatus
}

export async function createRentalBooking(
  payload: CreateBookingPayload
): Promise<{ message: string; id: string; booking: RentalBooking }> {
  const res = await fetch(`${equipmentApiUrl}/api/rentals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to create rental booking.")
  }

  return data
}

export async function getRentalById(id: string): Promise<RentalBooking> {
  const res = await fetch(`${equipmentApiUrl}/api/rentals/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to load rental booking details.")
  }

  return data
}

export type PaymentRecord = {
  _id?: string
  id?: string
  bookingId: string
  equipmentId: string
  equipmentName: string
  customerEmail: string
  customerName: string
  ownerEmail?: string
  totalAmount: number
  paymentMethod: string
  transactionId: string
  status: string
  createdAt: string
}

export async function processPayment(payload: {
  bookingId: string
  totalAmount?: number
  paymentMethod?: string
  transactionId?: string
}): Promise<{ message: string; payment: PaymentRecord; booking: RentalBooking }> {
  const res = await fetch(`${equipmentApiUrl}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Payment processing failed.")
  }

  return data
}

export async function getPaymentById(id: string): Promise<PaymentRecord> {
  const res = await fetch(`${equipmentApiUrl}/api/payments/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch payment details.")
  }

  return data
}

export type RentalStats = {
  totalRentals: number
  totalRevenue: number
  pendingCount: number
  confirmedCount: number
  inProgressCount: number
  completedCount: number
  cancelledCount: number
  paidCount: number
  unpaidCount: number
}

export async function getAllRentals(options?: {
  search?: string
  bookingStatus?: string
  paymentStatus?: string
}): Promise<{ rentals: RentalBooking[]; stats?: RentalStats }> {
  const query = new URLSearchParams()
  if (options?.search) query.set("search", options.search)
  if (options?.bookingStatus && options.bookingStatus !== "all") {
    query.set("bookingStatus", options.bookingStatus)
  }
  if (options?.paymentStatus && options.paymentStatus !== "all") {
    query.set("paymentStatus", options.paymentStatus)
  }

  const queryString = query.toString() ? `?${query.toString()}` : ""
  const res = await fetch(`${equipmentApiUrl}/api/rentals${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch rental records.")
  }

  if (Array.isArray(data)) {
    return { rentals: data }
  }

  return {
    rentals: Array.isArray(data?.rentals) ? data.rentals : [],
    stats: data?.stats,
  }
}

export async function manageRental(
  id: string,
  updates: Partial<RentalBooking>
): Promise<{ message: string; rental: RentalBooking }> {
  const res = await fetch(`${equipmentApiUrl}/api/rentals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update rental details.")
  }

  return data
}

export async function deleteRental(id: string): Promise<{ message: string }> {
  const res = await fetch(`${equipmentApiUrl}/api/rentals/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to delete rental booking.")
  }

  return data
}




