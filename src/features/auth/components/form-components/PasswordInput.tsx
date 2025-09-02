import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id: string
  label: string
  placeholder: string
  value: string
  showPassword: boolean
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  showHint?: boolean
  onChange: (value: string) => void
  onToggleVisibility: () => void
}

export function PasswordInput({
  id,
  label,
  placeholder,
  value,
  showPassword,
  disabled = false,
  required = false,
  autoComplete,
  showHint = false,
  onChange,
  onToggleVisibility,
}: PasswordInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={onToggleVisibility}
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
      {showHint && (
        <p className="text-xs text-gray-500">
          Must be at least 8 characters with uppercase, lowercase, and number
        </p>
      )}
    </div>
  )
}
