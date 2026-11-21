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
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"

function StripeCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("session_id") || `cs_test_${Date.now()}`
  const rawData = searchParams.get("data")

  const [metadata, setMetadata] = React.useState<Record<string, string>>({})
  const [cardNumber, setCardNumber] = React.useState("4242 •••• •••• 4242")
  const [expiry, setExpiry] = React.useState("12/28")
  const [cvc, setCvc] = React.useState("123")
  const [cardholderName, setCardholderName] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)

  React.useEffect(() => {
    if (rawData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rawData))
        setMetadata(parsed)
        if (parsed.customerName) {
          setCardholderName(parsed.customerName)
        }
      } catch (e) {
        console.error("Failed to parse checkout session metadata:", e)
      }
    }
  }, [rawData])

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      // Redirect to payment success page as specified in Stripe guide
      const successUrl = `/payment-success?session_id=${sessionId}${
        rawData ? `&data=${encodeURIComponent(rawData)}` : ""
      }`
      router.push(successUrl)
    }, 1200)
  }

  const fillTestCard = () => {
    setCardNumber("4242 4242 4242 4242")
    setExpiry("04/28")
    setCvc("424")
    if (metadata.customerName) {
      setCardholderName(metadata.customerName)
    }
  }

  const totalAmount = parseFloat(metadata.totalAmount || "0")
  const isBDT = (metadata.currency || "bdt").toLowerCase() === "bdt"
  const currencySymbol = isBDT ? "৳" : "$"

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#3c4257] antialiased">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col lg:flex-row">
        {/* Left Column: Stripe Order Summary */}
        <div className="flex flex-col justify-between border-b bg-white p-8 lg:w-5/12 lg:border-b-0 lg:border-r lg:p-12">
          <div>
            <Link
              href={metadata.equipmentId ? `/equipment/${metadata.equipmentId}` : "/equipment"}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Cancel and return to Rentora
            </Link>

            <div className="mt-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rentora Marketplace ({isBDT ? "BDT" : "USD"})
              </span>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#1a1f36]">
                {currencySymbol}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
            </div>

            {/* Equipment Preview */}
            <div className="mt-8 rounded-xl border border-gray-100 bg-[#f8f9fa] p-4">
              <div className="flex gap-3">
                {metadata.equipmentImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={metadata.equipmentImage}
                    alt={metadata.equipmentName || "Equipment"}
                    className="size-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                    <Package className="size-8" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold text-[#1a1f36]">
                    {metadata.equipmentName || "Equipment Rental"}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Qty: {metadata.quantity || 1} • {metadata.durationDays || 1} day(s)
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">
                    {currencySymbol}{metadata.rentalPrice || 0} / {(metadata.rentalType || "Daily").toLowerCase()}
                  </p>
                </div>
              </div>

              {metadata.startDate && (
                <div className="mt-3 flex items-center justify-between border-t border-gray-200/60 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    Period:
                  </span>
                  <span className="font-medium text-[#1a1f36]">
                    {metadata.startDate} to {metadata.endDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="size-3 text-emerald-600" />
              <span>Guaranteed 256-bit SSL encrypted connection</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stripe Payment Form */}
        <div className="flex flex-1 flex-col justify-between bg-[#f8f9fa] p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            {/* Stripe Badge Header */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Pay with card</span>
              <button
                type="button"
                onClick={fillTestCard}
                className="inline-flex items-center gap-1 rounded bg-[#635bff]/10 px-2.5 py-1 text-xs font-semibold text-[#635bff] hover:bg-[#635bff]/20"
              >
                <Sparkles className="size-3" />
                Fill Stripe Test Card
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              {/* Customer Email */}
              <div>
                <label className="block text-xs font-semibold text-[#3c4257]">Email</label>
                <input
                  type="email"
                  required
                  readOnly
                  value={metadata.customerEmail || ""}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#1a1f36] shadow-xs focus:border-[#635bff] focus:outline-none"
                />
              </div>

              {/* Card Information */}
              <div>
                <label className="block text-xs font-semibold text-[#3c4257]">Card information</label>
                <div className="mt-1 overflow-hidden rounded-md border border-gray-300 bg-white shadow-xs">
                  <div className="relative border-b border-gray-200 px-3 py-2">
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-transparent font-mono text-sm text-[#1a1f36] outline-none"
                    />
                    <CreditCard className="absolute right-3 top-2.5 size-4 text-gray-400" />
                  </div>
                  <div className="flex divide-x divide-gray-200">
                    <input
                      type="text"
                      required
                      placeholder="MM / YY"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-1/2 bg-transparent px-3 py-2 font-mono text-sm text-[#1a1f36] outline-none"
                    />
                    <input
                      type="password"
                      required
                      placeholder="CVC"
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-1/2 bg-transparent px-3 py-2 font-mono text-sm text-[#1a1f36] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Name on Card */}
              <div>
                <label className="block text-xs font-semibold text-[#3c4257]">Cardholder name</label>
                <input
                  type="text"
                  required
                  placeholder="Full name on card"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#1a1f36] shadow-xs focus:border-[#635bff] focus:outline-none"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-[#3c4257]">Country or region</label>
                <select className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#1a1f36] shadow-xs focus:border-[#635bff] focus:outline-none">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="BD">Bangladesh</option>
                </select>
              </div>

              {/* Submit Pay Button */}
              <div className="pt-3">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isProcessing}
                    className="w-full bg-[#635bff] font-bold text-white shadow-md hover:bg-[#5340eb]"
                  >
                    <Lock className="mr-1.5 size-4" />
                    {isProcessing ? "Processing..." : `Pay ${currencySymbol}${totalAmount.toFixed(2)}`}
                  </Button>
              </div>
            </form>
          </div>

          {/* Stripe Footer */}
          <div className="mx-auto mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <span className="font-bold tracking-wider text-[#635bff]">stripe</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StripeCheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Redirecting to Stripe Checkout...</p>
        </div>
      }
    >
      <StripeCheckoutContent />
    </React.Suspense>
  )
}

