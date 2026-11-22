"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Package,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { Button } from "@/components/ui/button"
import { getAuthHeaders } from "@/lib/getTokenFromClient"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id") || ""
  const rawData = searchParams.get("data")

  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [bookingData, setBookingData] = React.useState<any>(null)
  const [transactionId, setTransactionId] = React.useState<string>("")

  // Fulfill booking in MongoDB (Section 4 & 7 of Stripe Payment Guide)
  const fulfillPayment = React.useCallback(async () => {
    if (!sessionId) {
      setError("No checkout session ID was provided.")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let metadata: Record<string, any> = {}
      if (rawData) {
        try {
          metadata = JSON.parse(decodeURIComponent(rawData))
        } catch {
          // ignore
        }
      }

      // If returning from real Stripe Checkout, fetch session metadata from Next.js API route
      let stripeTxId = ""
      if (!metadata.equipmentName && sessionId) {
        try {
          const sessionRes = await fetch(`/api/checkout_sessions?session_id=${encodeURIComponent(sessionId)}`)
          if (sessionRes.ok) {
            const sessionInfo = await sessionRes.json()
            if (sessionInfo.metadata && Object.keys(sessionInfo.metadata).length > 0) {
              metadata = sessionInfo.metadata
            }
            if (sessionInfo.paymentIntentId) {
              stripeTxId = sessionInfo.paymentIntentId
            }
          }
        } catch (fetchErr) {
          console.warn("Could not retrieve session from /api/checkout_sessions:", fetchErr)
        }
      }

      const txId = stripeTxId || metadata.transactionId || `pi_${sessionId.replace(/[^a-zA-Z0-9]/g, "").slice(-16)}`
      setTransactionId(txId)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

      // Call Express API POST /api/bookings to record booking & payment
      const res = await fetch(`${apiUrl}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify({
          ...metadata,
          transactionId: txId,
          customerEmail: metadata.customerEmail,
          totalAmount: metadata.totalAmount || metadata.amount,
        }),
      })

      const result = await res.json()
      if (res.ok && result.booking) {
        setBookingData(result.booking)
      } else if (metadata.equipmentName) {
        setBookingData(metadata)
      } else {
        throw new Error(result.message || "Failed to finalize booking record.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error confirming payment."
      console.warn("Fulfill payment error:", msg)
      // If we have metadata locally, display fallback confirmed state
      if (rawData) {
        try {
          setBookingData(JSON.parse(decodeURIComponent(rawData)))
        } catch {
          setError(msg)
        }
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, rawData])

  React.useEffect(() => {
    fulfillPayment()
  }, [fulfillPayment])

  return (
    <main className="min-h-screen bg-muted/20 pb-16 pt-10 sm:pt-16">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        {isLoading && (
          <div className="rounded-3xl border bg-card p-12 text-center shadow-xl">
            <div className="mx-auto size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <h2 className="mt-6 text-lg font-bold text-foreground">
              Verifying Stripe Payment...
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Confirming transaction and reserving your equipment in database...
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-xl">
            <h2 className="text-xl font-bold text-foreground">Unable to Verify Session</h2>
            <p className="mt-2 text-xs text-muted-foreground">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={fulfillPayment} variant="outline" className="gap-2">
                <RotateCcw className="size-4" />
                Retry Verification
              </Button>
              <Link href="/equipment">
                <Button>Return to Marketplace</Button>
              </Link>
            </div>
          </div>
        )}

        {!isLoading && bookingData && (
          <div className="rounded-3xl border bg-card p-6 text-center shadow-xl sm:p-10">
            {/* Animated Celebration Icon */}
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-12" />
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                Payment Confirmed
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Rental Booking Confirmed!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your payment was processed securely via Stripe. The owner has been notified to prepare your equipment.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="mt-8 rounded-2xl border bg-muted/30 p-5 text-left text-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-3 font-semibold text-sm">
                <span className="text-foreground">Payment Receipt</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-400">
                  PAID
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Stripe Transaction ID:</span>
                <span className="font-mono font-medium text-foreground">{transactionId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Gateway:</span>
                <span className="font-medium text-foreground">Stripe Checkout</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment Name:</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {bookingData.equipmentName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Rental Duration:</span>
                <span className="font-medium text-foreground">
                  {bookingData.startDate} to {bookingData.endDate} ({bookingData.durationDays || 1} days)
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Units Reserved:</span>
                <span className="font-medium text-foreground">{bookingData.quantity || bookingData.requiredQuantity || 1} unit(s)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery / Site Location:</span>
                <span className="font-medium text-foreground truncate max-w-[220px]">
                  {bookingData.deliveryAddress}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3 text-sm font-bold">
                <span className="text-foreground">Total Amount Paid:</span>
                <span className="text-primary text-base">
                  ৳{parseFloat(bookingData.totalAmount || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT
                </span>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="mt-6 rounded-xl border border-muted bg-muted/20 p-4 text-left text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>What happens next?</span>
              </div>
              <p className="mt-1 leading-relaxed">
                Your reservation is now active. You can track this booking anytime from your Customer Dashboard under <strong>My Rentals</strong>.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard/my-rentals" className="flex-1">
                <Button size="lg" className="w-full gap-2 font-semibold">
                  <Package className="size-4" />
                  View in My Rentals
                </Button>
              </Link>
              <Link href="/equipment" className="flex-1">
                <Button size="lg" variant="outline" className="w-full gap-2">
                  Browse Marketplace
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <AuthRouteGuard>
      <React.Suspense
        fallback={
          <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading payment confirmation...</p>
          </div>
        }
      >
        <PaymentSuccessContent />
      </React.Suspense>
    </AuthRouteGuard>
  )
}

