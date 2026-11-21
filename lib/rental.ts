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

