export type RentalType = "Daily" | "Weekly" | "Monthly"
export type EquipmentStatus = "Pending" | "Approved" | "Rejected"

export type EquipmentListing = {
  _id: string
  id?: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  equipmentName: string
  description: string
  category: string
  location: string
  rentalPrice: number
  rentalType: RentalType
  availableQuantity: number
  equipmentCondition: string
  brand: string
  model: string
  image: string
  rentalTerms: string
  status: EquipmentStatus
  createdAt: string
  updatedAt?: string
}

export type EquipmentFormValues = {
  equipmentName: string
  description: string
  category: string
  location: string
  rentalPrice: string
  rentalType: RentalType
  availableQuantity: string
  equipmentCondition: string
  brand: string
  model: string
  image: string
  rentalTerms: string
}

export const equipmentCategories = [
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
] as const

export const rentalTypes: RentalType[] = ["Daily", "Weekly", "Monthly"]

export const equipmentConditions = [
  "New",
  "Excellent",
  "Good",
  "Fair",
  "For parts",
] as const

export const equipmentApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function getOwnerEquipment(
  ownerEmail: string,
  ownerId?: string
): Promise<EquipmentListing[]> {
  const query = new URLSearchParams()
  if (ownerEmail) query.set("email", ownerEmail)
  if (ownerId) query.set("ownerId", ownerId)

  const res = await fetch(`${equipmentApiUrl}/api/equipment/owner?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    const message = errorData?.message || "Failed to load owner equipment."
    throw new Error(message)
  }

  return res.json()
}

export async function getEquipmentById(id: string): Promise<EquipmentListing> {
  const res = await fetch(`${equipmentApiUrl}/api/equipment/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || "Failed to load equipment.")
  }

  return res.json()
}

export async function updateEquipment(
  id: string,
  updates: Partial<EquipmentListing> | Record<string, unknown>
): Promise<{ message: string; equipment: EquipmentListing }> {
  const res = await fetch(`${equipmentApiUrl}/api/equipment/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update equipment.")
  }

  return data
}

export async function deleteEquipment(
  id: string
): Promise<{ message: string; id: string }> {
  const res = await fetch(`${equipmentApiUrl}/api/equipment/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to delete equipment.")
  }

  return data
}
