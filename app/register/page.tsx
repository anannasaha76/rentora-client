"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { signUp } from "@/lib/auth-client"

function validatePassword(password: string) {
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && password.length >= 6
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [photo, setPhoto] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState("customer")
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!key) {
      toast.error("Image upload is not configured. Please provide a direct image link.")
      e.target.value = ""
      return
    }
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data?.data?.url) {
        throw new Error(data?.error?.message || "Upload failed")
      }
      setPhoto(data.data.url)
      toast.success("Photo uploaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password || !role) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (!validatePassword(password)) {
      toast.error(
        "Password must have an uppercase letter, a lowercase letter, and be at least 6 characters."
      )
      return
    }
    setLoading(true)
    try {
      const { error } = await signUp.email({
        name,
        email,
        password,
        image: photo || undefined,
        role,
      } as Parameters<typeof signUp.email>[0] & { role: string })
      if (error) {
        toast.error(error.message || "Registration failed.")
        return
      }
      toast.success("Registration successful.")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-6xl justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join Rentora to rent or list equipment.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="photo" className="text-sm font-medium">
              Photo (direct image link or imgbb upload)
            </label>
            <input
              id="photo"
              type="url"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="https://..."
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
            />
            {uploading ? (
              <p className="text-xs text-muted-foreground">Uploading photo...</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium">
              Account type
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            >
              <option value="customer">Customer</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              required
            />
            <p className="text-xs text-muted-foreground">
              Must have an uppercase letter, a lowercase letter, and at least 6 characters.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading || uploading}>
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}
