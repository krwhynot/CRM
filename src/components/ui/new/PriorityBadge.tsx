import { cn } from '@/lib/utils';

export interface PriorityBadgeProps {
  priority: 'A+' | 'A' | 'B' | 'C' | 'D';
  showIcon?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showIcon = true, className, ...props }: PriorityBadgeProps) {
  const styles = {
    'A+': {
      bg: 'bg-[var(--priority-critical-bg)]',
      text: 'text-[var(--priority-critical-text)] font-bold',
      icon: '🔴',
      label: 'Critical'
    },
    'A': {
      bg: 'bg-[var(--priority-high-bg)]', 
      text: 'text-[var(--priority-high-text)] font-semibold',
      icon: '🟠',
      label: 'High'
    },
    'B': {
      bg: 'bg-[var(--priority-medium-bg)]',
      text: 'text-[var(--priority-medium-text)]',
      icon: '🟡', 
      label: 'Medium'
    },
    'C': {
      bg: 'bg-[var(--priority-low-bg)]',
      text: 'text-[var(--priority-low-text)]',
      icon: '⚪',
      label: 'Low'
    },
    'D': {
      bg: 'bg-[var(--priority-minimal-bg)]',
      text: 'text-[var(--priority-minimal-text)]',
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