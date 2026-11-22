"use client"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { DashboardShell } from "@/components/dashboard-shell"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthRouteGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthRouteGuard>
  )
}
