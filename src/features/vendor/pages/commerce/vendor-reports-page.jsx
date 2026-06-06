import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '@/components/charts/chart-card'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/features/shared/components/page-header'
import { useCurrentUser } from '@/hooks/use-current-user'
import { formatCurrency } from '@/lib/format'
import { useOrders, useProducts } from '@/services/api/hooks'

export function VendorReportsPage() {
  const user = useCurrentUser()
  const { data: orders = [] } = useOrders({ vendorId: user?.id })
  const { data: products = [] } = useProducts({ vendorId: user?.id })

  const chartData = products.map((product) => ({
    label: product.name.split(' ').slice(0, 2).join(' '),
    stock: product.stock,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor insights"
        title="Performance reports"
        description="Monitor revenue, inventory depth, and the distribution of performance across your product portfolio."
        compact
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ChartCard title="Inventory by SKU" description="Stock depth across products in the current vendor catalog.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="stock" fill="#166534" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <Card>
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="text-3xl font-semibold text-dark">{formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Orders</p>
              <p className="text-3xl font-semibold text-dark">{orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Published products</p>
              <p className="text-3xl font-semibold text-dark">{products.filter((product) => product.status === 'published').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VendorReportsPage
