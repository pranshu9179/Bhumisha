/* eslint-disable react-refresh/only-export-components */
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }) {
  return <TabsPrimitive.List className={cn('inline-flex rounded-2xl border border-border bg-slate-100/80 p-1', className)} {...props} />
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-dark data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export const TabsContent = TabsPrimitive.Content
