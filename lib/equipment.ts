export type RentalType = "Daily" | "Weekly" | "Monthly"
export type EquipmentStatus = "Pending"

export type EquipmentListing = {
  id: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  equipmentName: string
  description: string
  category: string
  location: string
  rentalPrice: number
  rentalType: RentalType
  availableQuantity: number
  equipmentCondition: string
  brand: string
  model: string
  image: string
  rentalTerms: string
  status: EquipmentStatus
  createdAt: string
}

export type EquipmentFormValues = {
  equipmentName: string
  description: string
  category: string
  location: string
  rentalPrice: string
  rentalType: RentalType
  availableQuantity: string
  equipmentCondition: string
  brand: string
  model: string
  image: string
  rentalTerms: string
}

export const equipmentApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
