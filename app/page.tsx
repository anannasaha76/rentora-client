"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
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
import { getFeaturedEquipment, type EquipmentListing } from "@/lib/equipment"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

function formatCurrency(amount?: number) {
  const val = Number(amount) || 0
  return `৳${val.toLocaleString()}`
}

// 6 Popular Categories
const categories = [
  {
    title: "Construction Equipment",
    description: "Excavators, concrete mixers, scaffoldings & compactors",
    icon: HardHat,
    color: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    count: "45+ Available",
  },
  {
    title: "Photography Equipment",
    description: "Cinema cameras, prime lenses, gimbals & studio lighting",
    icon: Camera,
    color: "from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    count: "60+ Available",
  },
  {
    title: "Vehicles & Transportation",
    description: "Pickup trucks, cargo vans, trailers & flatbeds",
    icon: Truck,
    color: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    count: "30+ Available",
  },
  {
    title: "Agriculture Equipment",
    description: "High-horsepower tractors, harvesters & irrigation pumps",
    icon: Tractor,
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    count: "35+ Available",
  },
  {
    title: "Electronics",
    description: "Heavy-duty sound systems, drone kits & testing tools",
    icon: Cpu,
    color: "from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    count: "50+ Available",
  },
  {
    title: "Event Equipment",
    description: "Stage setups, truss systems, industrial generators & lights",
    icon: PartyPopper,
    color: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    count: "40+ Available",
  },
]

// Why Choose Us Benefits
const platformBenefits = [
  {
    title: "Affordable Rental Prices",
    description:
      "Direct peer-to-peer and owner-to-business rates without intermediary markups. Save up to 40% compared to traditional rental brokers.",
    icon: DollarSign,
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
    loadFeatured()
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
                className="overflow-hidden rounded-2xl border border-border/70 bg-card p-4 animate-pulse space-y-4"
              >
                <div className="h-48 w-full rounded-xl bg-muted" />
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted/60" />
                <div className="h-8 w-full rounded-lg bg-muted" />
              </div>
            ))
          ) : featuredEquipment.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center">
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
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all hover:border-primary/40 hover:shadow-xl"
                >
                  {/* Equipment Thumbnail Image */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.equipmentName}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <Package className="size-10" />
                      </div>
                    )}
                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-xs shadow-xs">
                      {item.category || "General"}
                    </span>
                    {/* Condition Badge */}
                    {item.equipmentCondition && (
                      <span className="absolute top-3 right-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground backdrop-blur-xs shadow-xs">
                        {item.equipmentCondition}
                      </span>
                    )}
                  </div>

                  {/* Equipment Details Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="font-bold text-foreground line-clamp-1 text-lg group-hover:text-primary transition-colors"
                        title={item.equipmentName}
                      >
                        {item.equipmentName}
                      </h3>
                    </div>

                    {(item.brand || item.model) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[item.brand, item.model].filter(Boolean).join(" • ")}
                      </p>
                    )}

                    {/* Location & Stock */}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[140px]">{item.location || "Bangladesh"}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            (item.availableQuantity ?? 1) > 0 ? "bg-emerald-500" : "bg-rose-500"
                          )}
                        />
                        <span>{item.availableQuantity ?? 1} in stock</span>
                      </div>
                    </div>

                    <div className="my-4 border-t border-border/70" />

                    {/* Pricing & View Details Button */}
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Rate
                        </p>
                        <p className="text-xl font-extrabold text-foreground">
                          {formatCurrency(item.rentalPrice)}
                          <span className="text-xs font-normal text-muted-foreground">
                            {" "}/ {item.rentalType || "day"}
                          </span>
                        </p>
                      </div>

                      <Button
                        onClick={() => handleViewDetails(id)}
                        className="gap-1.5 shadow-xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="size-3.5" />
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

        {/* Categories Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => {
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link
                  href={`/equipment?category=${encodeURIComponent(cat.title)}`}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xs transition-all hover:shadow-lg",
                    cat.border,
                    cat.color
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-background/80 shadow-xs backdrop-blur-xs">
                      <Icon className="size-6" />
                    </span>
                    <span className="rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-xs">
                      {cat.count}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-foreground group-hover:text-primary">
                    <span>Browse {cat.title}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
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
                <DollarSign className="size-3.5" />
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

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end justify-center">
              <Link
                href="/dashboard/add-equipment"
                className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-lg")}
              >
                <PlusCircle className="size-4" />
                <span>Start Listing Today</span>
              </Link>
              <Link
                href="/how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Learn Owner Terms
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
