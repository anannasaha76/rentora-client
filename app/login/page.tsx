
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "react-toastify"
import { RentoraLogo } from "@/components/logo"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Package,
  Clock,
  Handshake,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"
import { generateJwtAccessToken } from "@/lib/jwt"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  function getCallbackUrl() {
    const params = new URLSearchParams(window.location.search)
    const callbackUrl = params.get("callbackUrl")

    if (
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//") &&
      !callbackUrl.includes("\\")
    ) {
      return callbackUrl
    }

    return "/"
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim() || !password) {
      toast.error("Please fill in all required fields.")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signIn.email({
        email: email.trim(),
        password,
      })

      if (error) {
        toast.error(error.message || "Login failed.")
        return
      }

      // Generate JWT Access Token to securely manage session
      await generateJwtAccessToken({
        email: email.trim(),
        id: data?.user?.id,
        name: data?.user?.name,
      })

      toast.success("Welcome back to Rentora!")

      router.push(getCallbackUrl())
      router.refresh()
    } catch {
      toast.error("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)

    try {
      await signIn.social({
        provider: "google",
        callbackURL: getCallbackUrl(),
      })
    } catch {
      toast.error("Google login failed. Please try again.")
      setGoogleLoading(false)
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f8f6] px-4 py-10 sm:px-6 lg:py-16">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-[0_25px_80px_-20px_rgba(0,0,0,0.15)] lg:grid-cols-2">

        {/* Left branding section */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#073b2b] p-10 text-white lg:flex xl:p-12">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

          {/* Logo */}
          <div className="relative z-10">
            <RentoraLogo size="lg" href="/" textClassName="text-white" withTagline />
          </div>

          {/* Main content */}
          <div className="relative z-10 my-12">

            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-200">
              <Sparkles size={14} />
              WELCOME BACK TO RENTORA
            </span>

            <h1 className="max-w-md text-4xl font-bold leading-tight xl:text-5xl">
              Great to have you
              <span className="mt-2 block text-emerald-400">
                back with us.
              </span>
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-emerald-100/70">
              Your next rental is just around the corner. Sign in to
              manage your equipment, explore listings, and continue
              where you left off.
            </p>

            {/* Benefits */}
            <div className="mt-10 space-y-6">

              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Package size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Explore equipment
                  </h3>
                  <p className="mt-1 text-xs text-emerald-100/60">
                    Find the right tools for every project.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Clock size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Manage your rentals
                  </h3>
                  <p className="mt-1 text-xs text-emerald-100/60">
                    Keep track of your bookings with ease.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Handshake size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Connect with others
                  </h3>
                  <p className="mt-1 text-xs text-emerald-100/60">
                    Rent and share resources with confidence.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 border-t border-white/10 pt-6">
            <p className="text-xs text-emerald-100/50">
              © {new Date().getFullYear()} Rentora. All rights reserved.
            </p>
          </div>
        </section>

        {/* Login form section */}
        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-10 xl:p-12">

          {/* Mobile logo */}
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <RentoraLogo size="sm" href="/" />

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Welcome Back
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">

            <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Lock size={22} />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back!
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Sign in to your Rentora account to continue.
            </p>

          </div>

          {/* Google login */}
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              "Connecting to Google..."
            ) : (
              <>
                <svg className="mr-2 size-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>

                Continue with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Or continue with email
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Login form */}
          <form onSubmit={onSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-12`}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading || googleLoading || !email.trim() || !password}
              className="h-12 w-full rounded-xl bg-[#08734e] text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#065c3e] hover:shadow-emerald-900/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                "Signing you in..."
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight size={17} />
                </span>
              )}
            </Button>

            {/* Security message */}
            <div className="flex items-center justify-center gap-2 pt-1 text-center text-xs text-gray-400">
              <ShieldCheck size={15} className="text-emerald-600" />
              Your account and information are protected.
            </div>

          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-700 transition hover:text-emerald-900 hover:underline"
            >
              Create an account
            </Link>
          </p>

        </section>
      </div>
    </main>
  )
}
