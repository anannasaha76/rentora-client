"use client"

import * as React from "react"
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/user"
import { cn } from "@/lib/utils"

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 disabled:cursor-not-allowed"
const textareaClass =
  "min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 disabled:cursor-not-allowed"

export default function MyProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  // Form State
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [image, setImage] = React.useState("")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [role, setRole] = React.useState("customer")

  const sessionEmail = session?.user?.email || ""

  // Load profile data
  const loadProfile = React.useCallback(async () => {
    if (!sessionEmail) return
    setLoading(true)
    try {
      // Fetch fresh profile from backend
      const data = await getUserProfile(sessionEmail).catch(() => null)

      const activeName = data?.name || session?.user?.name || ""
      const activeEmail = data?.email || session?.user?.email || ""
      const activeImage = data?.image || session?.user?.image || ""
      const activePhone =
        data?.phoneNumber || (session?.user as { phoneNumber?: string })?.phoneNumber || ""
      const activeAddress =
        data?.address || (session?.user as { address?: string })?.address || ""
      const activeRole = data?.role || (session?.user as { role?: string })?.role || "customer"

      setName(activeName)
      setEmail(activeEmail)
      setImage(activeImage)
      setPhoneNumber(activePhone)
      setAddress(activeAddress)
      setRole(activeRole)

      if (data) {
        setProfile(data)
      } else {
        setProfile({
          name: activeName,
          email: activeEmail,
          image: activeImage,
          phoneNumber: activePhone,
          address: activeAddress,
          role: activeRole,
          createdAt: session?.user?.createdAt
            ? String(session.user.createdAt)
            : undefined,
        })
      }
    } catch {
      // Fallback gracefully to session user
      if (session?.user) {
        setName(session.user.name || "")
        setEmail(session.user.email || "")
        setImage(session.user.image || "")
        setRole((session.user as { role?: string })?.role || "customer")
      }
    } finally {
      setLoading(false)
    }
  }, [sessionEmail, session?.user])

  React.useEffect(() => {
    if (sessionEmail) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [sessionEmail, loadProfile])

  // Handle image upload to ImgBB
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!key) {
      toast.error("Image upload is not configured. Please paste a direct image URL.")
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
      setImage(data.data.url)
      toast.success("Profile photo uploaded successfully.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  // Handle Save Profile
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionEmail) {
      toast.error("You must be logged in to update your profile.")
      return
    }

    if (!name.trim()) {
      toast.error("Full name cannot be blank.")
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        image: image.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      }

      const res = await updateUserProfile(sessionEmail, payload)
      setProfile((prev) => (prev ? { ...prev, ...res.user } : res.user))
      toast.success("Profile updated successfully.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  // Handle Reset to original profile
  function handleReset() {
    if (profile) {
      setName(profile.name || "")
      setImage(profile.image || "")
      setPhoneNumber(profile.phoneNumber || "")
      setAddress(profile.address || "")
      toast.info("Changes reverted.")
    }
  }

  const roleLabel =
    role === "owner" ? "Equipment Owner" : role === "admin" ? "Administrator" : "Customer"

  const roleSubtitle =
    role === "owner"
      ? "Manage your owner presence, listings contact details, and account preferences."
      : role === "admin"
      ? "Manage administrative credentials, system contact info, and oversight profile."
      : "Manage your personal contact details, delivery addresses, and rental preferences."

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">{roleSubtitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadProfile}
            disabled={loading}
            className="w-fit gap-1.5"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RefreshCw className="size-8 animate-spin text-primary" />
            <p className="mt-3 text-sm font-medium">Loading profile details...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Profile Card & Role Details */}
            <div className="space-y-6 lg:col-span-1">
              {/* Profile Card */}
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 text-card-foreground shadow-xs">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative size-24 overflow-hidden rounded-full border-2 border-primary/20 bg-muted shadow-sm">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={name || "Profile"}
                        className="size-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-2xl font-bold text-muted-foreground">
                        {(name || email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-foreground">
                    {name || "Your Name"}
                  </h2>
                  <p className="text-xs text-muted-foreground">{email}</p>

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <ShieldCheck className="size-3.5" />
                    {roleLabel}
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="mt-6 divide-y divide-border border-t pt-4 text-xs">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Account Status</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      Active & Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium text-foreground">
                      {phoneNumber || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Address</span>
                    <span className="max-w-[150px] truncate font-medium text-foreground">
                      {address || "Not set"}
                    </span>
                  </div>
                  {profile?.createdAt && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-medium text-foreground">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Role-Specific Capabilities Card */}
              <div className="rounded-2xl border bg-card p-5 text-card-foreground shadow-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="size-4 text-primary" />
                  {role === "owner"
                    ? "Owner Privileges"
                    : role === "admin"
                    ? "Administrator Access"
                    : "Customer Benefits"}
                </div>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  {role === "owner" ? (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        List equipment for rental marketplace
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Accept & manage customer rentals
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Receive secure Stripe payouts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Track monthly rental revenue
                      </li>
                    </>
                  ) : role === "admin" ? (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Platform user & role management
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Moderate & approve equipment listings
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Monitor platform-wide bookings
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Global business & revenue analytics
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Browse verified equipment catalog
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Book & rent with flexible duration
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Secure Stripe payment processing
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        Save favorite items & track booking history
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Column: Edit Profile Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSave}
                className="space-y-6 rounded-2xl border bg-card p-6 text-card-foreground shadow-xs"
              >
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Edit Profile Information</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Update your personal details, contact number, and address below.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-foreground">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className={cn(inputClass, "pl-9")}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="email" className="text-xs font-semibold text-foreground">
                        Email Address
                      </label>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Lock className="size-3" /> Locked to account
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className={cn(inputClass, "pl-9 bg-muted/50")}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Your primary email is used for sign-in and booking alerts and cannot be changed.
                    </p>
                  </div>

                  {/* Profile Image URL + ImgBB Upload */}
                  <div className="space-y-1.5">
                    <label htmlFor="image" className="text-xs font-semibold text-foreground">
                      Profile Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="image"
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className={inputClass}
                      />
                      <label
                        className={cn(
                          "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground shadow-xs transition-colors hover:bg-secondary/80",
                          uploading && "opacity-50 pointer-events-none"
                        )}
                      >
                        <UploadCloud className="size-4" />
                        {uploading ? "Uploading..." : "Upload Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Enter a direct image link or upload a photo directly using the button above.
                    </p>
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-semibold text-foreground">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 012-3456"
                        className={cn(inputClass, "pl-9")}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Used for delivery notifications, pickup coordination, and booking receipts.
                    </p>
                  </div>

                  {/* Address Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="address" className="text-xs font-semibold text-foreground">
                      Address
                    </label>
                    <div className="relative">
                      <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Equipment Way, Suite 400, Chicago, IL 60601"
                        className={textareaClass}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Your primary address for equipment deliveries, pickups, and billing.
                    </p>
                  </div>

                  {/* Role (Read-only Info) */}
                  <div className="rounded-xl border bg-muted/40 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Assigned Platform Role</span>
                      <span className="font-semibold uppercase tracking-wider text-primary">
                        {role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={saving || uploading}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || uploading}
                    className="gap-1.5"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="size-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        Save Profile Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  )
}
