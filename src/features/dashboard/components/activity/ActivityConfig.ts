import {
  Phone, 
  Mail, 
  Calendar, 
  Target, 
  FileText, 
  Building2, 
  Clock
} from 'lucide-react'

// Activity type configuration
export const ACTIVITY_CONFIG = {
  call: {
    icon: Phone,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    label: 'Call'
  },
  email: {
    icon: Mail,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700',
    label: 'Email'
  },
  meeting: {
    icon: Calendar,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    label: 'Meeting'
  },
  demo: {
    icon: Target,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    label: 'Demo'
  },
  proposal: {
    icon: FileText,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    label: 'Proposal'
  },
  follow_up: {
    icon: Clock,
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    label: 'Follow-up'
  },
  trade_show: {
    icon: Building2,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    textColor: 'text-red-700',
    label: 'Trade Show'
  },
  site_visit: {
    icon: Building2,
    color: 'bg-cyan-500',
    lightColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    label: 'Site Visit'
  },
  contract_review: {
    icon: FileText,
    color: 'bg-gray-500',
    lightColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    label: 'Contract Review'
  }
} as const