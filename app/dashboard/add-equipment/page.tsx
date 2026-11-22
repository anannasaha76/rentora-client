"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "react-toastify"

import { OwnerRouteGuard } from "@/components/owner-route-guard"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { getAuthHeaders } from "@/lib/getTokenFromClient"
import {
  equipmentApiUrl,
  type EquipmentFormValues,
  type RentalType,
} from "@/lib/equipment"

const inputClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const textareaClass =
  "min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const categories = [
  "Excavators",
  "Loaders",
  "Cranes",
  "Forklifts",
  "Tractors",
  "Generators",
  "Power Tools",
  "Other",
]

const rentalTypes: RentalType[] = ["Daily", "Weekly", "Monthly"]

const conditions = ["New", "Excellent", "Good", "Fair", "For parts"]

const initialForm: EquipmentFormValues = {
  equipmentName: "",
  description: "",
  category: "",
  location: "",
  rentalPrice: "",
  rentalType: "Daily",
  availableQuantity: "",
  equipmentCondition: "",
  brand: "",
  model: "",
  image: "",
  rentalTerms: "",
}

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function AddEquipmentForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = React.useState<EquipmentFormValues>(initialForm)
  const [uploading, setUploading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  function update<K extends keyof EquipmentFormValues>(
    key: K,
    value: EquipmentFormValues[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!key) {
      toast.error("Image upload is not configured. Please provide a direct image link.")
      e.target.value = ""
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data?.data?.url) {
        throw new Error(data?.error?.message || "Upload failed")
      }
      update("image", data.data.url)
      toast.success("Equipment image uploaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    const requiredFields: (keyof EquipmentFormValues)[] = [
      "equipmentName",
      "description",
      "category",
      "location",
      "rentalPrice",
      "availableQuantity",
      "equipmentCondition",
      "brand",
      "model",
      "image",
      "rentalTerms",
    ]
    if (requiredFields.some((key) => !String(form[key]).trim())) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (Number(form.rentalPrice) <= 0) {
      toast.error("Rental price must be greater than zero.")
      return
    }
    if (!Number.isInteger(Number(form.availableQuantity)) || Number(form.availableQuantity) < 1) {
      toast.error("Available quantity must be a whole number of at least 1.")
      return
    }
    if (!session?.user) {
      toast.error("You must be signed in to add equipment.")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        ownerId: session.user.id,
        ownerName: session.user.name || "",
        ownerEmail: session.user.email || "",
        status: "Pending" as const,
      }

      const res = await fetch(`${equipmentApiUrl}/api/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify(payload),
      })
      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Failed to submit equipment."
        throw new Error(message)
      }

      toast.success("Equipment submitted for review.")
      setForm(initialForm)
      router.push("/dashboard/my-equipment")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit equipment.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Equipment details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            List the equipment you want to make available for rent.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="equipmentName" label="Equipment Name" required>
            <input
              id="equipmentName"
              type="text"
              value={form.equipmentName}
              onChange={(e) => update("equipmentName", e.target.value)}
              className={inputClass}
              placeholder="e.g. Caterpillar 320 Excavator"
              required
            />
          </Field>

          <Field id="category" label="Category" required>
            <select
              id="category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field id="description" label="Description" required>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className={textareaClass}
                placeholder="Describe the equipment, its capabilities, and what is included."
                required
              />
            </Field>
          </div>

          <Field id="location" label="Location" required>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className={inputClass}
              placeholder="City, state"
              required
            />
          </Field>

          <Field id="rentalPrice" label="Rental Price" required>
            <input
              id="rentalPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.rentalPrice}
              onChange={(e) => update("rentalPrice", e.target.value)}
              className={inputClass}
              placeholder="0.00"
              required
            />
          </Field>

          <Field id="rentalType" label="Rental Type" required>
            <select
              id="rentalType"
              value={form.rentalType}
              onChange={(e) => update("rentalType", e.target.value as RentalType)}
              className={inputClass}
              required
            >
              {rentalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field id="availableQuantity" label="Available Quantity" required>
            <input
              id="availableQuantity"
              type="number"
              min="1"
              step="1"
              value={form.availableQuantity}
              onChange={(e) => update("availableQuantity", e.target.value)}
              className={inputClass}
              placeholder="1"
              required
            />
          </Field>

          <Field id="equipmentCondition" label="Equipment Condition" required>
            <select
              id="equipmentCondition"
              value={form.equipmentCondition}
              onChange={(e) => update("equipmentCondition", e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select a condition</option>
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </Field>

          <Field id="brand" label="Brand" required>
            <input
              id="brand"
              type="text"
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              className={inputClass}
              placeholder="e.g. Caterpillar"
              required
            />
          </Field>

          <Field id="model" label="Model" required>
            <input
              id="model"
              type="text"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              className={inputClass}
              placeholder="e.g. 320"
              required
            />
          </Field>

          <Field id="imageUrl" label="Equipment Image" required hint="Direct image link or imgbb upload.">
            <input
              id="imageUrl"
              type="url"
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              className={inputClass}
              placeholder="https://..."
              required
            />
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
            />
            {uploading ? (
              <p className="text-xs text-muted-foreground">Uploading image...</p>
            ) : null}
            {form.image ? (
              <div
                className="mt-2 size-24 rounded-lg border bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url("${form.image}")` }}
                aria-label="Equipment image preview"
              />
            ) : null}
          </Field>

          <Field id="rentalTerms" label="Rental Terms and Conditions" required>
            <textarea
              id="rentalTerms"
              value={form.rentalTerms}
              onChange={(e) => update("rentalTerms", e.target.value)}
              className={textareaClass}
              placeholder="Payment terms, fuel policy, delivery rules, and other conditions."
              required
            />
          </Field>
        </div>

        <Field id="status" label="Status" hint="New listings are submitted as Pending.">
          <select id="status" value="Pending" disabled className={inputClass}>
            <option value="Pending">Pending</option>
          </select>
        </Field>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Owner Information</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{session?.user?.name || "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{session?.user?.email || "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium">{session?.user?.role || "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Owner ID</dt>
            <dd className="break-all font-medium">{session?.user?.id || "-"}</dd>
          </div>
        </dl>
      </section>

      <Button type="submit" size="lg" disabled={submitting || uploading}>
        {submitting ? "Submitting..." : "Submit equipment for review"}
      </Button>
    </form>
  )
}

export default function AddEquipmentPage() {
  return (
    <OwnerRouteGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Equipment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new rental listing for your equipment.
          </p>
        </div>
        <AddEquipmentForm />
      </div>
    </OwnerRouteGuard>
  )
}
