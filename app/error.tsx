"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = React.useState(false)

  React.useEffect(() => {
    // Log error to console for debugging
    console.error("Rentora Application Error:", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-6 text-center shadow-lg sm:p-8">
        {/* Warning Icon Badge */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" />
        </div>

        {/* Error Titles */}
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Something went wrong!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred while processing your request. Please try again or return to the home page.
        </p>

        {/* Error Message Snippet */}
        {error?.message && (
          <div className="mt-4 rounded-lg border border-border/80 bg-muted/40 p-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Error Message
            </p>
            <p className="mt-1 break-words font-mono text-xs text-destructive">
              {error.message}
            </p>
          </div>
        )}

        {/* Technical Details Toggle */}
        <div className="mt-3 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <span>{showDetails ? "Hide" : "Show"} technical details</span>
            {showDetails ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>

          {showDetails && (
            <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-border bg-muted/60 p-2.5 font-mono text-[11px] text-muted-foreground">
              {error.digest && <p className="font-semibold text-foreground">Digest: {error.digest}</p>}
              <p className="mt-1 whitespace-pre-wrap">{error.stack || "No stack trace available."}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            className="gap-2 shadow-xs"
          >
            <RefreshCw className="size-4" />
            <span>Try Again</span>
          </Button>

          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <Home className="size-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Browse Equipment Shortcut */}
        <div className="mt-4 border-t border-border/70 pt-4 text-xs text-muted-foreground">
          Looking for rentals?{" "}
          <Link href="/equipment" className="font-medium text-primary hover:underline">
            Browse all equipment
          </Link>
        </div>
      </div>
    </div>
  )
}
