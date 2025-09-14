import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
;('use client')

import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { StandardDialog } from '@/components/ui/StandardDialog'

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        `bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden ${semanticRadius.default}`,
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  open,
  onOpenChange,
}: {
  title?: string
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <StandardDialog
      open={open ?? false}
      onOpenChange={onOpenChange ?? (() => {})}
      title={title}
      description={description}
      size="lg"
    >
      <Command
        className={`[&_[cmdk-group-heading]]:${semanticSpacing.horizontalPadding.xs} [&_[cmdk-group]:not([hidden])_~[cmdk-group]]: [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground${semanticSpacing.zero} [&_[cmdk-group]]:${semanticSpacing.horizontalPadding.xs} [&_[cmdk-item]]: [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12${semanticSpacing.horizontalPadding.xs} [&_[cmdk-item]]:${semanticSpacing.verticalPadding.lg} [&_[cmdk-item]_svg]:size-5`}
      >
        {children}
      </Command>
    </StandardDialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        semanticSpacing.gap.xs,
        semanticSpacing.compactX,
        'flex h-11 items-center border-b'
      )}
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          `placeholder:text-muted-foreground flex h-10 w-full ${semanticRadius.default} bg-transparent ${semanticSpacing.verticalPadding.lg} text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50`,
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        `max-h-[300px] scroll-${semanticSpacing.verticalPadding.xs} overflow-x-hidden overflow-y-auto`,
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(semanticSpacing.cardY, semanticTypography.body, 'text-center')}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        `text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden ${semanticSpacing.layoutPadding.xs} [&_[cmdk-group-heading]]:${semanticSpacing.horizontalPadding.xs} [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium`,
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(`bg-border -${semanticSpacing.leftGap.xs} h-px`, className)}
      {...props}
    />
  )
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        `data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center ${semanticSpacing.gap.xs} ${semanticRadius.sm} ${semanticSpacing.horizontalPadding.xs} py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        `text-muted-foreground ${semanticSpacing.leftGap.auto} text-xs tracking-widest`,
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
