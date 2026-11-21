"use client"

import Link from "next/link"
import {
  ClipboardList,
  Heart,
  Package,
  PlusCircle,
  UserRound,
  Users,
} from "lucide-react"

import { AuthRouteGuard } from "@/components/auth-route-guard"
import { buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const ownerCards = [
  {
    href: "/dashboard/add-equipment",
    title: "Add Equipment",
    description: "Create a new rental listing. New listings start as Pending.",
    icon: PlusCircle,
  },
  {
    href: "/dashboard/my-equipment",
    title: "My Equipment",
    description: "Review and manage the equipment you have listed for rent.",
    icon: Package,
  },
  {
    href: "/dashboard/my-equipment-rental",
    title: "My Equipment Rental",
    description: "Track incoming rental requests and monitor equipment bookings.",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/my-profile",
    title: "My Profile",
    description: "View and update your owner account information.",
    icon: UserRound,
  },
]

const customerCards = [
  {
    href: "/dashboard/my-rentals",
    title: "My Rentals",
    description: "View and manage all your active and past equipment rental bookings.",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/favorites",
    title: "Favorites",
    description: "Browse equipment you have saved for upcoming projects.",
    icon: Heart,
  },
  {
    href: "/dashboard/my-profile",
    title: "My Profile",
    description: "Manage your contact info, delivery address, and account preferences.",
    icon: UserRound,
  },
]

const adminCards = [
  {
    href: "/dashboard/all-users",
    title: "All Users",
    description: "View and manage registered customers, owners, and administrators.",
    icon: Users,
  },
  {
    href: "/dashboard/all-equipment",
    title: "All Equipment",
    description: "Review, approve, or moderate equipment listings across the platform.",
    icon: Package,
  },
  {
    href: "/dashboard/all-rentals",
    title: "All Rentals",
    description: "Monitor global transactions and platform-wide rental activities.",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/my-profile",
    title: "My Profile",
    description: "Update administrator credentials and contact details.",
    icon: UserRound,
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const role = session?.user?.role || "customer"

  const cards =
    role === "owner" ? ownerCards : role === "admin" ? adminCards : customerCards

  const title =
    role === "owner"
      ? "Owner Dashboard"
      : role === "admin"
      ? "Admin Dashboard"
      : "Customer Dashboard"

  const subtitle =
    role === "owner"
      ? "Manage your equipment, rentals, and profile from one central hub."
      : role === "admin"
      ? "Platform moderation, user management, and global oversight."
      : "Access your rental bookings, saved equipment, and account settings."

  return (
    <AuthRouteGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-muted/50"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </span>
                <h2 className="mt-4 text-base font-semibold">{card.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                <span className={cn(buttonVariants({ variant: "link", size: "xs" }), "mt-3 px-0")}>
                  Open
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </AuthRouteGuard>
  )
}
