import { ensureAccessToken, getAuthHeader } from "@/lib/jwt"

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

export const defaultCategories = equipmentCategories
export const defaultConditions = equipmentConditions
export const defaultRentalTypes = rentalTypes

export const equipmentApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function getOwnerEquipment(
  ownerEmail: string,
  ownerId?: string
): Promise<EquipmentListing[]> {
  const query = new URLSearchParams()
  if (ownerEmail) query.set("email", ownerEmail)
  if (ownerId) query.set("ownerId", ownerId)

  // Auto-generate or restore access token if missing
  await ensureAccessToken({ email: ownerEmail, id: ownerId, role: "owner" })

  const res = await fetch(`${equipmentApiUrl}/api/equipment/owner?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
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
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
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
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to delete equipment.")
  }

  return data
}

export type EquipmentQueryOptions = {
  search?: string
  name?: string
  location?: string
  category?: string
  rentalType?: string
  minPrice?: number | string
  maxPrice?: number | string
  availability?: string
  sort?: string
  status?: string
  page?: number
  limit?: number
}

export type EquipmentResponse = {
  equipment: EquipmentListing[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getAllEquipment(
  options: EquipmentQueryOptions = {}
): Promise<EquipmentResponse> {
  const params = new URLSearchParams()
  if (options.search) params.set("search", options.search)
  if (options.name) params.set("name", options.name)
  if (options.location) params.set("location", options.location)
  if (options.category && options.category !== "all") params.set("category", options.category)
  if (options.rentalType && options.rentalType !== "all") params.set("rentalType", options.rentalType)
  if (options.minPrice !== undefined && options.minPrice !== "") params.set("minPrice", String(options.minPrice))
  if (options.maxPrice !== undefined && options.maxPrice !== "") params.set("maxPrice", String(options.maxPrice))
  if (options.availability && options.availability !== "all") params.set("availability", options.availability)
  if (options.sort) params.set("sort", options.sort)
  if (options.status) params.set("status", options.status)
  if (options.page) params.set("page", String(options.page))
  if (options.limit) params.set("limit", String(options.limit))

  const res = await fetch(`${equipmentApiUrl}/api/equipment?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || "Failed to load equipment.")
  }

  const data = await res.json()
  if (Array.isArray(data)) {
    return {
      equipment: data,
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1,
    }
  }
  return data
}

export async function updateEquipmentStatus(
  id: string,
  status: EquipmentStatus
): Promise<{ message: string; equipment: EquipmentListing }> {
  const res = await fetch(`${equipmentApiUrl}/api/equipment/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update equipment status.")
  }

  return data
}

export async function getFeaturedEquipment(): Promise<EquipmentListing[]> {
  try {
    const res = await fetch(`${equipmentApiUrl}/api/equipment/featured`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!res.ok) {
      const fallback = await getAllEquipment({ status: "Approved", limit: 6 })
      return fallback.equipment.slice(0, 6)
    }

    const data = await res.json()
    return Array.isArray(data) ? data : data.equipment || []
  } catch (err) {
    console.warn("Failed to fetch featured equipment from endpoint, using fallback:", err)
    const fallback = await getAllEquipment({ status: "Approved", limit: 6 })
    return fallback.equipment.slice(0, 6)
  }
}

export type RentalCategory = {
  title: string
  name: string
  totalListings: number
  availableQuantity: number
  minPrice?: number
  sampleImage?: string
  description?: string
  color?: string
  border?: string
  count?: string
}

export async function getRentalCategories(): Promise<RentalCategory[]> {
  try {
    const res = await fetch(`${equipmentApiUrl}/api/equipment/categories`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (err) {
    console.warn("Failed to fetch dynamic categories from API, using fallback defaults:", err)
  }

  // Graceful fallback if server unavailable
  return [
    {
      title: "Construction Equipment",
      name: "Construction Equipment",
      totalListings: 45,
      availableQuantity: 45,
      description: "Excavators, concrete mixers, scaffoldings & compactors",
      color: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
      count: "45+ Available",
    },
    {
      title: "Photography Equipment",
      name: "Photography Equipment",
      totalListings: 60,
      availableQuantity: 60,
      description: "Cinema cameras, prime lenses, gimbals & studio lighting",
      color: "from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400",
      border: "border-sky-500/20",
      count: "60+ Available",
    },
    {
      title: "Vehicles & Transportation",
      name: "Vehicles & Transportation",
      totalListings: 30,
      availableQuantity: 30,
      description: "Pickup trucks, cargo vans, trailers & flatbeds",
      color: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
      count: "30+ Available",
    },
    {
      title: "Agriculture Equipment",
      name: "Agriculture Equipment",
      totalListings: 35,
      availableQuantity: 35,
      description: "High-horsepower tractors, harvesters & irrigation pumps",
      color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
      count: "35+ Available",
    },
    {
      title: "Electronics",
      name: "Electronics",
      totalListings: 50,
      availableQuantity: 50,
      description: "Heavy-duty sound systems, drone kits & testing tools",
      color: "from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400",
      border: "border-purple-500/20",
      count: "50+ Available",
    },
    {
      title: "Event Equipment",
      name: "Event Equipment",
      totalListings: 40,
      availableQuantity: 40,
      description: "Stage setups, truss systems, industrial generators & lights",
      color: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400",
      border: "border-rose-500/20",
      count: "40+ Available",
    },
  ]
}

