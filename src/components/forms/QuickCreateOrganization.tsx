"use client"

import * as yup from "yup"
import { Building2 } from "lucide-react"
import { QuickCreateModal } from "./QuickCreateModal"
import { useCreateOrganization } from "@/hooks/useOrganizations"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// Minimal organization schema for quick creation
const quickOrganizationSchema = yup.object({
  name: yup.string().required("Organization name is required"),
  type: yup.string().oneOf(["customer", "principal", "distributor", "prospect", "vendor"]).required("Organization type is required"),
  phone: yup.string().nullable(),
  email: yup.string().email("Invalid email format").nullable(),
})

type QuickOrganizationData = yup.InferType<typeof quickOrganizationSchema>

export interface QuickCreateOrganizationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (organization: any) => void
  preselectedType?: string
}

export function QuickCreateOrganization({
  open,
  onOpenChange,
  onSuccess,
  preselectedType,
}: QuickCreateOrganizationProps) {
  const createOrganization = useCreateOrganization()

  const defaultValues: QuickOrganizationData = {
    name: "",
    type: (preselectedType as "customer" | "principal" | "distributor" | "prospect" | "vendor") || "customer",
    phone: "",
    email: "",
  }

  const handleSubmit = async (data: QuickOrganizationData) => {
    const organizationData = {
      name: data.name,
      type: data.type as "customer" | "principal" | "distributor" | "prospect" | "vendor",
      phone: data.phone || null,
      email: data.email || null,
      // Set reasonable defaults for required fields
      size: "medium" as const,
      segment: "Fine Dining", // Required field - use default food service segment
      priority: "C", // Required field - use default priority (A, B, C, D)
      is_principal: data.type === "principal",
      is_distributor: data.type === "distributor",
      is_active: true,
    }

    await createOrganization.mutateAsync(organizationData)
  }

  const handleSuccess = (data: QuickOrganizationData) => {
    toast.success(`Organization "${data.name}" created successfully`)
    onSuccess?.(data)
  }

  const handleError = (error: Error) => {
    toast.error(`Failed to create organization: ${error.message}`)
  }

  return (
    <QuickCreateModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Organization"
      description="Add a new organization with basic information. You can edit additional details later."
      schema={quickOrganizationSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onError={handleError}
      submitLabel="Create Organization"
    >
      {({ control, loading }) => (
        <>
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization Name *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter organization name"
                    disabled={loading}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Type *</FormLabel>
                <FormControl>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="(555) 123-4567"
                      disabled={loading}
                      className="h-11"
                      type="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="info@example.com"
                      disabled={loading}
                      className="h-11"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </QuickCreateModal>
  )
}