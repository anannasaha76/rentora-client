"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "react-toastify"

function AuthToastHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const firedRef = React.useRef(false)

  React.useEffect(() => {
    const authStatus = searchParams.get("auth_status")
    if (!authStatus || firedRef.current) return

    firedRef.current = true

    if (authStatus === "google_login_success") {
      toast.success("Welcome back to Rentora!", {
        toastId: "google-auth-toast",
      })
    } else if (authStatus === "google_register_success") {
      toast.success("Welcome to Rentora! Account created successfully.", {
        toastId: "google-auth-toast",
      })
    }

    // Clean up query parameter from the URL cleanly without reloading
    const params = new URLSearchParams(searchParams.toString())
    params.delete("auth_status")
    const newQuery = params.toString()
    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [searchParams, router, pathname])

  return null
}

export function AuthToastProvider() {
  return (
    <React.Suspense fallback={null}>
      <AuthToastHandler />
    </React.Suspense>
  )
}
