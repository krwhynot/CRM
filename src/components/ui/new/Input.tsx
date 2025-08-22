import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputNewProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  // Compatibility with existing Input component
  size?: 'default' | 'sm' | 'lg';
  // Migration safety - TODO: Remove any type after migration
  [key: string]: any;
}

export const InputNew = forwardRef<HTMLInputElement, InputNewProps>(
  ({ className, error, size = 'default', type = 'text', ...props }, ref) => {
    const sizes: Record<string, string> = {
      default: 'h-12 text-base',
      sm: 'h-11 text-sm',
      lg: 'h-14 text-lg'
    };

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full px-4 py-2.5 font-nunito',
          'border rounded-lg transition-all duration-200',
          'placeholder:text-mfb-olive/40',
          'file:border-0 file:bg-transparent file:font-medium file:text-inherit',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-mfb-green focus:ring-2 focus:ring-mfb-green/20',
          'focus:outline-none',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

// Always add displayName for debugging
InputNew.displayName = 'InputNew';