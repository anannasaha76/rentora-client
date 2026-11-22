import { backendApiUrl } from "@/lib/api"

export type FavoriteItem = {
  _id: string
  id?: string
  userEmail: string
  userId?: string
  equipmentId: string
  equipmentName: string
  category: string
  rentalPrice: number
  rentalType: string
  location?: string
  availableQuantity?: number
  image?: string
  brand?: string
  model?: string
  description?: string
  ownerName?: string
  ownerEmail?: string
  createdAt: string
}

export const apiUrl = backendApiUrl

export async function getCustomerFavorites(
  email: string
): Promise<FavoriteItem[]> {
  const res = await fetch(`${apiUrl}/api/favorites/${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || "Failed to load favorites.")
  }

  return res.json()
}

export async function checkFavoriteStatus(
  email: string,
  equipmentId: string
): Promise<{ isFavorite: boolean; favoriteId?: string | null }> {
  const res = await fetch(
    `${apiUrl}/api/favorites/check/${encodeURIComponent(email)}/${encodeURIComponent(equipmentId)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    return { isFavorite: false, favoriteId: null }
  }

  return res.json()
}

export async function addFavorite(
  item: Partial<FavoriteItem>
): Promise<{ message: string; favorite: FavoriteItem }> {
  const res = await fetch(`${apiUrl}/api/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to add to favorites.")
  }

  return data
}

export async function removeFavorite(
  id: string
): Promise<{ message: string; id: string }> {
  const res = await fetch(`${apiUrl}/api/favorites/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to remove from favorites.")
  }

  return data
}

export async function removeFavoriteByEquipment(
  email: string,
  equipmentId: string
): Promise<{ message: string }> {
  const res = await fetch(
    `${apiUrl}/api/favorites/item/${encodeURIComponent(email)}/${encodeURIComponent(equipmentId)}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  )

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to remove favorite.")
  }

  return data
}

