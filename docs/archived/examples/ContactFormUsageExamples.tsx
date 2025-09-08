// Contact Form Usage Examples
// This file demonstrates various ways to use the ContactForm component

import React, { Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { ContactForm } from './ContactFormComplete'
import { useContact, useCreateContact, useUpdateContact } from '@/hooks/useContacts'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

// Example 1: Basic Contact Creation
export function ContactCreateView() {
  const navigate = useNavigate()
  const createContact = useCreateContact()

  const handleContactCreate = async (contactData: any) => {
    try {
      const contact = await createContact.mutateAsync(contactData)
      navigate(`/contacts/${contact.id}`)
      return contact
    } catch (error) {
      console.error('Failed to create contact:', error)
      throw error
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/contacts')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">Add New Contact</h1>
        <p className="text-muted-foreground mt-2">
          Create a new contact record for your CRM system. All required fields must be completed.
        </p>
      </div>
      
      <ContactFormWithErrorBoundary
        onSubmit={handleContactCreate}
        loading={createContact.isPending}
      />
    </div>
  )
}

// Example 2: Edit Contact with Preloaded Data
export function ContactEditView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contact, isLoading, error } = useContact(id!)
  const updateContact = useUpdateContact()

  const handleContactUpdate = async (contactData: any) => {
    if (!contact) return
    
    try {
      const updatedContact = await updateContact.mutateAsync({
        id: contact.id,
        updates: contactData
      })
      navigate(`/contacts/${updatedContact.id}`)
      return updatedContact
    } catch (error) {
      console.error('Failed to update contact:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contact...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Contact Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The contact you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/contacts')}>
            Back to Contacts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/contacts/${contact.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contact
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
        <p className="text-muted-foreground mt-2">
          Update contact information for {contact.first_name} {contact.last_name}.
        </p>
      </div>
      
      <ContactFormWithErrorBoundary
        onSubmit={handleContactUpdate}
        initialData={contact}
        loading={updateContact.isPending}
        submitLabel="Update Contact"
      />
    </div>
  )
}

// Example 3: Contact Creation with Preselected Organization
export function ContactCreateForOrganizationView() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const navigate = useNavigate()
  const createContact = useCreateContact()

  const handleContactCreate = async (contactData: any) => {
    try {
      const contact = await createContact.mutateAsync(contactData)
      navigate(`/organizations/${organizationId}/contacts`)
      return contact
    } catch (error) {
      console.error('Failed to create contact:', error)
      throw error
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/organizations/${organizationId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Organization
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">Add Contact to Organization</h1>
        <p className="text-muted-foreground mt-2">
          Create a new contact for this organization.
        </p>
      </div>
      
      <ContactFormWithErrorBoundary
        onSubmit={handleContactCreate}
        preselectedOrganization={organizationId}
        loading={createContact.isPending}
      />
    </div>
  )
}

// Example 4: Modal Contact Creation (for use in other components)
export function ContactCreateModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  preselectedOrganization 
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (contact: any) => void
  preselectedOrganization?: string
}) {
  const createContact = useCreateContact()

  const handleContactCreate = async (contactData: any) => {
    try {
      const contact = await createContact.mutateAsync(contactData)
      onSuccess?.(contact)
      onClose()
      return contact
    } catch (error) {
      console.error('Failed to create contact:', error)
      throw error
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Add New Contact</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          <ContactFormWithErrorBoundary
            onSubmit={handleContactCreate}
            preselectedOrganization={preselectedOrganization}
            loading={createContact.isPending}
          />
        </div>
      </div>
    </div>
  )
}

// Example 5: Bulk Contact Import (advanced usage)
export function ContactBulkImportView() {
  const navigate = useNavigate()
  const createContact = useCreateContact()
  const [importResults, setImportResults] = React.useState<any[]>([])
  const [isImporting, setIsImporting] = React.useState(false)

  const handleBulkImport = async (contactsData: any[]) => {
    setIsImporting(true)
    const results = []

    try {
      for (const contactData of contactsData) {
        try {
          // Use the same form validation and submission logic
          const contact = await createContact.mutateAsync(contactData)
          results.push({ success: true, contact, data: contactData })
        } catch (error) {
          results.push({ 
            success: false, 
            error: error.message, 
            data: contactData 
          })
        }
      }
      
      setImportResults(results)
      
      const successCount = results.filter(r => r.success).length
      const failureCount = results.filter(r => !r.success).length
      
      toast.success(`Import completed`, {
        description: `${successCount} contacts created, ${failureCount} failed`
      })
      
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Contact Import</h1>
        <p className="text-muted-foreground mt-2">
          Import multiple contacts using the same validation rules as the contact form.
        </p>
      </div>
      
      {/* Bulk import interface would go here */}
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-center text-muted-foreground">
          Bulk import interface - would use the same ContactForm validation and submission logic
        </p>
      </div>
    </div>
  )
}

// Error Boundary Wrapper for Contact Form
function ContactFormFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="p-6 border border-destructive rounded-lg bg-destructive/5">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="text-lg font-semibold text-destructive">
          Something went wrong with the contact form
        </h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {error.message}
      </p>
      
      <div className="flex space-x-2">
        <Button onClick={resetErrorBoundary} variant="outline" size="sm">
          Try again
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          size="sm"
        >
          Reload page
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-600">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

// Wrapped Contact Form with Error Boundary
export function ContactFormWithErrorBoundary(props: any) {
  return (
    <ErrorBoundary
      FallbackComponent={ContactFormFallback}
      onError={(error, errorInfo) => {
        console.error('Contact form error:', error, errorInfo)
        // Report to error monitoring service
        // analytics.reportError(error, { context: 'ContactForm', ...errorInfo })
      }}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading form...</p>
          </div>
        </div>
      }>
        <ContactForm {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

// Custom Hook for Contact Form Analytics
export function useContactFormAnalytics() {
  const trackFormEvent = React.useCallback((event: string, data?: any) => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Contact Form Event', {
        event,
        ...data,
        timestamp: Date.now(),
        url: window.location.pathname
      })
    }
  }, [])

  const trackFieldInteraction = React.useCallback((fieldName: string, action: string) => {
    trackFormEvent('Field Interaction', { fieldName, action })
  }, [trackFormEvent])

  const trackFormSubmission = React.useCallback((success: boolean, error?: string) => {
    trackFormEvent('Form Submission', { success, error })
  }, [trackFormEvent])

  const trackModalOpen = React.useCallback((modalType: string) => {
    trackFormEvent('Modal Open', { modalType })
  }, [trackFormEvent])

  return {
    trackFormEvent,
    trackFieldInteraction,
    trackFormSubmission,
    trackModalOpen
  }
}

// Performance monitoring hook
export function useContactFormPerformance() {
  const [metrics, setMetrics] = React.useState<any>({})

  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name.includes('contact-form')) {
          setMetrics((prev: any) => ({
            ...prev,
            [entry.name]: entry.duration
          }))
        }
      })
    })

    observer.observe({ entryTypes: ['measure'] })

    return () => observer.disconnect()
  }, [])

  const measureFormRender = React.useCallback(() => {
    performance.mark('contact-form-render-start')
    return () => {
      performance.mark('contact-form-render-end')
      performance.measure(
        'contact-form-render',
        'contact-form-render-start',
        'contact-form-render-end'
      )
    }
  }, [])

  const measureFormSubmission = React.useCallback(() => {
    performance.mark('contact-form-submit-start')
    return () => {
      performance.mark('contact-form-submit-end')
      performance.measure(
        'contact-form-submit',
        'contact-form-submit-start',
        'contact-form-submit-end'
      )
    }
  }, [])

  return {
    metrics,
    measureFormRender,
    measureFormSubmission
  }
}