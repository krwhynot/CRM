import React from 'react'
import { StandardDialog } from '@/components/ui/StandardDialog'
import { ProductForm } from './ProductForm'
import type { Product, ProductInsert, ProductUpdate, OrganizationInsert } from '@/types/entities'
import type { ProductFormData } from '@/types/validation'
import type { Database } from '@/lib/database.types'

// Enhanced product creation interface for form data with principal details
export interface ProductWithPrincipalData
  extends Omit<ProductInsert, 'principal_id' | 'created_by' | 'updated_by'> {
  // Principal can be provided as ID (existing) or details (new)
  principal_id?: string
  principal_name?: string
  principal_segment?: string
  principal_phone?: string
  principal_email?: string
  principal_website?: string
  principal_data?: Partial<OrganizationInsert>
}

// Helper function to transform ProductFormData to ProductWithPrincipalData
function transformProductFormData(formData: ProductFormData): ProductWithPrincipalData {
  const { 
    principal_mode, 
    principal_name, 
    principal_segment, 
    principal_phone, 
    principal_email, 
    principal_website, 
    ...productData 
  } = formData

  let result: ProductWithPrincipalData = {
    ...productData,
  }

  // Handle principal data based on mode
  if (principal_mode === 'existing') {
    // Existing principal - use principal_id
    result.principal_id = formData.principal_id || undefined
  } else if (principal_mode === 'new') {
    // New principal - use principal details
    result.principal_name = principal_name || undefined
    result.principal_segment = principal_segment || undefined
    result.principal_data = {
      type: 'principal' as Database['public']['Enums']['organization_type'],
      segment: principal_segment || undefined,
      phone: principal_phone || undefined,
      email: principal_email || undefined,
      website: principal_website || undefined,
    }
  }

  return result
}

interface ProductDialogsProps {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  selectedProduct: Product | null
  onCreateSubmit: (data: ProductWithPrincipalData) => void
  onEditSubmit: (data: ProductUpdate) => void
  onDeleteConfirm: (product: Product) => void
  onCreateDialogChange: (open: boolean) => void
  onEditDialogChange: (open: boolean) => void
  onDeleteDialogChange: (open: boolean) => void
  onDeleteCancel: () => void
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export const ProductDialogs: React.FC<ProductDialogsProps> = ({
  isCreateDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  selectedProduct,
  onCreateSubmit,
  onEditSubmit,
  onDeleteConfirm,
  onCreateDialogChange,
  onEditDialogChange,
  onDeleteDialogChange,
  onDeleteCancel,
  isCreating,
  isUpdating,
  isDeleting,
}) => {
  return (
    <>
      {/* Create Dialog */}
      <StandardDialog
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogChange}
        title="Add Product"
        description="Add a product to your catalog with specifications and pricing information."
        size="xl"
        scroll="content"
      >
        <ProductForm
          onSubmit={(data: ProductFormData) => onCreateSubmit(transformProductFormData(data))}
          loading={isCreating}
        />
      </StandardDialog>

      {/* Edit Dialog */}
      <StandardDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogChange}
        title="Edit Product"
        description="Update product information, specifications, and pricing details."
        size="xl"
        scroll="content"
      >
        {selectedProduct && (
          <ProductForm
            initialData={selectedProduct}
            onSubmit={(data: ProductFormData) => onEditSubmit(transformProductFormData(data) as ProductUpdate)}
            loading={isUpdating}
          />
        )}
      </StandardDialog>

      {/* Delete Dialog */}
      <StandardDialog
        variant="alert"
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        onConfirm={() => selectedProduct && onDeleteConfirm(selectedProduct)}
        onCancel={onDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={isDeleting}
      >
        <div className="text-center text-sm text-muted-foreground">
          This will permanently remove the product from your catalog and all associated data.
        </div>
      </StandardDialog>
    </>
  )
}
