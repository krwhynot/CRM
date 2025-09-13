import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
}

interface SignUpFormState extends SignUpFormData {
  showPassword: boolean
  showConfirmPassword: boolean
  error: string | null
  success: string | null
}

export function useSignUpForm() {
  const { signUp, loading } = useAuth()
  const [formState, setFormState] = useState<SignUpFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    error: null,
    success: null,
  })

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    return null
  }

  const updateField = (field: keyof SignUpFormState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const clearMessages = () => {
    setFormState((prev) => ({ ...prev, error: null, success: null }))
  }

  const setError = (error: string) => {
    setFormState((prev) => ({ ...prev, error, success: null }))
  }

  const setSuccess = (success: string) => {
    setFormState((prev) => ({ ...prev, success, error: null }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!formState.email || !formState.password || !formState.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    const passwordError = validatePassword(formState.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const { error: signUpError } = await signUp(formState.email, formState.password)

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess('Account created successfully! Please check your email to verify your account.')
    }
  }

  return {
    formState,
    loading,
    updateField,
    handleSubmit,
    validatePassword,
  }
}
