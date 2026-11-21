"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  Package,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { Button } from "@/components/ui/button"
import { getRentalById, RentalBooking } from "@/lib/rental"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId") || ""
  const transactionId = searchParams.get("tx") || `tx_${Date.now()}`

  const [booking, setBooking] = React.useState<RentalBooking | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!bookingId) {
      setLoading(false)
      return
    }

    getRentalById(bookingId)
      .then((data) => setBooking(data))
      .catch((err) => console.error("Could not fetch booking details:", err))
      .finally(() => setLoading(false))
  }, [bookingId])

  return (
    <main className="min-h-screen bg-muted/20 pb-16 pt-10 sm:pt-16">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
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
              Rental Booking Secured!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for renting with Rentora. Your payment has been processed and the owner has been notified.
            </p>
          </div>

          {/* Receipt Details Box */}
          <div className="mt-8 rounded-2xl border bg-muted/30 p-5 text-left text-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-3 font-semibold text-sm">
              <span className="text-foreground">Payment Receipt</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">PAID</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono font-medium text-foreground">{transactionId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-medium text-foreground">Stripe Secure Checkout</span>
            </div>

            {booking && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipment:</span>
                  <span className="font-semibold text-foreground truncate max-w-[220px]">
                    {booking.equipmentName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Duration:</span>
                  <span className="font-medium text-foreground">
                    {booking.startDate} to {booking.endDate} ({booking.durationDays || 1} day{(booking.durationDays || 1) > 1 ? "s" : ""})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserved Quantity:</span>
                  <span className="font-medium text-foreground">{booking.requiredQuantity} unit(s)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery / Site Address:</span>
                  <span className="font-medium text-foreground truncate max-w-[220px]">
                    {booking.deliveryAddress}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-3 text-sm font-bold">
                  <span className="text-foreground">Total Paid:</span>
                  <span className="text-primary text-base">
                    ${booking.totalAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Next Steps Card */}
          <div className="mt-6 rounded-xl border border-muted bg-muted/20 p-4 text-left text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>What happens next?</span>
            </div>
            <p className="mt-1 leading-relaxed">
              The equipment owner will prepare your reservation. You will receive handover details and tracking updates in your Customer Dashboard under <strong>My Rentals</strong>.
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

