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

  React.useEffect(() => {
    if (isPending) return

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

  if (isPending) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 sm:px-6">
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
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

