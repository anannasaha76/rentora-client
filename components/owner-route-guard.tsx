"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { ensureAccessToken } from "@/lib/jwt"
import { cn } from "@/lib/utils"

export function OwnerRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  React.useEffect(() => {
    if (isPending) return

    if (!session) {
      router.replace("/login")
      return
    }

    if (session.user?.role !== "owner") {
      router.replace("/")
      return
    }

    // Proactively make sure access token exists for owner API calls
    if (session.user?.email) {
      ensureAccessToken({
        email: session.user.email,
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
      }).catch(() => {})
    }
  }, [isPending, router, session])

  if (isPending) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 sm:px-6">
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </div>
    )
  }

  if (!session || session.user.role !== "owner") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center px-4 sm:px-6">
        <div className="w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Owner access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard is only available to owner accounts.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>
              Back to home
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
              Switch account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
