import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TypeIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'Principal' | 'Distributor' | 'Customer' | 'principal' | 'distributor' | 'customer';
}

export const TypeIndicator = forwardRef<HTMLDivElement, TypeIndicatorProps>(
  ({ type, className, ...props }, ref) => {
    const getTypeColor = (orgType: string) => {
      const normalizedType = orgType.toLowerCase();
      switch (normalizedType) {
        case 'principal':
          return 'bg-purple-500';
        case 'distributor':
          return 'bg-blue-500';
        case 'customer':
        default:
          return 'bg-[hsl(var(--primary))]'; // MFB green
      }
    };

    const getTypeLabel = (orgType: string) => {
      const normalizedType = orgType.toLowerCase();
      switch (normalizedType) {
        case 'principal':
          return 'Principal';
        case 'distributor':
          return 'Distributor';
        case 'customer':
        default:
          return 'Customer';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-1 h-6 rounded-full flex-shrink-0",
          getTypeColor(type),
          className
        )}
        title={`${getTypeLabel(type)} Organization`}
        {...props}
      />
    );
  }
);

TypeIndicator.displayName = 'TypeIndicator';