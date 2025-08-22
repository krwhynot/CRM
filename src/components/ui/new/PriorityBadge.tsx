import { cn } from '@/lib/utils';

export interface PriorityBadgeProps {
  priority: 'A+' | 'A' | 'B' | 'C' | 'D';
  showIcon?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showIcon = true, className, ...props }: PriorityBadgeProps) {
  const styles = {
    'A+': {
      bg: 'bg-red-100',
      text: 'text-red-700 font-bold',
      icon: '🔴',
      label: 'Critical'
    },
    'A': {
      bg: 'bg-orange-100', 
      text: 'text-orange-700 font-semibold',
      icon: '🟠',
      label: 'High'
    },
    'B': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: '🟡', 
      label: 'Medium'
    },
    'C': {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: '⚪',
      label: 'Low'
    },
    'D': {
      bg: 'bg-gray-50',
      text: 'text-gray-400',
      icon: '⚪',
      label: 'Minimal'
    }
  };
  
  const style = styles[priority];
  
  return (
    <span 
      className={cn(
        `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-nunito`,
        style.bg,
        style.text,
        className
      )}
      title={`${priority} Priority - ${style.label}`}
      {...props}
    >
      {showIcon && <span className="mr-1">{style.icon}</span>}
      {priority}
    </span>
  );
}

PriorityBadge.displayName = 'PriorityBadge';