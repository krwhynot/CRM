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
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {title}
            {count !== undefined && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({count} total)
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';