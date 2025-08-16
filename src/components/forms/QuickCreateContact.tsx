"use client"

import * as yup from "yup"
import { User } from "lucide-react"
import { QuickCreateModal } from "./QuickCreateModal"
import { useCreateContact } from "@/hooks/useContacts"
import { mapDecisionAuthorityToRole, type DecisionAuthorityRole } from "@/types/contact.types"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

// Minimal contact schema for quick creation
const quickContactSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email format").nullable(),
  organization_id: yup.string().required("Organization is required"),
})

type QuickContactData = yup.InferType<typeof quickContactSchema>

export interface QuickCreateContactProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (contact: any) => void
  organizationId?: string
  organizationName?: string
}

export function QuickCreateContact({
  open,
  onOpenChange,
  onSuccess,
  organizationId,
  organizationName,
}: QuickCreateContactProps) {
  const createContact = useCreateContact()

  const defaultValues: QuickContactData = {
    first_name: "",
    last_name: "",
    email: "",
    organization_id: organizationId || "",
  }

  const handleSubmit = async (data: QuickContactData) => {
    const defaultDecisionAuthority: DecisionAuthorityRole = "End User"
    
    const contactData = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      organization_id: data.organization_id,
      // Set reasonable defaults for other fields
      title: null,
      department: null,
      phone: null,
      mobile_phone: null,
      linkedin_url: null,
      is_primary_contact: false,
      purchase_influence: "Unknown" as const,
      decision_authority: defaultDecisionAuthority,
      notes: null,
      // Map decision authority to database role enum
      role: mapDecisionAuthorityToRole(defaultDecisionAuthority),
    }

    await createContact.mutateAsync(contactData)
  }

  const handleSuccess = (data: QuickContactData) => {
    toast.success(`Contact "${data.first_name} ${data.last_name}" created successfully`)
    onSuccess?.(data)
  }

  const handleError = (error: Error) => {
    toast.error(`Failed to create contact: ${error.message}`)
  }

  const title = organizationName 
    ? `Create Contact for ${organizationName}`
    : "Create Contact"

  const description = organizationName
    ? `Add a new contact to ${organizationName}. You can edit additional details later.`
    : "Add a new contact with basic information. You can edit additional details later."

  return (
    <QuickCreateModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      schema={quickContactSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onError={handleError}
      submitLabel="Create Contact"
    >
      {({ control, loading }) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John"
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
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Doe"
                      disabled={loading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    placeholder="john.doe@example.com"
                    disabled={loading}
                    className="h-11"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {organizationName && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                This contact will be added to <strong>{organizationName}</strong>
              </p>
            </div>
          )}
        </>
      )}
    </QuickCreateModal>
  )
}