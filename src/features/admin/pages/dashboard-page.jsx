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
import { PageHeader } from '@/features/shared/components/page-header'
import { WorkflowTimeline } from '@/features/shared/components/workflow-timeline'
import { formatCurrency } from '@/lib/format'
import { useOrders, useProducts, useQueries, useServiceBookings, useSettlements, useUsers, useVendors } from '@/services/api/hooks'

const pieColors = ['#166534', '#0f766e', '#f59e0b', '#dc2626']

function statusOf(order) {
  return String(order.orderStatus || order.order_status || order.fulfillmentStatus || '').toLowerCase()
}

function isToday(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export default function AdminDashboardPage() {
  const { data: users = [] } = useUsers({ page: 1, limit: 100 })
  const { data: products = [] } = useProducts({ page: 1, limit: 100 })
  const { data: queries = [] } = useQueries({ page: 1, limit: 100 })
  const { data: orders = [] } = useOrders({ page: 1, limit: 100 })
  const { data: serviceBookings = [] } = useServiceBookings({ page: 1, limit: 100 })
  const { data: settlements = [] } = useSettlements({ page: 1, limit: 100 })
  const { data: vendors = [] } = useVendors()

  const lowStock = products.filter((product) => Number(product.stock || 0) <= 20)
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const todayOrders = orders.filter((order) => isToday(order.createdAt || order.created_at))
  const todayPendingOrders = todayOrders.filter((order) => ['pending', 'processing'].includes(statusOf(order)))
  const todayDispatchedOrders = todayOrders.filter((order) => ['dispatched', 'shipped'].includes(statusOf(order)))
  const todayDeliveredOrders = todayOrders.filter((order) => statusOf(order) === 'delivered')
  const todayVendorEnquiries = serviceBookings.filter((booking) => isToday(booking.createdAt || booking.created_at))
  const todaySettlements = settlements.filter((settlement) => isToday(settlement.createdAt || settlement.created_at))
  const paymentDue = orders
    .filter((order) => !['paid', 'success', 'completed'].includes(String(order.paymentStatus || order.payment_status || '').toLowerCase()))
    .reduce((sum, order) => sum + Number(order.total || 0), 0)
  const revenueTrend = orders.map((order, index) => ({
    label: `Order ${index + 1}`,
    value: Number(order.total || 0),
  }))
  const queryMix = ['pending', 'confirmed', 'closed', 'answered'].map((status) => ({
    name: status,
    value: queries.filter((query) => query.status === status).length,
  }))

  const widgets = [
    { label: "Today's orders", value: todayOrders.length, delta: 'Open order section', to: '/admin/orders?tab=orders&filter_date=today' },
    { label: "Today's pending orders", value: todayPendingOrders.length, delta: 'Pending and processing', to: '/admin/orders?tab=orders&filter_date=today&filter_status=pending' },
    { label: "Today's dispatched orders", value: todayDispatchedOrders.length, delta: 'Dispatched and shipped', to: '/admin/orders?tab=orders&filter_date=today&filter_status=dispatched' },
    { label: "Today's delivered orders", value: todayDeliveredOrders.length, delta: 'Delivered orders', to: '/admin/orders?tab=orders&filter_date=today&filter_status=delivered' },
    { label: "Today's services enquiry", value: todayVendorEnquiries.length, delta: 'Service bookings', to: '/admin/orders?tab=service-bookings&filter_date=today' },
    { label: "Today's payment settlement", value: todaySettlements.length, delta: 'Settlement records', to: '/admin/settlements?filter_date=today' },
    { label: 'Total payment due', value: formatCurrency(paymentDue), delta: 'Uncleared order value', to: '/admin/orders?tab=orders&filter_status=pending' },
    { label: 'Total vendor', value: vendors.length, delta: 'Manage vendors', to: '/admin/vendors' },
    { label: 'Users', value: users.length, delta: 'Manage users', to: '/admin/users' },
    { label: 'Farmer Crop Queries', value: queries.length, delta: 'Query desk', to: '/admin/queries' },
    { label: 'Products', value: products.length, delta: 'Manage catalog', to: '/admin/products' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin command center"
        title="Documented API overview"
        description="Dashboard data is derived only from endpoints listed in the API document."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/admin/vendors">Vendors</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/queries">Queries</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {widgets.map((item, index) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            to={item.to}
            accent={index % 3 === 1 ? 'accent' : index % 4 === 0 ? 'primary' : 'danger'}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <ChartCard
          title="Order value trend"
          description="Recent order totals from the documented order history endpoint."
          action={<div className="text-sm font-medium text-primary">{formatCurrency(revenue)}</div>}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#166534" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#166534" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#166534" fill="url(#adminRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Query status mix" description="Status distribution from documented query APIs.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={queryMix} dataKey="value" nameKey="name" innerRadius={72} outerRadius={108} paddingAngle={4}>
                  {queryMix.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Low stock crops</CardTitle>
            <CardDescription>Catalog rows with low stock values.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div>
                  <p className="font-semibold text-dark">{product.name}</p>
                </div>
                <p className="text-lg font-semibold text-danger">{product.stock}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <WorkflowTimeline
          title="Documented query flow"
          description="Query lifecycle represented by documented `/queries` endpoints."
          activeStep={2}
          steps={['Create Query', 'Staff Pending', 'Submit Reply', 'Public Feed']}
        />
      </div>
    </div>
  )
}
