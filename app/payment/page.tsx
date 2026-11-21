"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  XCircle,
} from "lucide-react"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import {
  getRentalById,
  processPayment,
  RentalBooking,
} from "@/lib/rental"

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const bookingId = searchParams.get("bookingId") || ""

  const [booking, setBooking] = React.useState<RentalBooking | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Payment form states
  const [cardNumber, setCardNumber] = React.useState("4242 •••• •••• 4242")
  const [expiryDate, setExpiryDate] = React.useState("12/28")
  const [cvc, setCvc] = React.useState("123")
  const [nameOnCard, setNameOnCard] = React.useState("")
  const [postalCode, setPostalCode] = React.useState("10001")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [paymentError, setPaymentError] = React.useState<string | null>(null)

  // Load booking details
  const loadBooking = React.useCallback(async () => {
    if (!bookingId) {
      setError("No booking ID was provided in the payment URL.")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await getRentalById(bookingId)
      setBooking(data)
      if (session?.user?.name && !nameOnCard) {
        setNameOnCard(session.user.name)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load booking details."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [bookingId, session?.user?.name, nameOnCard])

  React.useEffect(() => {
    loadBooking()
  }, [loadBooking])

  // Handle Card input formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim()
    setCardNumber(formatted || e.target.value)
  }

  // Handle Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    if (!cardNumber || !expiryDate || !cvc || !nameOnCard) {
      setPaymentError("Please complete all payment fields.")
      return
    }

    try {
      setIsProcessing(true)
      setPaymentError(null)

      const result = await processPayment({
        bookingId: booking._id || bookingId,
        totalAmount: booking.totalAmount,
        paymentMethod: "Stripe",
      })

      const txId = result.payment?.transactionId || `tx_${Date.now()}`
      router.push(`/payment/success?bookingId=${booking._id || bookingId}&tx=${txId}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment processing failed. Please try again."
      setPaymentError(msg)
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/20 pb-16 pt-6 sm:pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/equipment"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Marketplace
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" />
              <div className="h-48 w-full animate-pulse rounded-2xl bg-muted" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="mx-auto max-w-lg rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center">
            <XCircle className="mx-auto mb-3 size-12 text-destructive" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Booking Not Found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={loadBooking} variant="outline" className="gap-2">
                <RotateCcw className="size-4" />
                Retry
              </Button>
              <Link href="/equipment">
                <Button className="gap-2">
                  <ArrowLeft className="size-4" />
                  Return to Equipment
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Already Paid Notification */}
        {!isLoading && booking && booking.paymentStatus === "Paid" && (
          <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Booking Already Paid
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This rental booking has already been completed and confirmed.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/dashboard/my-rentals">
                <Button className="font-semibold">View in My Rentals</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Payment Checkout Grid */}
        {!isLoading && booking && booking.paymentStatus !== "Paid" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Stripe Payment Form (7 cols) */}
            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      Payment Details
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Complete your rental payment securely powered by Stripe
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5">
                    <CreditCard className="size-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Stripe
                    </span>
                  </div>
                </div>

                {paymentError && (
                  <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
                    {paymentError}
                  </div>
                )}

                <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
                  {/* Card Number */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground">
                      Card Number
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm font-mono tracking-wide focus:border-primary focus:outline-none"
                      />
                      <CreditCard className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground">
                        Expiration Date
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM / YY"
                        maxLength={5}
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm font-mono focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground">
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="123"
                        maxLength={4}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm font-mono focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground">
                      Cardholder Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Postal / ZIP Code */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground">
                      Billing Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="10001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Security Assurance Banner */}
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-3.5 text-xs text-foreground dark:border-emerald-900/30 dark:bg-emerald-950/20">
                    <ShieldCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Guaranteed protection. Your payment info is tokenized and never stored unencrypted.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isProcessing}
                      className="w-full gap-2 font-bold shadow-md"
                    >
                      <Lock className="size-4" />
                      {isProcessing
                        ? "Processing Payment..."
                        : `Pay $${booking.totalAmount.toFixed(2)} with Stripe`}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Delivery & Customer Info Summary */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Delivery & Contact Information
                </h3>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Recipient Name:</dt>
                    <dd className="font-medium text-foreground">{booking.customerName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Contact Phone:</dt>
                    <dd className="font-medium text-foreground">{booking.customerPhone}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Delivery / Job Site Address:</dt>
                    <dd className="font-medium text-foreground">{booking.deliveryAddress}</dd>
                  </div>
                  {booking.additionalNotes && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Notes / Instructions:</dt>
                      <dd className="font-medium text-foreground">{booking.additionalNotes}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="space-y-6 lg:col-span-5">
              <div className="sticky top-20 rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Rental Order Summary
                </h2>

                {/* Equipment Thumbnail & Title */}
                <div className="mt-4 flex gap-3.5 rounded-xl border bg-muted/30 p-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={booking.equipmentImage || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80"}
                    alt={booking.equipmentName}
                    className="size-18 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-foreground text-sm">
                      {booking.equipmentName}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 text-primary shrink-0" />
                      <span className="truncate">{booking.location || "Nationwide"}</span>
                    </div>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Package className="size-3" />
                      Qty: {booking.requiredQuantity}
                    </span>
                  </div>
                </div>

                {/* Duration & Period */}
                <div className="mt-4 space-y-2 rounded-xl border bg-muted/20 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary" />
                      Rental Period:
                    </span>
                    <span className="font-semibold text-foreground">
                      {booking.startDate} to {booking.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold text-foreground">
                      {booking.durationDays || 1} day{(booking.durationDays || 1) > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Pricing Line Items */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Equipment Rental</span>
                    <span className="font-medium text-foreground">
                      ${booking.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Damage Protection Guarantee</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Included</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Service & Processing</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Waived ($0.00)</span>
                  </div>

                  <div className="border-t pt-3 flex items-baseline justify-between text-base font-bold">
                    <span className="text-foreground">Total Due Now</span>
                    <span className="text-2xl font-extrabold text-primary">
                      ${booking.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Guarantee Perks */}
                <div className="mt-6 border-t pt-4 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Free cancellation up to 24h before rental start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Dispatched with full operational inspection certificate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <AuthRouteGuard>
      <React.Suspense
        fallback={
          <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading checkout session...</p>
          </div>
        }
      >
        <PaymentContent />
      </React.Suspense>
    </AuthRouteGuard>
  )
}

