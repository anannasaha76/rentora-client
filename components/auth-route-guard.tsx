"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function AuthRouteGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  // Track whether we have ever successfully loaded a session check.
  // This prevents premature redirects on page reload when the session
  // cookie exists but the fetch hasn't completed yet.
  const [hasChecked, setHasChecked] = React.useState(false)

  React.useEffect(() => {
    // Don't act until the session query has fully settled
    if (isPending) return

    // Mark that we've completed at least one check
    setHasChecked(true)

    if (!session) {
      router.replace("/login")
      return
    }

    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.user.role || "customer")
    ) {
      router.replace("/")
    }
  }, [isPending, router, session, allowedRoles])

  // Show loading state while session is being fetched OR before the first
  // check completes. This prevents the "Sign in required" flash on reload.
  if (isPending || !hasChecked) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center px-4 sm:px-6">
        <div className="w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please log in to your account to view this page.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
              Sign in
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(session.user.role || "customer")
  ) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center px-4 sm:px-6">
        <div className="w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Access Restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account role ({session.user.role || "customer"}) does not have permission to view this section.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
              Go to Dashboard
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
