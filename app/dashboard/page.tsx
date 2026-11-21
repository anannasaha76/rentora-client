import Link from "next/link"
import { ClipboardList, Package, PlusCircle, UserRound } from "lucide-react"

import { OwnerRouteGuard } from "@/components/owner-route-guard"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const cards = [
  {
    href: "/dashboard/add-equipment",
    title: "Add Equipment",
    description: "Create a new rental listing. New listings start as Pending.",
    icon: PlusCircle,
  },
  {
    href: "/dashboard/my-equipment",
    title: "My Equipment",
    description: "Review the equipment you have listed for rent.",
    icon: Package,
  },
  {
    href: "/dashboard/my-equipment-rental",
    title: "My Equipment Rental",
    description: "Keep track of rental requests for your equipment.",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/my-profile",
    title: "My Profile",
    description: "View your owner account information.",
    icon: UserRound,
  },
]

export default function DashboardPage() {
  return (
    <OwnerRouteGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Owner Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your equipment, rentals, and profile from one place.
          </p>
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
    </OwnerRouteGuard>
  )
}
