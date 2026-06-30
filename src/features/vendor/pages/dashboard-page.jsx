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
import { useCurrentUser } from '@/hooks/use-current-user'
import { vendorIdentifiers } from '@/features/vendor/hooks/use-vendor-shop-products'
import { useVendorShopProducts } from '@/features/vendor/hooks/use-vendor-shop-products'
import { formatCurrency } from '@/lib/format'
import { useOrders, useServiceBookings, useVendorProfile } from '@/services/api/hooks'

function statusOf(order) {
  return String(order.orderStatus || order.order_status || order.fulfillmentStatus || '').toLowerCase()
}

function paymentStatusOf(order) {
  return String(order.paymentStatus || order.payment_status || '').toLowerCase()
}

function isToday(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function belongsToCurrentVendor(record, identifiers) {
  if (!identifiers.size) return true
  const values = [
    record.vendorId,
    record.vendor_id,
    record.vendorUserId,
    record.vendor_user_id,
    record.userId,
    record.user_id,
  ]
  return values.some((value) => value !== undefined && value !== null && identifiers.has(String(value)))
}

export default function VendorDashboardPage() {
  const user = useCurrentUser()
  const { data: vendorProfile } = useVendorProfile({ enabled: Boolean(user) })
  const { data: products = [] } = useVendorShopProducts()
  const { data: orders = [] } = useOrders()
  const { data: serviceBookings = [] } = useServiceBookings({ page: 1, limit: 100 })
  const vendorIds = vendorIdentifiers(user, vendorProfile)
  const vendorServiceBookings = serviceBookings.filter((booking) => belongsToCurrentVendor(booking, vendorIds))

  const lowStock = products.filter((product) => Number(product.stock || 0) <= 20)
  const pendingProducts = products.filter((product) => product.is_approved === false || product.approvalStatus === 'pending_review' || product.status === 'pending_review')
  const approvedProducts = products.filter((product) => product.is_approved === true || product.approvalStatus === 'approved' || product.status === 'active')
  const todayOrders = orders.filter((order) => isToday(order.createdAt || order.created_at))
  const pendingOrders = orders.filter((order) => ['pending', 'processing'].includes(statusOf(order)))
  const dispatchedOrders = orders.filter((order) => ['dispatched', 'shipped'].includes(statusOf(order)))
  const deliveredOrders = orders.filter((order) => statusOf(order) === 'delivered')
  const orderValue = (order) => {
    if (order.productName || order.product_name) {
      return Number(order.itemTotal || order.item_total || Number(order.price || 0) * Number(order.quantity || 0) || order.total || 0)
    }
    return Number(order.total || 0)
  }
  const revenue = orders.reduce((sum, order) => sum + orderValue(order), 0)
  const pendingAmount = orders
    .filter((order) => !['paid', 'success', 'completed'].includes(paymentStatusOf(order)))
    .reduce((sum, order) => sum + orderValue(order), 0)
  const clearedPayment = orders
    .filter((order) => ['paid', 'success', 'completed'].includes(paymentStatusOf(order)))
    .reduce((sum, order) => sum + orderValue(order), 0)
  const revenueSeries = orders.map((order, index) => ({
    label: `Order ${index + 1}`,
    value: orderValue(order),
  }))
  const widgets = [
    { label: 'Product pending', value: pendingProducts.length, delta: 'Needs approval', to: '/vendor/products' },
    { label: 'Approved product', value: approvedProducts.length, delta: 'Live catalog', to: '/vendor/products' },
    { label: "Today's order", value: todayOrders.length, delta: 'Open order section', to: '/vendor/orders?tab=active' },
    { label: 'Pending orders', value: pendingOrders.length, delta: 'Pending queue', to: '/vendor/orders?tab=pending' },
    { label: 'Dispatched orders', value: dispatchedOrders.length, delta: 'Dispatch pipeline', to: '/vendor/orders?tab=dispatched' },
    { label: 'Delivered orders', value: deliveredOrders.length, delta: 'Delivered tab', to: '/vendor/orders?tab=delivered' },
    { label: 'Pending amount', value: formatCurrency(pendingAmount), delta: 'Payment due', to: '/vendor/orders?tab=active' },
    { label: 'Total payment clear', value: formatCurrency(clearedPayment), delta: 'Paid orders', to: '/vendor/orders?tab=all' },
    { label: 'Service', value: vendorServiceBookings.length, delta: 'Service requests', to: '/vendor/reports' },
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {widgets.map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} to={item.to} accent={index % 2 === 0 ? 'primary' : 'accent'} />
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
