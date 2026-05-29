import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { ChartCard } from '@/components/charts/chart-card'
import { StatCard } from '@/components/charts/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityFeed } from '@/features/shared/components/activity-feed'
import { PageHeader } from '@/features/shared/components/page-header'
import { WorkflowTimeline } from '@/features/shared/components/workflow-timeline'
import { formatCurrency } from '@/lib/format'
import { useAnalytics, useAuditLogs, useProducts } from '@/services/api/hooks'

const pieColors = ['#166534', '#0f766e', '#f59e0b', '#dc2626']

export default function AdminDashboardPage() {
  const { data: analytics } = useAnalytics('admin')
  const { data: auditLogs = [] } = useAuditLogs()
  const { data: products = [] } = useProducts()
  const lowStock = products.filter((product) => product.stock <= 20)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin command center"
        title="Central visibility across advisory and marketplace operations."
        description="Monitor experts, employees, vendors, orders, and escalations from one agriculture-focused SaaS workspace."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/admin/vendors">Review vendors</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/escalations">Open escalations</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {analytics?.widgets?.map((item, index) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            accent={index % 3 === 1 ? 'accent' : index % 4 === 0 ? 'primary' : 'danger'}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <ChartCard
          title="Revenue trajectory"
          description="Mock monthly revenue trend across marketplace operations."
          action={<div className="text-sm font-medium text-primary">{formatCurrency(analytics?.revenue)}</div>}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.revenueTrend || []}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#166534" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#166534" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#166534" fill="url(#adminRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Query health mix" description="Distribution of active advisory workflow states.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.queryMix || []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={108}
                  paddingAngle={4}
                >
                  {(analytics?.queryMix || []).map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(analytics?.queryMix || []).map((item, index) => (
              <div key={item.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                <div>
                  <p className="text-sm font-semibold text-dark">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.value} workflows</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ActivityFeed
          items={auditLogs.slice(0, 4)}
          title="Audit highlights"
          description="Recent role activity and workflow changes across the ecosystem."
        />

        <WorkflowTimeline
          title="Query escalation playbook"
          description="Canonical SLA intervention path used by admins and employees."
          activeStep={3}
          steps={[
            'Assign Query',
            'Start Timer',
            'Delay Beyond 2 Hours',
            'Notify Admin',
            'Reassign Expert',
            'Employee Follow-up',
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Low stock alerts</CardTitle>
            <CardDescription>Inventory that may impact recommendation-linked demand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
              >
                <div>
                  <p className="font-semibold text-dark">{product.name}</p>
                  <p className="text-sm text-slate-500">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-danger">{product.stock}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Units left</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <WorkflowTimeline
          title="Marketplace order lifecycle"
          description="Operational states from listing publication to delivery confirmation."
          activeStep={3}
          steps={[
            'Vendor Adds Product',
            'Product Published',
            'Order Created',
            'Processing',
            'Dispatched',
            'Delivered',
          ]}
        />
      </div>
    </div>
  )
}
