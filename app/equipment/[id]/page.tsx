"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Info,
  Layers,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  EquipmentListing,
  getEquipmentById,
} from "@/lib/equipment"
import {
  addFavorite,
  checkFavoriteStatus,
  removeFavoriteByEquipment,
} from "@/lib/favorite"
import {
  createRentalBooking,
  RentalBooking,
} from "@/lib/rental"

export default function EquipmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const equipmentId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : ""

  const [equipment, setEquipment] = React.useState<EquipmentListing | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Favorite state
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [favoriteLoading, setFavoriteLoading] = React.useState(false)
  const [favoriteSuccessToast, setFavoriteSuccessToast] = React.useState<string | null>(null)

  // Booking modal state
  const [isBookingOpen, setIsBookingOpen] = React.useState(false)
  const [isSubmittingBooking, setIsSubmittingBooking] = React.useState(false)
  const [bookingError, setBookingError] = React.useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = React.useState<RentalBooking | null>(null)

  // Booking form fields
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [requiredQuantity, setRequiredQuantity] = React.useState(1)
  const [contactNumber, setContactNumber] = React.useState("")
  const [deliveryAddress, setDeliveryAddress] = React.useState("")
  const [additionalNotes, setAdditionalNotes] = React.useState("")

  // Default dates helper
  React.useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const nextWeek = new Date(tomorrow)
    nextWeek.setDate(tomorrow.getDate() + 3)

    const tomorrowStr = tomorrow.toISOString().split("T")[0]
    const nextWeekStr = nextWeek.toISOString().split("T")[0]

    setStartDate(tomorrowStr)
    setEndDate(nextWeekStr)
  }, [])

  // Auto-populate contact info from session
  React.useEffect(() => {
    if (session?.user) {
      if (session.user.phoneNumber && !contactNumber) {
        setContactNumber(session.user.phoneNumber)
      }
      if (session.user.address && !deliveryAddress) {
        setDeliveryAddress(session.user.address)
      }
    }
  }, [session, contactNumber, deliveryAddress])

  // Fetch equipment and favorite status
  const loadEquipment = React.useCallback(async () => {
    if (!equipmentId) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await getEquipmentById(equipmentId)
      setEquipment(data)

      // Check favorite status if user is signed in
      if (session?.user?.email) {
        try {
          const favCheck = await checkFavoriteStatus(session.user.email, equipmentId)
          setIsFavorite(favCheck.isFavorite)
        } catch {
          // Non-blocking favorite check
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load equipment details."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [equipmentId, session?.user?.email])

  React.useEffect(() => {
    loadEquipment()
  }, [loadEquipment])

  // Handle Favorite Toggle
  const handleToggleFavorite = async () => {
    if (!session?.user?.email || !equipment) return
    try {
      setFavoriteLoading(true)
      if (isFavorite) {
        await removeFavoriteByEquipment(session.user.email, equipment._id || equipmentId)
        setIsFavorite(false)
        showNotification("Removed from your favorites")
      } else {
        await addFavorite({
          userEmail: session.user.email,
          userId: session.user.id,
          equipmentId: equipment._id || equipmentId,
          equipmentName: equipment.equipmentName,
          category: equipment.category,
          rentalPrice: equipment.rentalPrice,
          rentalType: equipment.rentalType,
          location: equipment.location,
          availableQuantity: equipment.availableQuantity,
          image: equipment.image,
          brand: equipment.brand,
          model: equipment.model,
          description: equipment.description,
          ownerName: equipment.ownerName,
          ownerEmail: equipment.ownerEmail,
        })
        setIsFavorite(true)
        showNotification("Added to your favorites!")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update favorites"
      showNotification(msg)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const showNotification = (msg: string) => {
    setFavoriteSuccessToast(msg)
    setTimeout(() => {
      setFavoriteSuccessToast(null)
    }, 3500)
  }

  // Calculate rental duration and price
  const calculatePricing = () => {
    if (!equipment || !startDate || !endDate) {
      return { days: 1, totalUnits: 1, total: equipment?.rentalPrice || 0 }
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.max(0, end.getTime() - start.getTime())
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    let total = 0
    let durationLabel = `${diffDays} day${diffDays > 1 ? "s" : ""}`

    if (equipment.rentalType === "Weekly") {
      const weeks = Math.max(1, Math.ceil(diffDays / 7))
      total = weeks * equipment.rentalPrice * requiredQuantity
      durationLabel = `${weeks} week${weeks > 1 ? "s" : ""} (${diffDays} days)`
    } else if (equipment.rentalType === "Monthly") {
      const months = Math.max(1, Math.ceil(diffDays / 30))
      total = months * equipment.rentalPrice * requiredQuantity
      durationLabel = `${months} month${months > 1 ? "s" : ""} (${diffDays} days)`
    } else {
      // Daily
      total = diffDays * equipment.rentalPrice * requiredQuantity
      durationLabel = `${diffDays} day${diffDays > 1 ? "s" : ""}`
    }

    return { days: diffDays, durationLabel, total }
  }

  const pricing = calculatePricing()

  // Handle Booking Submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipment || !session?.user) return

    if (!startDate || !endDate) {
      setBookingError("Please select both start and end rental dates.")
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setBookingError("End date cannot be earlier than start date.")
      return
    }

    if (requiredQuantity < 1 || requiredQuantity > equipment.availableQuantity) {
      setBookingError(`Quantity must be between 1 and ${equipment.availableQuantity}.`)
      return
    }

    try {
      setIsSubmittingBooking(true)
      setBookingError(null)

      // Call Next.js API route to create Stripe Checkout session (Section 3 of Stripe guide)
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: equipment._id || equipmentId,
          equipmentName: equipment.equipmentName,
          equipmentImage: equipment.image,
          category: equipment.category,
          location: equipment.location,
          ownerId: equipment.ownerId,
          ownerName: equipment.ownerName,
          ownerEmail: equipment.ownerEmail,
          customerId: session.user.id,
          customerName: session.user.name || "Customer",
          customerEmail: session.user.email,
          customerPhone: contactNumber || "N/A",
          deliveryAddress: deliveryAddress || "Self-Pickup / Site Address",
          additionalNotes: additionalNotes || "",
          startDate,
          endDate,
          durationDays: pricing.days,
          quantity: requiredQuantity,
          rentalPrice: equipment.rentalPrice,
          rentalType: equipment.rentalType,
          totalAmount: pricing.total,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to create Stripe Checkout session.")
      }

      setIsBookingOpen(false)
      if (data.url) {
        window.location.assign(data.url) // Direct redirect to Stripe Checkout
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate Stripe payment."
      setBookingError(msg)
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  return (
    <AuthRouteGuard>
      <main className="min-h-screen bg-muted/20 pb-16 pt-6 sm:pt-8">
        {/* Toast Notification */}
        {favoriteSuccessToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background shadow-xl">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{favoriteSuccessToast}</span>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/equipment" className="hover:text-foreground">
              All Equipment
            </Link>
            <span>/</span>
            <span className="truncate font-medium text-foreground">
              {equipment ? equipment.equipmentName : "Equipment Details"}
            </span>
          </nav>

          {/* Loading Skeleton State */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted" />
                <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-24 w-full animate-pulse rounded bg-muted" />
              </div>
              <div className="space-y-4 lg:col-span-5">
                <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" />
                <div className="h-48 w-full animate-pulse rounded-2xl bg-muted" />
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="mx-auto max-w-lg rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center">
              <XCircle className="mx-auto mb-3 size-12 text-destructive" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Unable to load equipment
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={loadEquipment} variant="outline" className="gap-2">
                  <RotateCcw className="size-4" />
                  Try Again
                </Button>
                <Link href="/equipment">
                  <Button className="gap-2">
                    <ArrowLeft className="size-4" />
                    Back to All Equipment
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Main Equipment Presentation */}
          {!isLoading && equipment && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Image, Description, Specs & Terms (7 cols) */}
              <div className="space-y-8 lg:col-span-7">
                {/* Equipment Image & Floating Badges */}
                <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
                  <div className="relative aspect-[16/10] w-full bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={equipment.image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"}
                      alt={equipment.equipmentName}
                      className="h-full w-full object-cover"
                    />

                    {/* Gradient Overlay for Top Badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Category & Status Badges */}
                    <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-sm">
                        <Tag className="size-3.5 text-primary" />
                        {equipment.category}
                      </span>
                      {equipment.equipmentCondition && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                          <Sparkles className="size-3" />
                          {equipment.equipmentCondition}
                        </span>
                      )}
                    </div>

                    {/* Bottom Status Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-emerald-400" />
                        <span className="text-sm font-medium drop-shadow">{equipment.location}</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
                          equipment.availableQuantity > 0
                            ? "bg-emerald-500/90 text-white"
                            : "bg-destructive/90 text-white"
                        }`}
                      >
                        <Package className="size-3.5" />
                        {equipment.availableQuantity > 0
                          ? `${equipment.availableQuantity} in stock`
                          : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Equipment Info & Description Section */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                        {equipment.equipmentName}
                      </h1>
                      {(equipment.brand || equipment.model) && (
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                          {[equipment.brand, equipment.model].filter(Boolean).join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Highlight Cards */}
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border bg-muted/40 p-3">
                      <span className="text-xs text-muted-foreground">Rental Rate</span>
                      <p className="mt-1 text-base font-bold text-primary">
                        ৳{equipment.rentalPrice}
                        <span className="text-xs font-normal text-muted-foreground">
                          /{equipment.rentalType.toLowerCase()}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl border bg-muted/40 p-3">
                      <span className="text-xs text-muted-foreground">Available Units</span>
                      <p className="mt-1 text-base font-bold text-foreground">
                        {equipment.availableQuantity} units
                      </p>
                    </div>

                    <div className="rounded-xl border bg-muted/40 p-3">
                      <span className="text-xs text-muted-foreground">Condition</span>
                      <p className="mt-1 text-base font-bold text-foreground">
                        {equipment.equipmentCondition || "Good"}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-muted/40 p-3">
                      <span className="text-xs text-muted-foreground">Listing Status</span>
                      <p className="mt-1 text-base font-bold capitalize text-emerald-600 dark:text-emerald-400">
                        {equipment.status}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="mt-6 border-t pt-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                      <FileText className="size-5 text-primary" />
                      Equipment Description
                    </h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {equipment.description || "No description provided for this equipment item."}
                    </p>
                  </div>

                  {/* Specifications Grid */}
                  <div className="mt-6 border-t pt-6">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      Technical Specifications
                    </h2>
                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <dt className="text-muted-foreground">Category</dt>
                        <dd className="font-medium text-foreground">{equipment.category}</dd>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <dt className="text-muted-foreground">Rental Type</dt>
                        <dd className="font-medium text-foreground">{equipment.rentalType}</dd>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <dt className="text-muted-foreground">Condition</dt>
                        <dd className="font-medium text-foreground">{equipment.equipmentCondition || "Standard"}</dd>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <dt className="text-muted-foreground">Operating Location</dt>
                        <dd className="font-medium text-foreground">{equipment.location}</dd>
                      </div>
                      {equipment.brand && (
                        <div className="flex justify-between border-b pb-2">
                          <dt className="text-muted-foreground">Manufacturer / Brand</dt>
                          <dd className="font-medium text-foreground">{equipment.brand}</dd>
                        </div>
                      )}
                      {equipment.model && (
                        <div className="flex justify-between border-b pb-2">
                          <dt className="text-muted-foreground">Model Number</dt>
                          <dd className="font-medium text-foreground">{equipment.model}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Rental Terms and Conditions Card */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-5 text-amber-500" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      Rental Terms and Conditions
                    </h2>
                  </div>

                  <div className="mt-4 rounded-xl border border-amber-200/50 bg-amber-50/50 p-4 text-sm dark:border-amber-900/30 dark:bg-amber-950/20">
                    <p className="whitespace-pre-line leading-relaxed text-foreground">
                      {equipment.rentalTerms ||
                        "Standard Rental Agreement: Equipment must be operated by qualified personnel only. Daily routine maintenance and safety inspections are required. Any loss or physical damage occurring during the rental period is the renter's responsibility. Equipment must be returned clean and in operational condition."}
                    </p>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-500 shrink-0" />
                      <span>Security deposit may be verified upon dispatch / collection.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-500 shrink-0" />
                      <span>Valid photo ID and signature required at physical handover.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-500 shrink-0" />
                      <span>Cancellations made 24 hours prior to booking start date are eligible for full credit.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Pricing, Booking Action & Owner Profile (5 cols) */}
              <div className="space-y-6 lg:col-span-5">
                {/* Sticky Booking Action Card */}
                <div className="sticky top-20 rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Rental Price
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight text-primary">
                          ৳{equipment.rentalPrice}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{equipment.rentalType.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {equipment.status !== "Approved" ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                          {equipment.status}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            equipment.availableQuantity > 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {equipment.availableQuantity > 0 ? "Ready to Rent" : "Unavailable"}
                        </span>
                      )}
                    </div>
                  </div>

                  {equipment.status !== "Approved" && (
                    <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
                      <strong>Moderation Notice:</strong> This listing is currently{" "}
                      <strong>{equipment.status}</strong> and is not open for public bookings.
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    {/* Primary Booking Button */}
                    <Button
                      size="lg"
                      className="w-full gap-2 font-semibold shadow-md"
                      disabled={equipment.availableQuantity <= 0 || equipment.status !== "Approved"}
                      onClick={() => setIsBookingOpen(true)}
                    >
                      <Calendar className="size-4" />
                      {equipment.status !== "Approved"
                        ? `Listing ${equipment.status} — Booking Disabled`
                        : equipment.availableQuantity > 0
                        ? "Rent Now / Book Equipment"
                        : "Currently Out of Stock"}
                    </Button>

                    {/* Add to Favorites Toggle Button */}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full gap-2 font-medium"
                      disabled={favoriteLoading}
                      onClick={handleToggleFavorite}
                    >
                      <Heart
                        className={`size-4 transition-colors ${
                          isFavorite
                            ? "fill-rose-500 text-rose-500"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      />
                      {isFavorite ? "Saved in Favorites" : "Add to Favorites"}
                    </Button>
                  </div>

                  {/* Booking Assurance Perks */}
                  <div className="mt-6 border-t pt-5 space-y-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified equipment inspected before delivery</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="size-4 text-primary" />
                      <span>Instant confirmation & guaranteed schedule</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Truck className="size-4 text-blue-500" />
                      <span>On-site delivery & pickup available upon request</span>
                    </div>
                  </div>
                </div>

                {/* Owner Information Card */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b pb-4">
                    <User className="size-5 text-primary" />
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      Owner Information
                    </h2>
                  </div>

                  <div className="mt-4 flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {equipment.ownerName ? equipment.ownerName[0].toUpperCase() : "O"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold text-foreground">
                          {equipment.ownerName || "Equipment Owner"}
                        </p>
                        <span title="Verified Owner">
                          <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {equipment.ownerEmail || "owner@rentora.com"}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        <span>Role: Equipment Owner</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                    <p>
                      Need custom rental periods, bulk machinery, or job site delivery terms? Contact the owner during checkout notes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            BOOKING MODAL
           ========================================================================= */}
        {isBookingOpen && equipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Book Equipment Rental
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Review booking details and confirm your reservation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Selected Equipment Summary */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={equipment.image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80"}
                  alt={equipment.equipmentName}
                  className="size-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-semibold text-foreground text-sm">
                    {equipment.equipmentName}
                  </h4>
                  <p className="text-xs text-muted-foreground">{equipment.location}</p>
                  <p className="mt-0.5 text-xs font-semibold text-primary">
                    ৳{equipment.rentalPrice} / {equipment.rentalType.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4">
                {bookingError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                    {bookingError}
                  </div>
                )}

                {/* Rental Date Range */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-foreground">
                      Start Date <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground">
                      End Date <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={startDate || new Date().toISOString().split("T")[0]}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-foreground">
                      Required Quantity <span className="text-destructive">*</span>
                    </label>
                    <span className="text-xs text-muted-foreground">
                      Max available: {equipment.availableQuantity}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={equipment.availableQuantity}
                    required
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Customer Contact Number */}
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Contact Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Delivery / Job Site Address */}
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Delivery Address / Job Site Location <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter delivery or job site address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Additional Notes / Site Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide any instructions, gate codes, or operator requirements..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Pricing Summary Box */}
                <div className="rounded-xl border bg-muted/40 p-4 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Estimated Duration</span>
                    <span className="font-medium text-foreground">{pricing.durationLabel}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Rate & Quantity</span>
                    <span className="font-medium text-foreground">
                      ৳{equipment.rentalPrice.toLocaleString()} × {requiredQuantity} unit{requiredQuantity > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between border-t pt-2 text-sm font-bold">
                    <span className="text-foreground">Total Rental Amount</span>
                    <span className="text-lg text-primary">৳{pricing.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT</span>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBookingOpen(false)}
                    disabled={isSubmittingBooking}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="gap-2 font-semibold bg-[#635bff] text-white hover:bg-[#5340eb]"
                  >
                    {isSubmittingBooking ? "Connecting to Stripe..." : "Pay with Stripe"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            BOOKING CONFIRMATION SUCCESS MODAL
           ========================================================================= */}
        {confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>

              <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">
                Rental Confirmed!
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Your booking request has been successfully created and secured.
              </p>

              <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipment:</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {confirmedBooking.equipmentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Duration:</span>
                  <span className="font-medium text-foreground">
                    {confirmedBooking.startDate} to {confirmedBooking.endDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Units Reserved:</span>
                  <span className="font-medium text-foreground">
                    {confirmedBooking.requiredQuantity}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span className="text-muted-foreground">Total Paid:</span>
                  <span className="text-primary font-bold">
                    ৳{confirmedBooking.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link href="/dashboard/my-rentals" className="w-full">
                  <Button className="w-full font-semibold">
                    View in My Rentals
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setConfirmedBooking(null)}
                  className="w-full"
                >
                  Continue Browsing
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthRouteGuard>
  )
}

