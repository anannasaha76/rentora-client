"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { DashboardShell } from "@/components/dashboard-shell"

const roleRestrictedRoutes: { path: string; roles: string[] }[] = [
  { path: "/dashboard/add-equipment", roles: ["owner"] },
  { path: "/dashboard/my-equipment", roles: ["owner"] },
  { path: "/dashboard/my-equipment-rental", roles: ["owner"] },
  { path: "/dashboard/my-rentals", roles: ["customer"] },
  { path: "/dashboard/favorites", roles: ["customer"] },
  { path: "/dashboard/all-users", roles: ["admin"] },
  { path: "/dashboard/all-equipment", roles: ["admin"] },
  { path: "/dashboard/all-rentals", roles: ["admin"] },
]

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  const allowedRoles = React.useMemo(() => {
    const match = roleRestrictedRoutes.find(
      (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
    )
    return match?.roles
  }, [pathname])

  return (
    <AuthRouteGuard allowedRoles={allowedRoles}>
      <DashboardShell>{children}</DashboardShell>
    </AuthRouteGuard>
  )
}
