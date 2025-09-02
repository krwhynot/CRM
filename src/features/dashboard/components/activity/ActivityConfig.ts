import { Phone, Mail, Calendar, Target, FileText, Building2, Clock } from 'lucide-react'

// Activity type configuration
export const ACTIVITY_CONFIG = {
  call: {
    icon: Phone,
    color: 'bg-primary',
    lightColor: 'bg-primary/10',
    textColor: 'text-primary',
    label: 'Call',
  },
  email: {
    icon: Mail,
    color: 'bg-success',
    lightColor: 'bg-success/10',
    textColor: 'text-success',
    label: 'Email',
  },
  meeting: {
    icon: Calendar,
    color: 'bg-accent',
    lightColor: 'bg-accent/10',
    textColor: 'text-accent-foreground',
    label: 'Meeting',
  },
  demo: {
    icon: Target,
    color: 'bg-warning',
    lightColor: 'bg-warning/10',
    textColor: 'text-warning-foreground',
    label: 'Demo',
  },
  proposal: {
    icon: FileText,
    color: 'bg-info',
    lightColor: 'bg-info/10',
    textColor: 'text-info-foreground',
    label: 'Proposal',
  },
  follow_up: {
    icon: Clock,
    color: 'bg-warning',
    lightColor: 'bg-warning/10',
    textColor: 'text-warning-foreground',
    label: 'Follow-up',
  },
  trade_show: {
    icon: Building2,
    color: 'bg-destructive',
    lightColor: 'bg-destructive/10',
    textColor: 'text-destructive',
    label: 'Trade Show',
  },
  site_visit: {
    icon: Building2,
    color: 'bg-secondary',
    lightColor: 'bg-secondary/10',
    textColor: 'text-secondary-foreground',
    label: 'Site Visit',
  },
  contract_review: {
    icon: FileText,
    color: 'bg-muted',
    lightColor: 'bg-muted/10',
    textColor: 'text-muted-foreground',
    label: 'Contract Review',
  },
} as const
