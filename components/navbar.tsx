"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "All Equipment" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/how-it-works", label: "How it work" },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
            R
          </span>
          <span className="text-lg tracking-tight">Rentora</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Login
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Register
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open ? (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-4">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: "default" }), "w-full")}
                onClick={() => setOpen(false)}
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
