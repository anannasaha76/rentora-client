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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }
  )

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update profile.")
  }

  return data
}

