import {
  Area,
  AreaChart,
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
import { PageHeader } from '@/features/shared/components/page-header'
import { formatCurrency } from '@/lib/format'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useAnalytics, useOrders, useProducts } from '@/services/api/hooks'

export default function VendorDashboardPage() {
  const user = useCurrentUser()
  const { data: analytics } = useAnalytics('vendor')
  const { data: products = [] } = useProducts({ vendorId: user?.id })
  const { data: orders = [] } = useOrders({ vendorId: user?.id })

  const lowStock = products.filter((product) => product.stock <= 20)
  const revenueSeries = orders.map((order, index) => ({
    label: `Order ${index + 1}`,
    value: order.total,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor console"
        title="Marketplace performance with catalog, stock, and dispatch visibility."
        description="Manage your published products, keep inventory healthy, and move incoming orders through dispatch and delivery."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/vendor/orders">View orders</Link>
            </Button>
            <Button asChild>
              <Link to="/vendor/products/new">Add product</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {analytics?.widgets?.map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} accent={index % 2 === 0 ? 'primary' : 'accent'} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard
          title="Order value trend"
          description="Recent order values for the current vendor account."
          action={<div className="text-sm font-medium text-primary">{formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}</div>}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="vendorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#166534" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#166534" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#166534" fill="url(#vendorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Low stock watchlist</CardTitle>
            <CardDescription>SKUs that need replenishment soon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((product) => (
              <div key={product.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="font-semibold text-dark">{product.name}</p>
                <p className="text-sm text-slate-500">{product.sku}</p>
                <p className="mt-2 text-2xl font-semibold text-danger">{product.stock}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
