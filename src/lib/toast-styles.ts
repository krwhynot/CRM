/**
 * MFB-styled toast helpers for consistent success/error messaging
 */
import { toast as baseToast } from 'sonner'

export const toast = {
  success: (message: string) => {
    return baseToast.success(message, {
      style: {
        background: 'var(--mfb-green)',
        color: 'var(--mfb-cream)',
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontWeight: '500',
        border: 'none',
      },
    })
  },
  
  error: (message: string) => {
    return baseToast.error(message, {
      style: {
        background: 'var(--mfb-clay)',
        color: 'var(--mfb-cream)',
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontWeight: '500',
        border: 'none',
      },
    })
  },
  
  // Pass through other toast methods
  info: baseToast.info,
  warning: baseToast.warning,
  loading: baseToast.loading,
  dismiss: baseToast.dismiss,
  promise: baseToast.promise,
}
