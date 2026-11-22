
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "react-toastify"
import { RentoraLogo } from "@/components/logo"
import {
  User,
  Mail,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { signIn, signUp } from "@/lib/auth-client"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [photo, setPhoto] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState("customer")

  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const requirements = [
    {
      label: "At least 6 characters",
      valid: password.length >= 6,
    },
    {
      label: "One uppercase letter (A-Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter (a-z)",
      valid: /[a-z]/.test(password),
    },
  ]

  const passwordValid = requirements.every((item) => item.valid)

  async function handlePhotoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.")
      e.target.value = ""
      return
    }

    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY

    if (!key) {
      toast.error("Image upload is not configured.")
      e.target.value = ""
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${key}`,
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()

      if (!res.ok || !data?.data?.url) {
        throw new Error(data?.error?.message || "Upload failed")
      }

      setPhoto(data.data.url)
      toast.success("Profile photo uploaded successfully!")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload photo."
      )
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !photo || !password || !role) {
      toast.error("Please complete all required fields.")
      return
    }

    if (!passwordValid) {
      toast.error("Please fulfill all password requirements.")
      return
    }

    if (!["customer", "owner"].includes(role)) {
      toast.error("Please select a valid account type.")
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photo,
        role,
      } as Parameters<typeof signUp.email>[0] & { role: string })

      if (error) {
        toast.error(error.message || "Registration failed.")
        return
      }

      toast.success("Welcome to Rentora! Account created successfully.")
      router.push("/")
    } catch {
      toast.error("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true)

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      })
    } catch {
      toast.error("Google sign-up failed.")
      setGoogleLoading(false)
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700"

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8f6] px-4 py-10 sm:px-6 lg:py-16">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-[0_25px_80px_-20px_rgba(0,0,0,0.15)] lg:grid-cols-2">

        {/* Left branding section */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#073b2b] p-10 text-white lg:flex xl:p-12">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative z-10">
            <RentoraLogo size="lg" href="/" textClassName="text-white" withTagline />
          </div>

          <div className="relative z-10 my-12">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-200">
              <Sparkles size={14} />
              SMARTER RENTALS, SIMPLER LIVING
            </span>

            <h1 className="max-w-md text-4xl font-bold leading-tight xl:text-5xl">
              Everything you need,
              <span className="mt-2 block text-emerald-400">
                just a rental away.
              </span>
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-emerald-100/70">
              Join Rentora and discover a smarter way to rent and share
              equipment. Save money, earn more, and make every resource count.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "Discover equipment that fits your needs",
                "List your equipment and earn extra income",
                "Enjoy a simple and secure rental experience",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check size={15} />
                  </div>
                  <span className="text-sm text-emerald-50/90">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-6">
            <p className="text-xs text-emerald-100/50">
              © {new Date().getFullYear()} Rentora. All rights reserved.
            </p>
          </div>
        </section>

        {/* Registration form */}
        <section className="p-6 sm:p-10 lg:p-10 xl:p-12">

          <div className="mb-8 flex items-center justify-between lg:hidden">
            <RentoraLogo size="sm" href="/" />
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Create Account
            </span>
          </div>

          <div className="mb-7">
            <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <User size={22} />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Start your rental journey with Rentora today.
            </p>
          </div>

          {/* Google sign-up */}
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={handleGoogleSignUp}
            disabled={loading || uploading || googleLoading}
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

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Or register with email
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label htmlFor="name" className={labelClass}>
                Full name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={inputClass}
                  autoComplete="name"
                  required
                  minLength={2}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email address <span className="text-red-500">*</span>
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

            {/* Photo */}
            <div>
              <label htmlFor="photo" className={labelClass}>
                Profile photo <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Camera className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
                <input
                  id="photo"
                  type="url"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className={inputClass}
                  required
                />
              </div>

              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700">
                <Upload size={17} />
                {uploading ? "Uploading..." : "Upload from device"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {photo && (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                  <img
                    src={photo}
                    alt="Profile preview"
                    className="size-12 rounded-full border border-emerald-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-emerald-800">
                      Photo added successfully
                    </p>
                    <p className="text-xs text-emerald-700">
                      Your profile photo is ready.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhoto("")}
                    className="rounded-full p-2 text-emerald-700 hover:bg-emerald-100"
                    aria-label="Remove photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Account type */}
            <div>
              <label htmlFor="role" className={labelClass}>
                Account type <span className="text-red-500">*</span>
              </label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                required
              >
                <option value="customer">Customer – Rent equipment</option>
                <option value="owner">Owner – List equipment for rent</option>
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Choose how you want to use Rentora.
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={`${inputClass} pr-12`}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Live password requirements */}
              <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700">
                    Password requirements
                  </p>

                  <span
                    className={`text-xs font-semibold ${
                      passwordValid ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    {requirements.filter((item) => item.valid).length}/3 completed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {requirements.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5"
                    >
                      <div
                        className={`flex size-4 items-center justify-center rounded-full ${
                          item.valid
                            ? "bg-emerald-500 text-white"
                            : "border border-gray-300 bg-white"
                        }`}
                      >
                        {item.valid && <Check size={11} strokeWidth={3} />}
                      </div>

                      <span
                        className={`text-xs transition-colors ${
                          item.valid
                            ? "font-medium text-emerald-700"
                            : "text-gray-500"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={
                loading ||
                uploading ||
                googleLoading ||
                !passwordValid ||
                !photo ||
                !name.trim() ||
                !email.trim()
              }
              className="h-12 w-full rounded-xl bg-[#08734e] text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#065c3e] hover:shadow-emerald-900/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                "Creating your account..."
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight size={17} />
                </span>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-center text-xs text-gray-400">
              <ShieldCheck size={15} className="text-emerald-600" />
              Your information is protected and secure.
            </div>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-700 transition hover:text-emerald-900 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
