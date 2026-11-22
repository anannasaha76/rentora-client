import { getAuthHeaders } from "./getTokenFromClient"

export type UserProfile = {
  id?: string
  _id?: string
  name: string
  email: string
  image?: string
  role?: string
  phoneNumber?: string
  address?: string
  createdAt?: string
  updatedAt?: string
  emailVerified?: boolean
}

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function getUserProfile(email: string): Promise<UserProfile> {
  const res = await fetch(
    `${apiUrl}/api/users/profile/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || "Failed to fetch user profile.")
  }

  return res.json()
}

export async function updateUserProfile(
  email: string,
  updates: {
    name?: string
    image?: string
    phoneNumber?: string
    address?: string
  }
): Promise<{ message: string; user: UserProfile }> {
  const res = await fetch(
    `${apiUrl}/api/users/profile/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify(updates),
    }
  )

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update profile.")
  }

  return data
}

export type AllUsersResponse = {
  users: UserProfile[]
  total: number
  counts: {
    total: number
    customer: number
    owner: number
    admin: number
  }
}

export async function getAllUsers(query?: {
  search?: string
  role?: string
}): Promise<AllUsersResponse> {
  const params = new URLSearchParams()
  if (query?.search) params.set("search", query.search)
  if (query?.role && query.role !== "all") params.set("role", query.role)

  const res = await fetch(`${apiUrl}/api/users?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || "Failed to load registered users.")
  }

  return res.json()
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<{ message: string; user: UserProfile }> {
  const res = await fetch(`${apiUrl}/api/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify({ role }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update user role.")
  }

  return data
}

export async function manageUser(
  userId: string,
  updates: Partial<UserProfile> & { status?: string }
): Promise<{ message: string; user: UserProfile }> {
  const res = await fetch(`${apiUrl}/api/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(updates),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update user.")
  }

  return data
}

export async function deleteUser(
  userId: string
): Promise<{ message: string; id: string }> {
  const res = await fetch(`${apiUrl}/api/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to delete user.")
  }

  return data
}


