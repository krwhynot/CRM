import { AlertCircle, CheckCircle } from 'lucide-react'

interface FormAlertProps {
  type: 'error' | 'success'
  message: string
}

export function FormAlert({ type, message }: FormAlertProps) {
  const isError = type === 'error'
  
  return (
    <div className={`flex items-center gap-2 p-3 text-sm rounded-md ${
      isError 
        ? 'text-red-600 bg-red-50 border border-red-200'
        : 'text-green-600 bg-green-50 border border-green-200'
    }`}>
      {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {message}
    </div>
  )
}