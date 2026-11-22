import Link from "next/link"
import { Home, Package } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 text-center shadow-lg sm:p-8">
        {/* 404 Visual */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="text-2xl font-black">404</span>
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page or equipment listing you are looking for does not exist or has been moved.
        </p>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "default" }), "gap-2 shadow-xs")}
          >
            <Home className="size-4" />
            <span>Go to Home</span>
          </Link>

          <Link
            href="/equipment"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <Package className="size-4" />
            <span>Browse Equipment</span>
          </Link>
        </div>

        {/* Dashboard Link */}
        <div className="mt-5 border-t border-border/70 pt-4 text-xs text-muted-foreground">
          Looking for your account?{" "}
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
