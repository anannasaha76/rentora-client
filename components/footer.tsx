"use client"

import * as React from "react"
import Link from "next/link"
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react"

import { RentoraLogo } from "@/components/logo"

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
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      {/* Main Footer Links & Information */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-12">
          {/* Brand & Mission Column */}
          <div className="space-y-4 md:col-span-5">
            <RentoraLogo size="md" href="/" withTagline />
            <p className="text-xs leading-relaxed text-muted-foreground max-w-sm">
              Rentora is the premier equipment rental marketplace connecting verified equipment
              owners with contractors, creators, and individuals nationwide. Transparent pricing,
              flexible durations, and secure bookings.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="space-y-3 sm:col-span-1 md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
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
                <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="transition-colors hover:text-foreground">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details & Social Links (Right column) */}
          <div className="space-y-4 sm:col-span-1 md:col-span-4">
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-foreground/90">1200 Innovation Way, Suite 500, Chicago, IL</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-foreground/90">+1 (800) 555-RENT (7368)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-foreground/90">support@rentora.com</span>
              </div>
            </div>

            {/* Social Media Links matching user reference image */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (formerly Twitter)"
                className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:border-foreground/30 shadow-xs"
              >
                <XIcon className="size-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:border-foreground/30 shadow-xs"
              >
                <LinkedInIcon className="size-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:border-foreground/30 shadow-xs"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:border-foreground/30 shadow-xs"
              >
                <InstagramIcon className="size-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Rentora Inc. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  )
}
