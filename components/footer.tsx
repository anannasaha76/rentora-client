"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Headphones,
  Mail,
  MapPin,
  Package,
  Phone,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"

// Official X (formerly Twitter) brand logo SVG
function XIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

function LinkedInIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
    </svg>
  )
}

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newsletterEmail.trim()) {
      toast.error("Please enter a valid email address.")
      return
    }
    setSubscribed(true)
    toast.success("Thank you for subscribing to Rentora updates!")
    setNewsletterEmail("")
  }

  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      {/* Top Value Propositions Bar */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0 px-4 py-6 text-xs sm:px-6">
          <div className="flex items-center gap-3 py-3 sm:py-0 sm:pr-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Verified Equipment Owners</p>
              <p className="text-muted-foreground">Every listing undergoes administrative review</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3 sm:py-0 sm:px-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Secure Stripe Payments</p>
              <p className="text-muted-foreground">Encrypted transactions & automated booking receipts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3 sm:py-0 sm:pl-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Headphones className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">24/7 Rental Assistance</p>
              <p className="text-muted-foreground">Dedicated support team for dispatch and queries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-12">
          {/* Brand & Mission Column */}
          <div className="space-y-4 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-xs">
                R
              </span>
              <span className="text-xl font-bold tracking-tight">Rentora</span>
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Rentora is the premier equipment rental marketplace connecting verified equipment
              owners with contractors, creators, and individuals nationwide. Transparent pricing,
              flexible durations, and secure bookings.
            </p>

            <div className="space-y-2 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>1200 Innovation Way, Suite 500, Chicago, IL</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-primary shrink-0" />
                <span>+1 (800) 555-RENT (7368)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-primary shrink-0" />
                <span>support@rentora.com</span>
              </div>
            </div>

            {/* Social Media Links with new X logo */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (formerly Twitter)"
                className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LinkedInIcon className="size-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FacebookIcon className="size-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <InstagramIcon className="size-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:col-span-1 md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="transition-colors hover:text-foreground">
                  All Equipment
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="transition-colors hover:text-foreground">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3 sm:col-span-1 md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Equipment Categories
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/equipment?category=Construction+Equipment"
                  className="transition-colors hover:text-foreground"
                >
                  Construction Equipment
                </Link>
              </li>
              <li>
                <Link
                  href="/equipment?category=Photography+Equipment"
                  className="transition-colors hover:text-foreground"
                >
                  Photography Equipment
                </Link>
              </li>
              <li>
                <Link
                  href="/equipment?category=Vehicles+%26+Transportation"
                  className="transition-colors hover:text-foreground"
                >
                  Vehicles & Transportation
                </Link>
              </li>
              <li>
                <Link
                  href="/equipment?category=Agriculture+Equipment"
                  className="transition-colors hover:text-foreground"
                >
                  Agriculture Equipment
                </Link>
              </li>
              <li>
                <Link
                  href="/equipment?category=Electronics"
                  className="transition-colors hover:text-foreground"
                >
                  Electronics & Power Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/equipment?category=Event+Equipment"
                  className="transition-colors hover:text-foreground"
                >
                  Event & Stage Equipment
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals & Newsletter */}
          <div className="space-y-4 md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Stay Informed
            </h3>
            <p className="text-xs text-muted-foreground">
              Subscribe to get seasonal rental discounts, newly added equipment alerts, and industry
              tips.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                />
                <Button type="submit" size="sm" className="shrink-0 gap-1 px-3">
                  <Send className="size-3" />
                  <span className="sr-only sm:not-sr-only text-xs">Join</span>
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Zero spam. Unsubscribe at any time.
              </p>
            </form>

            <div className="pt-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Dashboards
              </h4>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <Link href="/dashboard/my-rentals" className="hover:text-foreground">
                  My Rentals
                </Link>
                <span>•</span>
                <Link href="/dashboard/favorites" className="hover:text-foreground">
                  Favorites
                </Link>
                <span>•</span>
                <Link href="/dashboard/my-equipment" className="hover:text-foreground">
                  Owner Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Rentora Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/terms" className="hover:text-foreground">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/security" className="hover:text-foreground">
              Security
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

