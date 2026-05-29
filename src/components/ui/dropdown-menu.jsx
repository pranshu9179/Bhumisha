/* eslint-disable react-refresh/only-export-components */
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export function DropdownMenuContent({ className, sideOffset = 10, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn('z-50 min-w-52 rounded-2xl border border-white/70 bg-white p-2 shadow-2xl', className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuLabel({ className, ...props }) {
  return <DropdownMenuPrimitive.Label className={cn('px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400', className)} {...props} />
}

export function DropdownMenuItem({ className, inset, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 outline-none transition hover:bg-slate-50 hover:text-dark',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn('relative flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 pl-8 text-sm text-slate-600 outline-none transition hover:bg-slate-50 hover:text-dark', className)}
      {...props}
    >
      <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-3.5 w-3.5" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuSeparator({ className, ...props }) {
  return <DropdownMenuPrimitive.Separator className={cn('my-2 h-px bg-slate-100', className)} {...props} />
}

export function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        'flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-slate-600 outline-none transition hover:bg-slate-50 hover:text-dark',
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

export const DropdownMenuSub = DropdownMenuPrimitive.Sub

export function DropdownMenuSubContent({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.SubContent
      className={cn('z-50 min-w-44 rounded-2xl border border-white/70 bg-white p-2 shadow-2xl', className)}
      {...props}
    />
  )
}
