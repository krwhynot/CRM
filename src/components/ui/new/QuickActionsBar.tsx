import React, { forwardRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface QuickActionsBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onQuickAdd?: () => void;
  selectedCount?: number;
  onBulkAction?: (action: string) => void;
}

export const QuickActionsBar = forwardRef<HTMLDivElement, QuickActionsBarProps>(
  ({ onQuickAdd, selectedCount = 0, onBulkAction, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "sticky top-0 z-10 bg-background border-b border-border p-2 mb-4",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-8 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-primary-foreground"
              onClick={onQuickAdd}
            >
              <Plus className="h-3 w-3 mr-1" />
              Quick Add
            </Button>
            {onBulkAction && (
              <Select onValueChange={onBulkAction}>
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Bulk actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">Export Selected</SelectItem>
                  <SelectItem value="assign">Assign Manager</SelectItem>
                  <SelectItem value="tag">Add Tags</SelectItem>
                  <SelectItem value="archive">Archive Items</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedCount > 0 && `${selectedCount} selected`}
          </div>
        </div>
      </div>
    );
  }
);

QuickActionsBar.displayName = 'QuickActionsBar';