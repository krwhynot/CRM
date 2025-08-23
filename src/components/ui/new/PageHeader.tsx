import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  count?: number;
  subtitle?: string;
  [key: string]: any; // Migration safety
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, count, subtitle, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3 mb-6", className)}
        {...props}
      >
        <div className="w-1 h-8 bg-[hsl(var(--primary))] rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h1>
            {title}
            {count !== undefined && (
              <span className="text-sm font-normal ml-2" style={{color: 'var(--mfb-olive-light)'}}>
                ({count} total)
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="text-sm mt-1" style={{color: 'var(--mfb-olive-light)'}}>{subtitle}</p>
          )}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';