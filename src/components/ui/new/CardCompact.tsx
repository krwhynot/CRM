import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardCompactProps extends React.HTMLAttributes<HTMLDivElement> {
  // All props are handled by React.HTMLAttributes<HTMLDivElement>
}

export const CardCompact = forwardRef<HTMLDivElement, CardCompactProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow hover:shadow-md transition-shadow",
          className
        )}
        {...props}
      />
    );
  }
);

export const CardCompactHeader = forwardRef<HTMLDivElement, CardCompactProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-row items-center justify-between space-y-0 p-3 pb-2", className)}
        {...props}
      />
    );
  }
);

export const CardCompactTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("font-semibold leading-none tracking-tight", className)}
        {...props}
      />
    );
  }
);

export const CardCompactContent = forwardRef<HTMLDivElement, CardCompactProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-3 pt-0", className)}
        {...props}
      />
    );
  }
);

CardCompact.displayName = 'CardCompact';
CardCompactHeader.displayName = 'CardCompactHeader';
CardCompactTitle.displayName = 'CardCompactTitle';
CardCompactContent.displayName = 'CardCompactContent';