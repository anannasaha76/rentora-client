"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BangladeshiTaka,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  HardHat,
  HelpCircle,
  Layers,
  Lock,
  MapPin,
  Package,
  PartyPopper,
  PlusCircle,
  Quote,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Tractor,
  Truck,
  Users,
  Wrench,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  getFeaturedEquipment,
  getRentalCategories,
  type EquipmentListing,
  type RentalCategory,
} from "@/lib/equipment"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

function formatCurrency(amount?: number) {
  const val = Number(amount) || 0
  return `৳${val.toLocaleString()}`
}

// Dynamic Category Icon Resolver
function getCategoryIcon(title: string) {
  const t = (title || "").toLowerCase()
  if (t.includes("construct") || t.includes("loader") || t.includes("crane")) return HardHat
  if (t.includes("photo") || t.includes("camera") || t.includes("video")) return Camera
  if (t.includes("vehicle") || t.includes("transport") || t.includes("truck") || t.includes("forklift")) return Truck
  if (t.includes("agri") || t.includes("farm") || t.includes("tractor")) return Tractor
  if (t.includes("electr") || t.includes("sound") || t.includes("audio") || t.includes("drone")) return Cpu
  if (t.includes("event") || t.includes("party") || t.includes("stage")) return PartyPopper
  if (t.includes("tool") || t.includes("drill") || t.includes("wrench")) return Wrench
  if (t.includes("clean")) return Sparkles
  if (t.includes("power")) return Wrench
  return Package
}

// Why Choose Us Benefits
const platformBenefits = [
  {
    title: "Affordable Rental Prices",
    description:
      "Direct peer-to-peer and owner-to-business rates without intermediary markups. Save up to 40% compared to traditional rental brokers.",
    icon: BangladeshiTaka,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Verified Equipment Owners",
    description:
      "Every equipment owner passes strict identity and quality verification before their machinery is approved for rental listing.",
    icon: ShieldCheck,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Flexible Rental Periods",
    description:
      "Rent gear for a single day, a critical week, or long-term multi-month construction projects with seamless extension requests.",
    icon: Clock,
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    title: "Secure Payments & Escrow",
    description:
      "Integrated Stripe payment gateway supporting Bangladeshi Taka (৳ BDT). Funds are securely safeguarded until equipment handover.",
    icon: Lock,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
]

// Customer Testimonials / Reviews (At least 4)
const customerReviews = [
  {
    id: 1,
    name: "Rafiqul Islam",
    role: "Civil Contractor, Dhaka",
    rating: 5,
    comment:
      "We needed a 20-ton excavator on short notice for our Uttara foundation project. Rentora connected us with an owner within an hour. Pristine machine, zero breakdowns, and completely transparent daily rates.",
    rentedItem: "Caterpillar 320D Excavator",
    avatar: "RI",
  },
  {
    id: 2,
    name: "Nusrat Jahan",
    role: "Cinematographer, Redline Studios",
    rating: 5,
    comment:
      "Renting cinema cameras used to be a hassle of personal guarantees. On Rentora, we booked a Sony FX6 with prime cine lenses and wireless video transmission. The gear was verified, calibrated, and ready to shoot.",
    rentedItem: "Sony FX6 Cinema Camera Package",
    avatar: "NJ",
  },
  {
    id: 3,
    name: "Tariq Mahmud",
    role: "Farm Operations Lead, Bogura",
    rating: 5,
    comment:
      "During harvest peaks, buying additional tractors makes no financial sense. We rented two high-capacity John Deere tractors through Rentora. The flexible weekly billing saved us over ৳250,000 this season.",
    rentedItem: "John Deere 5050D Tractor",
    avatar: "TM",
  },
  {
    id: 4,
    name: "Ayesha Siddiqua",
    role: "Event Director, Canvas Events",
    rating: 5,
    comment:
      "Organized a 2-day outdoor music festival in Cox's Bazar. Rented two 65kVA silent diesel generators and full truss lighting. Payments were seamless via Stripe in BDT, and the owner was exceptionally supportive.",
    rentedItem: "Perkins 65 kVA Silent Generator",
    avatar: "AS",
  },
]

// How It Works Steps
const howItWorksSteps = [
  {
    step: "01",
    title: "Find Your Equipment",
    description:
      "Browse our verified catalog by category, location, and technical specifications with live pricing.",
    icon: Search,
  },
  {
    step: "02",
    title: "Select Rental Dates",
    description:
      "Choose your start and end dates and required unit quantity with automatic price calculation.",
    icon: Calendar,
  },
  {
    step: "03",
    title: "Instant Secure Checkout",
    description:
      "Pay securely using Stripe in Bangladeshi Taka (৳ BDT) with instant booking confirmation.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Receive & Return",
    description:
      "Pick up or receive equipment on-site, complete your project, and return with guaranteed ease.",
    icon: CheckCircle2,
  },
]

export default function HomePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [featuredEquipment, setFeaturedEquipment] = React.useState<EquipmentListing[]>([])
  const [loadingFeatured, setLoadingFeatured] = React.useState(true)

  const [categories, setCategories] = React.useState<RentalCategory[]>([])
  const [loadingCategories, setLoadingCategories] = React.useState(true)

  React.useEffect(() => {
    async function loadFeatured() {
      try {
        const items = await getFeaturedEquipment()
        setFeaturedEquipment(items)
      } catch (err) {
        console.error("Failed to load featured equipment on homepage:", err)
      } finally {
        setLoadingFeatured(false)
      }
    }

    async function loadCategories() {
      try {
        const cats = await getRentalCategories()
        setCategories(cats)
      } catch (err) {
        console.error("Failed to load dynamic categories on homepage:", err)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadFeatured()
    loadCategories()
  }, [])

  // Handle View Details: If user not logged in -> redirect to /login?callbackUrl=...
  // If logged in -> redirect to /equipment/[id]
  const handleViewDetails = (equipmentId: string) => {
    if (!session) {
      router.push(`/login?callbackUrl=/equipment/${equipmentId}`)
    } else {
      router.push(`/equipment/${equipmentId}`)
    }
  }

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* =====================================================================
          1. BANNER SECTION (HERO)
          ===================================================================== */}
      <section id="home" className="relative overflow-hidden bg-radial from-primary/10 via-background to-background pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Background Decorative Blobs */}
        <div className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-0 size-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>The Smart Equipment Rental Marketplace</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Rent Industrial & Commercial Equipment{" "}
                <span className="bg-gradient-to-r from-primary via-emerald-600 to-sky-600 bg-clip-text text-transparent">
                  With Confidence
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
                Rentora connects verified equipment owners with contractors, cinematographers,
                farmers, and event organizers. Access heavy machinery, tools, and pro media gear
                without capital burden.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col gap-3.5 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/equipment"
                  className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-lg shadow-primary/20 text-base")}
                >
                  <span>Explore Equipment</span>
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="/dashboard/add-equipment"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 text-base")}
                >
                  <PlusCircle className="size-4" />
                  <span>List Your Equipment</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>100% Verified Owners</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Stripe Secure Escrow</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Zero Hidden Markups</span>
                </div>
              </div>
            </motion.div>

            {/* Right Banner Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                  alt="Industrial Machinery & Equipment on Rentora"
                  fill
                  unoptimized
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Floating Metric Pill */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-background/85 p-4 backdrop-blur-md dark:bg-card/85">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Live Marketplace
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        Over 500+ Active Equipment Listings Ready
                      </p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. FEATURED EQUIPMENT SECTION (MongoDB $limit 6)
          ===================================================================== */}
      <section id="featured" className="mx-auto max-w-6xl px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              <span>Handpicked For You</span>
            </div>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Featured Equipment
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Top-rated, verified machinery and pro gear ready for immediate rental.
            </p>
          </div>

          <Link
            href="/equipment"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2 shrink-0")}
          >
            <span>View All Catalog</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Featured Items Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loadingFeatured ? (
            // Skeletons
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-16/10 w-full rounded-2xl bg-muted" />
                <div className="space-y-2 p-2">
                  <div className="h-4 w-28 rounded-md bg-muted" />
                  <div className="h-5 w-3/4 rounded-md bg-muted" />
                  <div className="h-3.5 w-full rounded-md bg-muted/60" />
                  <div className="h-14 w-full rounded-2xl bg-muted/50 mt-4" />
                </div>
              </div>
            ))
          ) : featuredEquipment.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-border bg-card p-12 text-center">
              <Package className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-bold text-foreground">
                No Featured Equipment Listed
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back shortly as new approved equipment is updated.
              </p>
            </div>
          ) : (
            featuredEquipment.map((item, index) => {
              const id = item._id || item.id || ""
              const hasStock = (item.availableQuantity ?? 1) > 0

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5"
                >
                  {/* Equipment Thumbnail Image with Overlays */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.equipmentName}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted/60 text-muted-foreground">
                        <Package className="size-10" />
                      </div>
                    )}

                    {/* Gradient Overlay for Legibility */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Left: Category Pill */}
                    <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-background/90 dark:bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs border border-white/20 dark:border-border/40">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <span>{item.category || "General"}</span>
                    </span>

                    {/* Top Right: Condition / Verified Badge */}
                    <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-1 text-[11px] font-bold text-primary-foreground backdrop-blur-md shadow-xs">
                      <ShieldCheck className="size-3" />
                      <span>{item.equipmentCondition || "Verified"}</span>
                    </span>

                    {/* Bottom Floating Bar inside Image: Location & Stock */}
                    <div className="absolute inset-x-3.5 bottom-3 flex items-center justify-between text-[11px] font-medium text-white/95">
                      <div className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-md border border-white/10">
                        <MapPin className="size-3 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{item.location || "Bangladesh"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-md border border-white/10">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            hasStock
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                              : "bg-rose-400"
                          )}
                        />
                        <span>{hasStock ? `${item.availableQuantity} in stock` : "Out of stock"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* Brand / Model / Spec subtitle */}
                    {(item.brand || item.model) ? (
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {[item.brand, item.model].filter(Boolean).join(" • ")}
                      </p>
                    ) : (
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Verified Listing
                      </p>
                    )}

                    {/* Equipment Name */}
                    <h3
                      className="mt-1 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1"
                      title={item.equipmentName}
                    >
                      {item.equipmentName}
                    </h3>

                    {/* Description preview */}
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.description || "Inspected industrial-grade equipment ready for commercial or personal rental."}
                    </p>

                    {/* Owner trust indicator */}
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Instant Booking</span>
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground capitalize">
                        {item.rentalType || "Daily"} Plan
                      </span>
                    </div>

                    {/* Pricing & CTA Card Row */}
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/50 bg-muted/40 p-3.5 transition-colors group-hover:border-primary/20 group-hover:bg-accent/40">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Rental Rate
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black tracking-tight text-foreground">
                            {formatCurrency(item.rentalPrice)}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            /{item.rentalType ? item.rentalType.toLowerCase() : "day"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleViewDetails(id)}
                        className="gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:gap-2"
                      >
                        <span>View Details</span>
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </section>

      {/* =====================================================================
          3. CATEGORIES SECTION
          ===================================================================== */}
      <section id="categories" className="mx-auto max-w-6xl px-4 sm:px-6 scroll-mt-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Layers className="size-3.5" />
            <span>Curated Inventory</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Popular Rental Categories
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Explore industry-specific machinery and professional gear engineered for performance.
          </p>
        </div>

        {/* Categories Grid (Dynamic with Skeleton Loading & Framer Motion) */}
        {loadingCategories ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-52 flex-col justify-between rounded-2xl border border-border/60 bg-muted/30 p-6 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="size-12 rounded-2xl bg-muted" />
                  <div className="h-5 w-24 rounded-full bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-2/3 rounded-md bg-muted" />
                  <div className="h-3.5 w-full rounded-md bg-muted" />
                  <div className="h-3.5 w-4/5 rounded-md bg-muted" />
                </div>
                <div className="h-4 w-1/3 rounded-md bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => {
              const Icon = getCategoryIcon(cat.title)
              return (
                <motion.div
                  key={cat.title || cat.name || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    href={`/equipment?category=${encodeURIComponent(cat.title)}`}
                    className={cn(
                      "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xs transition-all hover:shadow-lg",
                      cat.border || "border-primary/20",
                      cat.color || "from-primary/20 to-primary/5 text-primary"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-background/80 shadow-xs backdrop-blur-xs">
                        <Icon className="size-6" />
                      </span>
                      <span className="rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-xs">
                        {cat.count ||
                          (cat.totalListings
                            ? `${cat.totalListings} Listing${cat.totalListings === 1 ? "" : "s"}`
                            : "Available for Rent")}
                      </span>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {cat.description || "Professional equipment and machinery available for immediate booking."}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground group-hover:text-primary flex items-center gap-1">
                        <span>Browse {cat.title}</span>
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </span>

                      {cat.minPrice && cat.minPrice > 0 ? (
                        <span className="text-[11px] font-medium text-muted-foreground">
                          From {formatCurrency(cat.minPrice)}/day
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* =====================================================================
          4. WHY CHOOSE US SECTION
          ===================================================================== */}
      <section id="why-choose-us" className="bg-muted/40 py-16 lg:py-24 border-y border-border/80 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="size-3.5" />
              <span>Platform Advantages</span>
            </div>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Why Choose Rentora
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Built specifically to eliminate the friction, risks, and excessive broker markups of equipment rentals.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/30 transition-all hover:shadow-md"
                >
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl",
                      benefit.color
                    )}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. EXTRA SECTION 1: HOW IT WORKS
          ===================================================================== */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 scroll-mt-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <HelpCircle className="size-3.5" />
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            How Rentora Works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            From search to project completion in four simple, transparent steps.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((s, index) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-border/70 bg-card shadow-xs"
              >
                {/* Step badge */}
                <span className="absolute -top-3.5 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground shadow-xs">
                  Step {s.step}
                </span>

                <div className="mt-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-7" />
                </div>

                <h3 className="mt-5 text-base font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* =====================================================================
          6. CUSTOMER REVIEWS SECTION (At least 4)
          ===================================================================== */}
      <section id="reviews" className="mx-auto max-w-6xl px-4 sm:px-6 scroll-mt-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Star className="size-3.5 fill-primary" />
            <span>Customer Stories</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Trusted by construction firms, production crews, event organizers, and agricultural enterprises.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {customerReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/30 transition-all hover:shadow-md"
            >
              <div>
                {/* Rating Stars & Verified Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-500" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    <span>Verified Rental</span>
                  </span>
                </div>

                {/* Review Comment */}
                <p className="mt-4 text-sm text-foreground/90 italic leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {review.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                </div>

                <div className="text-right text-xs text-muted-foreground hidden sm:block">
                  <span className="font-medium text-foreground">Rented:</span>
                  <p className="truncate max-w-[150px]">{review.rentedItem}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          7. EXTRA SECTION 2: OWNER CTA BANNER
          ===================================================================== */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-emerald-500/10 to-sky-500/15 p-8 sm:p-12 text-center lg:text-left shadow-xl"
        >
          <div className="grid items-center gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                <BangladeshiTaka className="size-3.5" />
                <span>Monetize Your Machinery</span>
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Have Idle Machinery or Production Gear?
              </h3>
              <p className="text-sm text-muted-foreground sm:text-base max-w-xl">
                Join hundreds of verified equipment owners in Bangladesh generating steady monthly
                rental income. We handle customer verification, automated booking agreements, and
                Stripe payment escrow.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <Link
                href="/dashboard/add-equipment"
                className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-lg")}
              >
                <PlusCircle className="size-4" />
                <span>Start Listing Today</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
