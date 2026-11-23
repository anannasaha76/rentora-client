
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  X,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  ArrowRight,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { RentoraLogo } from "@/components/logo"
import { signOut, useSession } from "@/lib/auth-client"
import { getUserProfile } from "@/lib/user"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "All Equipment" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#why-choose-us", label: "Why Rentora" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)
  const [liveUser, setLiveUser] = React.useState<{ name?: string; image?: string } | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const sessionEmail = session?.user?.email || ""

  // Fetch latest user profile from backend on mount or when email changes
  React.useEffect(() => {
    if (!sessionEmail) {
      setLiveUser(null)
      return
    }

    let isMounted = true
    getUserProfile(sessionEmail)
      .then((data) => {
        if (isMounted && data) {
          setLiveUser({
            name: data.name,
            image: data.image,
          })
        }
      })
      .catch(() => {
        // Fallback silently to session user
      })

    return () => {
      isMounted = false
    }
  }, [sessionEmail])

  // Listen for instant profile update events emitted when profile is saved
  React.useEffect(() => {
    function handleProfileUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ name?: string; image?: string }>
      if (customEvent.detail) {
        setLiveUser((prev) => ({
          ...prev,
          name: customEvent.detail.name,
          image: customEvent.detail.image,
        }))
      }
    }

    window.addEventListener("rentora:profile-updated", handleProfileUpdated)
    return () => {
      window.removeEventListener("rentora:profile-updated", handleProfileUpdated)
    }
  }, [])

  const displayName = liveUser?.name || session?.user?.name || "User"
  const displayImage = liveUser?.image !== undefined ? liveUser.image : session?.user?.image

  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function handleLogout() {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      await signOut()
      setOpen(false)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    if (href.startsWith("/#")) return false

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const loginButtonClass =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"

  const registerButtonClass =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white transition-all hover:bg-emerald-800"

  const logoutButtonClass =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition-all hover:bg-red-700"

  const dashboardButtonClass =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 transition-all hover:bg-emerald-100"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <RentoraLogo size="sm" href="/" className="shrink-0" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-[14px] font-medium transition-colors duration-200",
                  "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:rounded-full after:bg-emerald-700 after:transition-transform after:duration-200",
                  active
                    ? "text-emerald-800 after:scale-x-100"
                    : "text-gray-600 after:scale-x-0 hover:text-emerald-800 hover:after:scale-x-100"
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <>
              {/* Logged in User Profile Info (Avatar & Name) */}
              <Link
                href="/dashboard/my-profile"
                className="group flex items-center gap-2.5 rounded-lg border border-transparent p-1.5 transition-colors hover:border-gray-200 hover:bg-gray-50"
                title="View Profile"
              >
                <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800">
                  {displayImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={displayImage}
                      src={displayImage}
                      alt={displayName}
                      className="size-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span className="max-w-[130px] truncate text-xs font-semibold text-gray-900 group-hover:text-emerald-700">
                    {displayName}
                  </span>
                  <span className="max-w-[130px] truncate text-[11px] capitalize text-gray-500">
                    {(session.user as { role?: string })?.role || "Member"}
                  </span>
                </div>
              </Link>

              <Link href="/dashboard" className={dashboardButtonClass}>
                <LayoutDashboard size={17} />
                Dashboard
              </Link>

              <Button
                onClick={handleLogout}
                disabled={loggingOut}
                className={cn(logoutButtonClass, "shadow-none")}
              >
                <LogOut size={17} />
                {loggingOut ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className={loginButtonClass}>
                <LogIn size={17} />
                Login
              </Link>

              <Link href="/register" className={registerButtonClass}>
                <UserPlus size={17} />
                Register
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile / Tablet Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>

      {/* Mobile / Tablet Navigation */}
      {open && (
        <div
          id="mobile-navigation"
          className="border-t border-gray-100 bg-white lg:hidden"
        >
          <nav className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-gray-700 hover:bg-gray-50 hover:text-emerald-800"
                    )}
                  >
                    {link.label}
                    {active && (
                      <span className="size-1.5 rounded-full bg-emerald-700" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Mobile Authentication */}
            <div className="mt-5 flex flex-col gap-2.5 border-t border-gray-100 pt-5">
              {session ? (
                <>
                  <Link
                    href="/dashboard/my-profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/70 p-3 text-left transition-colors hover:bg-gray-100"
                  >
                    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-100/70 text-emerald-800">
                      {displayImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={displayImage}
                          src={displayImage}
                          alt={displayName}
                          className="size-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = "none"
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-semibold text-gray-900">
                        {displayName}
                      </span>
                      <span className="truncate text-xs text-gray-500">
                        {session.user?.email}
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className={dashboardButtonClass}
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <Button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={cn(logoutButtonClass, "w-full shadow-none")}
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={loginButtonClass}
                  >
                    <LogIn size={17} />
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className={registerButtonClass}
                  >
                    <UserPlus size={17} />
                    Register
                    <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
