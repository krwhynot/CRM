import { cn } from '@/lib/utils';

export interface PriorityBadgeProps {
  priority: 'A+' | 'A' | 'B' | 'C' | 'D';
  showIcon?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showIcon = true, className, ...props }: PriorityBadgeProps) {
  const styles = {
    'A+': {
      bg: 'bg-priority-critical-bg',
      text: 'text-priority-critical-text font-bold',
      icon: '🔴',
      label: 'Critical'
    },
    'A': {
      bg: 'bg-priority-high-bg', 
      text: 'text-priority-high-text font-semibold',
      icon: '🟠',
      label: 'High'
    },
    'B': {
      bg: 'bg-priority-medium-bg',
      text: 'text-priority-medium-text',
      icon: '🟡', 
      label: 'Medium'
    },
    'C': {
      bg: 'bg-priority-low-bg',
      text: 'text-priority-low-text',
      icon: '⚪',
      label: 'Low'
    },
    'D': {
      bg: 'bg-priority-minimal-bg',
      text: 'text-priority-minimal-text',
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