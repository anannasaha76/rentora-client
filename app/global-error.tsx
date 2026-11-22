"use client"

import * as React from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Rentora Global Error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 font-sans text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-lg">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive font-bold text-xl">
            !
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Critical Application Error
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A critical error occurred while rendering the page layout.
          </p>
          {error?.message && (
            <p className="mt-3 rounded-lg border border-border bg-muted p-2.5 font-mono text-xs text-destructive">
              {error.message}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => reset()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Reload Application
            </button>
            <a
              href="/"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
