import { zodResolver } from '@hookform/resolvers/zod'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ChartCard } from '@/components/charts/chart-card'
import { StatCard } from '@/components/charts/stat-card'
import { DataTable } from '@/components/data-table/data-table'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { PageHeader } from '@/features/shared/components/page-header'
import { formatCurrency } from '@/lib/format'
import { useAnalytics, useOrders, useQueries, useSettings, useSettingsSaveMutation, useUsers } from '@/services/api/hooks'

export function AnalyticsPage() {
  const { data: analytics } = useAnalytics('admin')
  const { data: queries = [] } = useQueries()
  const { data: products = [] } = useOrders()

  const prioritySeries = [
    { name: 'Low', value: queries.filter((item) => item.priority === 'low').length, fill: '#86efac' },
    { name: 'Medium', value: queries.filter((item) => item.priority === 'medium').length, fill: '#facc15' },
    { name: 'High', value: queries.filter((item) => item.priority === 'high').length, fill: '#fb923c' },
    { name: 'Critical', value: queries.filter((item) => item.priority === 'critical').length, fill: '#ef4444' },
  ]

  const fulfillmentSeries = [
    { label: 'Pending', count: products.filter((item) => item.fulfillmentStatus === 'pending').length },
    { label: 'Processing', count: products.filter((item) => item.fulfillmentStatus === 'processing').length },
    { label: 'Dispatched', count: products.filter((item) => item.fulfillmentStatus === 'dispatched').length },
    { label: 'Delivered', count: products.filter((item) => item.fulfillmentStatus === 'delivered').length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive insights"
        title="Analytics workspace"
        description="High-level operational trends for advisory throughput, commerce performance, and workflow balance."
        compact
      />
      <div className="grid gap-4 md:grid-cols-3">
        {analytics?.widgets?.slice(0, 3).map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} accent={index === 1 ? 'accent' : 'primary'} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Order fulfillment mix" description="Snapshot of order pipeline stages across all vendors.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fulfillmentSeries}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#166534" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Query priority mix" description="Field demand intensity and advisory urgency levels.">
          <div className="grid gap-4 sm:grid-cols-2">
            {prioritySeries.map((item) => (
              <div key={item.name} className="rounded-3xl border border-slate-100 bg-slate-50/75 p-5">
                <p className="text-sm font-medium text-slate-500">{item.name}</p>
                <p className="mt-2 text-3xl font-semibold text-dark">{item.value}</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full" style={{ width: `${Math.max(item.value * 18, 18)}px`, backgroundColor: item.fill }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

export function ReportsPage() {
  const { data: vendors = [] } = useUsers({ role: 'vendor' })
  const { data: experts = [] } = useUsers({ role: 'expert' })
  const { data: orders = [] } = useOrders()
  const { data: queries = [] } = useQueries()

  const vendorPerformance = useMemo(
    () =>
      vendors.map((vendor) => {
        const vendorOrders = orders.filter((order) => order.vendorId === vendor.id)
        return {
          vendor: vendor.name,
          orders: vendorOrders.length,
          revenue: vendorOrders.reduce((sum, order) => sum + order.total, 0),
        }
      }),
    [orders, vendors],
  )

  const expertPerformance = useMemo(
    () =>
      experts.map((expert) => ({
        expert: expert.name,
        handled: queries.filter((query) => query.assignedExpertId === expert.id).length,
        closed: queries.filter((query) => query.assignedExpertId === expert.id && query.status === 'closed').length,
      })),
    [experts, queries],
  )

  const columns = useMemo(
    () => [
      { header: 'Vendor', accessorKey: 'vendor' },
      { header: 'Orders', accessorKey: 'orders' },
      { header: 'Revenue', accessorKey: 'revenue', cell: ({ row }) => formatCurrency(row.original.revenue) },
    ],
    [],
  )

  const expertColumns = useMemo(
    () => [
      { header: 'Expert', accessorKey: 'expert' },
      { header: 'Assigned', accessorKey: 'handled' },
      { header: 'Closed', accessorKey: 'closed' },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operational reports"
        title="Performance summaries"
        description="Review commerce contribution, expert completion, and throughput outcomes with export-ready screen layouts."
        compact
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <DataTable columns={columns} data={vendorPerformance} searchPlaceholder="Search vendor reports" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <DataTable columns={expertColumns} data={expertPerformance} searchPlaceholder="Search expert reports" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const settingsSchema = z.object({
  escalationHours: z.coerce.number().min(1),
  autoAssignExperts: z.string(),
  auditRetentionDays: z.coerce.number().min(30),
  notificationsDigest: z.string(),
  vendorApprovalMode: z.string(),
})

export function SettingsPage() {
  const { data: settings } = useSettings()
  const mutation = useSettingsSaveMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    if (settings) {
      reset({
        ...settings,
        autoAssignExperts: String(settings.autoAssignExperts),
      })
    }
  }, [reset, settings])

  const onSubmit = async (values) => {
    await mutation.mutateAsync({
      ...values,
      autoAssignExperts: values.autoAssignExperts === 'true',
    })
    toast.success('Settings saved successfully.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform controls"
        title="Settings"
        description="Adjust mock workflow thresholds, vendor approval mode, and notification cadence for the admin demo."
        compact
      />
      <Card>
        <CardContent className="p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Escalation threshold (hours)" error={errors.escalationHours?.message}>
              <Input type="number" {...register('escalationHours')} />
            </Field>
            <Field label="Auto assign experts" error={errors.autoAssignExperts?.message}>
              <NativeSelect {...register('autoAssignExperts')}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </NativeSelect>
            </Field>
            <Field label="Audit retention (days)" error={errors.auditRetentionDays?.message}>
              <Input type="number" {...register('auditRetentionDays')} />
            </Field>
            <Field label="Notifications digest" error={errors.notificationsDigest?.message}>
              <NativeSelect {...register('notificationsDigest')}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="instant">Instant</option>
              </NativeSelect>
            </Field>
            <Field label="Vendor approval mode" error={errors.vendorApprovalMode?.message}>
              <NativeSelect {...register('vendorApprovalMode')}>
                <option value="manual">Manual</option>
                <option value="assisted">Assisted review</option>
              </NativeSelect>
            </Field>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
