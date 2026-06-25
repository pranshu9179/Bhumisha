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
import { useVendorShopProducts } from '@/features/vendor/hooks/use-vendor-shop-products'
import { formatCurrency } from '@/lib/format'
import { useOrders } from '@/services/api/hooks'

export default function VendorDashboardPage() {
  const { data: products = [] } = useVendorShopProducts()
  const { data: orders = [] } = useOrders()

  const lowStock = products.filter((product) => Number(product.stock || 0) <= 20)
  const orderValue = (order) => {
    if (order.productName || order.product_name) {
      return Number(order.itemTotal || order.item_total || Number(order.price || 0) * Number(order.quantity || 0) || order.total || 0)
    }
    return Number(order.total || 0)
  }
  const revenue = orders.reduce((sum, order) => sum + orderValue(order), 0)
  const revenueSeries = orders.map((order, index) => ({
    label: `Order ${index + 1}`,
    value: orderValue(order),
  }))
  const widgets = [
    { label: 'Products', value: products.length, delta: 'From /products/all' },
    { label: 'Orders', value: orders.length, delta: 'From /orders/history' },
    { label: 'Revenue', value: formatCurrency(revenue), delta: 'Order total' },
    { label: 'Low stock', value: lowStock.length, delta: 'Catalog rows' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor console"
        title="Marketplace overview"
        description="Product and order data from documented commerce APIs."
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {widgets.map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} accent={index % 2 === 0 ? 'primary' : 'accent'} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard
          title="Order value trend"
          description="Recent order values for the current vendor account."
          action={<div className="text-sm font-medium text-primary">{formatCurrency(revenue)}</div>}
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
            <CardDescription>Products that need replenishment soon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((product) => (
              <div key={product.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="font-semibold text-dark">{product.name}</p>
                <p className="mt-2 text-2xl font-semibold text-danger">{product.stock}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
