import { AlertCircle, CheckCircle } from 'lucide-react'

interface FormAlertProps {
  type: 'error' | 'success'
  message: string
}

export function FormAlert({ type, message }: FormAlertProps) {
  const isError = type === 'error'
  
  return (
    <div className={`flex items-center gap-2 rounded-md p-3 text-sm ${
      isError 
        ? 'border border-red-200 bg-red-50 text-red-600'
        : 'border border-green-200 bg-green-50 text-green-600'
    }`}>
      {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {message}
    </div>
  )
}