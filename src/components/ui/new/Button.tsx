import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonNewProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonNew = forwardRef<HTMLButtonElement, ButtonNewProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'bg-mfb-green hover:bg-mfb-green-hover text-white shadow-sm hover:shadow-md',
      secondary: 'bg-mfb-clay hover:bg-mfb-clay/90 text-white shadow-sm hover:shadow-md',
      danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
      ghost: 'bg-transparent hover:bg-mfb-sage text-mfb-olive'
    };
    
    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm h-11',
      md: 'px-6 py-3 text-base h-12',
      lg: 'px-8 py-4 text-lg h-14'
    };
    
    // Simplified for migration - only use button element for now
    return (
      <button
        ref={ref}
        className={cn(
          'font-nunito font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-0.5',
          'inline-flex items-center justify-center whitespace-nowrap',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mfb-green focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className
        )}
        {...props}
      />
    );
  }
);

// Always add displayName for debugging
ButtonNew.displayName = 'ButtonNew';