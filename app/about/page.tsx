import Link from "next/link"
import {
  ArrowRight,
  BangladeshiTaka,
  CheckCircle2,
  Heart,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          <span>Our Story & Mission</span>
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Empowering Builders, Creators, and Equipment Owners
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          Rentora was built to transform equipment rentals into a modern, transparent, and frictionless experience. We eliminate costly broker markups, provide verified equipment security, and empower owners to turn idle machinery into steady revenue.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xs">
          <p className="text-3xl font-extrabold text-primary">500+</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Verified Equipment Items</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xs">
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">99.4%</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Fulfillment Rate</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xs">
          <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">৳5M+</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Rental Transactions Paid</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xs">
          <p className="text-3xl font-extrabold text-foreground">100%</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Verified Owner Guarantee</p>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Our Core Principles</h2>
          <p className="mt-1 text-xs text-muted-foreground">What guides our platform engineering and community policies.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Rigorous Verification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every equipment piece undergoes photo validation, operational condition assessment, and owner credential verification before going live.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BangladeshiTaka className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Transparent Economics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clear daily, weekly, and monthly rates in Bangladeshi Taka (৳ BDT) with zero hidden handling fees. What you see is what you pay.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Users className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Community Driven</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Supporting local contractors, independent filmmakers, and agricultural leads with reliable tools when they need them most.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-primary/15 via-emerald-500/10 to-sky-500/15 p-8 sm:p-12 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to Start Renting?</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Explore our complete inventory or list your machinery to start earning today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/equipment" className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-xs")}>
            <Package className="size-4" />
            <span>Browse Equipment</span>
          </Link>
          <Link href="/dashboard/add-equipment" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            List Your Machinery
          </Link>
        </div>
      </div>
    </div>
  )
}
