import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface LabelNewProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const LabelNew = forwardRef<HTMLLabelElement, LabelNewProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium font-nunito text-mfb-olive mb-1.5',
          'select-none',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

// Always add displayName for debugging
LabelNew.displayName = 'LabelNew';