"use client"

import {
  Bookmark,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Package,
  PlusCircle,
  UserRound,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { RentoraIcon, RentoraLogo } from "@/components/logo"
import { signOut, useSession } from "@/lib/auth-client"
import { removeAccessToken } from "@/lib/jwt"
import { cn } from "@/lib/utils"

const ownerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/add-equipment", label: "Add Equipment", icon: PlusCircle },
  { href: "/dashboard/my-equipment", label: "My Equipment", icon: Package },
  {
    href: "/dashboard/my-equipment-rental",
    label: "My Equipment Rental",
    icon: ClipboardList,
  },
  { href: "/dashboard/my-profile", label: "My Profile", icon: UserRound },
]

const customerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-rentals", label: "My Rentals", icon: ClipboardList },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/my-profile", label: "Profile", icon: UserRound },
]

const adminLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/all-users", label: "All Users", icon: Users },
  { href: "/dashboard/all-equipment", label: "All Equipment", icon: Package },
  { href: "/dashboard/all-rentals", label: "All Rentals", icon: ClipboardList },
  { href: "/dashboard/my-profile", label: "My Profile", icon: UserRound },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  async function handleLogout() {
    removeAccessToken()
    await signOut()
    setMobileOpen(false)
    router.push("/")
    router.refresh()
  }

  const role = session?.user?.role || "customer"
  const links =
    role === "owner" ? ownerLinks : role === "admin" ? adminLinks : customerLinks

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
      <aside className="lg:w-60 lg:shrink-0">
        {/* Brand Header for Desktop Sidebar */}
        <div className="mb-5 hidden items-center px-1 lg:flex">
          <RentoraLogo size="sm" href="/" withTagline />
        </div>

        <Button
          variant="outline"
          className="w-full justify-between lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2 font-medium">
            <RentoraIcon size={18} />
            <span>Dashboard menu</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {mobileOpen ? "Hide" : "Show"}
          </span>
        </Button>

        <div className={cn("mt-3 space-y-1 lg:mt-0", mobileOpen ? "block" : "hidden lg:block")}>
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
          <div className="border-t pt-3 lg:hidden">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  )
}
