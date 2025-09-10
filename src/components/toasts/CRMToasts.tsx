import React from 'react'
import { toast } from 'sonner'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Upload,
  Download,
  Save,
  Trash2,
  UserPlus,
  Building,
  Package,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Database,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react'

// Toast Configuration Types
export interface CRMToastConfig {
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ComponentType<{ size?: number }>
  progress?: number
}

// CRM-Specific Toast Categories
export interface CRMToastOptions extends Omit<CRMToastConfig, 'icon'> {
  icon?: React.ComponentType<{ size?: number }>
}

// Base Toast Functions with CRM Styling
export const crmToast = {
  success: ({ title, description, duration = 4000, action, icon }: CRMToastOptions) => {
    const Icon = icon || CheckCircle
    return toast.success(title, {
      description,
      duration,
      icon: <Icon size={16} />,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined
    })
  },

  error: ({ title, description, duration = 6000, action, icon }: CRMToastOptions) => {
    const Icon = icon || XCircle
    return toast.error(title, {
      description,
      duration,
      icon: <Icon size={16} />,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined
    })
  },

  warning: ({ title, description, duration = 5000, action, icon }: CRMToastOptions) => {
    const Icon = icon || AlertTriangle
    return toast.warning(title, {
      description,
      duration,
      icon: <Icon size={16} />,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined
    })
  },

  info: ({ title, description, duration = 4000, action, icon }: CRMToastOptions) => {
    const Icon = icon || Info
    return toast.info(title, {
      description,
      duration,
      icon: <Icon size={16} />,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined
    })
  },

  loading: ({ title, description, icon }: Omit<CRMToastOptions, 'duration'>) => {
    const Icon = icon || Clock
    return toast.loading(title, {
      description,
      icon: <Icon size={16} />
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: CRMToastOptions
      success: (data: T) => CRMToastOptions
      error: (error: any) => CRMToastOptions
    }
  ) => {
    return toast.promise(promise, {
      loading: loading.title,
      success: (data: T) => {
        const successConfig = success(data)
        return {
          title: successConfig.title,
          description: successConfig.description,
          icon: successConfig.icon ? <successConfig.icon size={16} /> : <CheckCircle size={16} />
        }
      },
      error: (err: any) => {
        const errorConfig = error(err)
        return {
          title: errorConfig.title,
          description: errorConfig.description,
          icon: errorConfig.icon ? <errorConfig.icon size={16} /> : <XCircle size={16} />
        }
      }
    })
  }
}

// Entity-Specific Toast Functions
export const entityToasts = {
  // Contact Toasts
  contact: {
    created: (contactName: string, action?: () => void) => 
      crmToast.success({
        title: 'Contact Created',
        description: `${contactName} has been added to your contacts`,
        icon: UserPlus,
        action: action ? { label: 'View Contact', onClick: action } : undefined
      }),

    updated: (contactName: string) => 
      crmToast.success({
        title: 'Contact Updated',
        description: `${contactName}'s information has been saved`,
        icon: Save
      }),

    deleted: (contactName: string, undoAction?: () => void) => 
      crmToast.success({
        title: 'Contact Deleted',
        description: `${contactName} has been removed`,
        icon: Trash2,
        action: undoAction ? { label: 'Undo', onClick: undoAction } : undefined
      }),

    called: (contactName: string, duration?: string) => 
      crmToast.info({
        title: 'Call Logged',
        description: `Call with ${contactName}${duration ? ` (${duration})` : ''} has been recorded`,
        icon: Phone
      }),

    emailed: (contactName: string) => 
      crmToast.info({
        title: 'Email Sent',
        description: `Email sent to ${contactName}`,
        icon: Mail
      }),

    meetingScheduled: (contactName: string, date: string) => 
      crmToast.success({
        title: 'Meeting Scheduled',
        description: `Meeting with ${contactName} on ${date}`,
        icon: Calendar
      })
  },

  // Organization Toasts
  organization: {
    created: (orgName: string, action?: () => void) => 
      crmToast.success({
        title: 'Organization Created',
        description: `${orgName} has been added to your organizations`,
        icon: Building,
        action: action ? { label: 'View Organization', onClick: action } : undefined
      }),

    updated: (orgName: string) => 
      crmToast.success({
        title: 'Organization Updated',
        description: `${orgName}'s information has been saved`,
        icon: Save
      }),

    deleted: (orgName: string, undoAction?: () => void) => 
      crmToast.success({
        title: 'Organization Deleted',
        description: `${orgName} has been removed`,
        icon: Trash2,
        action: undoAction ? { label: 'Undo', onClick: undoAction } : undefined
      })
  },

  // Product Toasts
  product: {
    created: (productName: string, action?: () => void) => 
      crmToast.success({
        title: 'Product Created',
        description: `${productName} has been added to your catalog`,
        icon: Package,
        action: action ? { label: 'View Product', onClick: action } : undefined
      }),

    updated: (productName: string) => 
      crmToast.success({
        title: 'Product Updated',
        description: `${productName} has been updated`,
        icon: Save
      }),

    deleted: (productName: string, undoAction?: () => void) => 
      crmToast.success({
        title: 'Product Deleted',
        description: `${productName} has been removed from catalog`,
        icon: Trash2,
        action: undoAction ? { label: 'Undo', onClick: undoAction } : undefined
      })
  },

  // Opportunity Toasts
  opportunity: {
    created: (opportunityName: string, value?: number, action?: () => void) => 
      crmToast.success({
        title: 'Opportunity Created',
        description: `${opportunityName}${value ? ` ($${value.toLocaleString()})` : ''} added to pipeline`,
        icon: TrendingUp,
        action: action ? { label: 'View Opportunity', onClick: action } : undefined
      }),

    stageChanged: (opportunityName: string, newStage: string) => 
      crmToast.info({
        title: 'Stage Updated',
        description: `${opportunityName} moved to ${newStage}`,
        icon: ArrowRight
      }),

    won: (opportunityName: string, value: number) => 
      crmToast.success({
        title: 'Opportunity Won! 🎉',
        description: `${opportunityName} closed for $${value.toLocaleString()}`,
        icon: DollarSign,
        duration: 6000
      }),

    lost: (opportunityName: string, reason?: string) => 
      crmToast.warning({
        title: 'Opportunity Lost',
        description: `${opportunityName}${reason ? ` - ${reason}` : ''} marked as lost`,
        icon: XCircle
      })
  }
}

// System & Process Toasts
export const systemToasts = {
  // Data Import/Export
  dataImport: {
    started: (type: string, recordCount: number) => 
      crmToast.loading({
        title: 'Import Starting',
        description: `Processing ${recordCount} ${type} records...`,
        icon: Upload
      }),

    progress: (processed: number, total: number) => {
      const percentage = Math.round((processed / total) * 100)
      return crmToast.info({
        title: `Import Progress: ${percentage}%`,
        description: `Processed ${processed} of ${total} records`,
        icon: Database,
        duration: 2000
      })
    },

    completed: (type: string, successCount: number, errorCount = 0) => 
      crmToast.success({
        title: 'Import Completed',
        description: `${successCount} ${type} records imported${errorCount ? `, ${errorCount} errors` : ''}`,
        icon: CheckCircle,
        duration: 6000
      }),

    failed: (type: string, error: string) => 
      crmToast.error({
        title: 'Import Failed',
        description: `Failed to import ${type}: ${error}`,
        icon: XCircle,
        duration: 8000
      })
  },

  // Data Export
  dataExport: {
    started: (type: string) => 
      crmToast.loading({
        title: 'Export Starting',
        description: `Preparing ${type} export...`,
        icon: Download
      }),

    completed: (type: string, recordCount: number, downloadAction?: () => void) => 
      crmToast.success({
        title: 'Export Ready',
        description: `${recordCount} ${type} records exported successfully`,
        icon: Download,
        action: downloadAction ? { label: 'Download', onClick: downloadAction } : undefined
      })
  },

  // Sync & Backup
  sync: {
    started: () => 
      crmToast.loading({
        title: 'Syncing Data',
        description: 'Synchronizing with cloud services...',
        icon: Database
      }),

    completed: (recordsUpdated: number) => 
      crmToast.success({
        title: 'Sync Complete',
        description: `${recordsUpdated} records synchronized`,
        icon: CheckCircle
      }),

    failed: (error: string) => 
      crmToast.error({
        title: 'Sync Failed',
        description: `Synchronization error: ${error}`,
        icon: XCircle
      })
  },

  // System Status
  system: {
    maintenance: (startTime: string) => 
      crmToast.warning({
        title: 'Scheduled Maintenance',
        description: `System maintenance will begin at ${startTime}`,
        icon: Database,
        duration: 8000
      }),

    backup: () => 
      crmToast.info({
        title: 'Backup Complete',
        description: 'Your data has been backed up successfully',
        icon: Shield
      }),

    performance: (message: string) => 
      crmToast.warning({
        title: 'Performance Notice',
        description: message,
        icon: Zap,
        duration: 6000
      })
  }
}

// Bulk Action Toasts
export const bulkToasts = {
  // Bulk Operations
  bulkUpdate: (count: number, entityType: string) => 
    crmToast.success({
      title: 'Bulk Update Complete',
      description: `${count} ${entityType} records updated successfully`,
      icon: Save
    }),

  bulkDelete: (count: number, entityType: string, undoAction?: () => void) => 
    crmToast.success({
      title: 'Bulk Delete Complete',
      description: `${count} ${entityType} records deleted`,
      icon: Trash2,
      action: undoAction ? { label: 'Undo All', onClick: undoAction } : undefined
    }),

  bulkExport: (count: number, entityType: string, downloadAction?: () => void) => 
    crmToast.success({
      title: 'Bulk Export Ready',
      description: `${count} ${entityType} records exported`,
      icon: Download,
      action: downloadAction ? { label: 'Download', onClick: downloadAction } : undefined
    })
}

// Toast Progress Utility
export function createProgressToast(
  title: string,
  description: string,
  onProgress?: (progress: number) => void
) {
  let toastId: string | number

  const updateProgress = (progress: number) => {
    onProgress?.(progress)
    
    if (progress < 100) {
      const progressDescription = `${description} (${progress}%)`
      
      if (toastId) {
        toast.loading(title, {
          id: toastId,
          description: progressDescription,
          icon: <Clock size={16} />
        })
      } else {
        toastId = toast.loading(title, {
          description: progressDescription,
          icon: <Clock size={16} />
        })
      }
    } else {
      toast.success(title + ' Complete', {
        id: toastId,
        description: description + ' finished successfully',
        icon: <CheckCircle size={16} />
      })
    }
  }

  const complete = (message?: string) => {
    toast.success(title + ' Complete', {
      id: toastId,
      description: message || description + ' finished successfully',
      icon: <CheckCircle size={16} />
    })
  }

  const error = (errorMessage: string) => {
    toast.error(title + ' Failed', {
      id: toastId,
      description: errorMessage,
      icon: <XCircle size={16} />
    })
  }

  // Start the loading toast
  toastId = toast.loading(title, {
    description,
    icon: <Clock size={16} />
  })

  return {
    updateProgress,
    complete,
    error,
    dismiss: () => toast.dismiss(toastId)
  }
}

// Hook for CRM Toast Management
export function useCRMToasts() {
  const showEntitySuccess = React.useCallback((
    entity: 'contact' | 'organization' | 'product' | 'opportunity',
    action: 'created' | 'updated' | 'deleted',
    name: string,
    extra?: any
  ) => {
    const toastFn = entityToasts[entity][action as keyof typeof entityToasts[typeof entity]]
    if (typeof toastFn === 'function') {
      return (toastFn as any)(name, extra)
    }
  }, [])

  const showSystemNotification = React.useCallback((
    category: keyof typeof systemToasts,
    type: string,
    ...args: any[]
  ) => {
    const categoryToasts = systemToasts[category] as any
    const toastFn = categoryToasts[type]
    if (typeof toastFn === 'function') {
      return toastFn(...args)
    }
  }, [])

  const showProgressToast = React.useCallback((
    title: string,
    description: string,
    onProgress?: (progress: number) => void
  ) => {
    return createProgressToast(title, description, onProgress)
  }, [])

  return {
    toast: crmToast,
    entity: entityToasts,
    system: systemToasts,
    bulk: bulkToasts,
    showEntitySuccess,
    showSystemNotification,
    showProgressToast
  }
}