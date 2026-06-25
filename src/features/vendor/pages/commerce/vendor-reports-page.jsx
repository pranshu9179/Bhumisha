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
import { DataTable } from '@/components/data-table/data-table'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/features/shared/components/page-header'
import { useVendorShopProducts } from '@/features/vendor/hooks/use-vendor-shop-products'
import { formatCurrency, formatDate } from '@/lib/format'
import { useOrders } from '@/services/api/hooks'

export function VendorReportsPage() {
  const { data: orders = [] } = useOrders()
  const { data: products = [] } = useVendorShopProducts()
  const productMap = new Map(products.map((product) => [String(product.id), product]))

  const chartData = products.map((product) => ({
    label: product.name.split(' ').slice(0, 2).join(' '),
    stock: product.stock,
  }))
  const salesRows = orders.flatMap((order) => {
    if (order.productName || order.product_name) {
      const quantity = Number(order.quantity || 0)
      const itemTotal = Number(order.itemTotal || order.item_total || Number(order.price || 0) * quantity || order.total || 0)
      return [{
        id: `${order.id}-${order.productName || order.product_name}`,
        orderId: order.id,
        productName: order.productName || order.product_name,
        quantity,
        itemTotal,
        status: order.fulfillmentStatus,
        createdAt: order.createdAt,
      }]
    }

    return (order.items || []).map((item) => {
      const productId = item.productId || item.product_id
      const product = productMap.get(String(productId))
      const quantity = Number(item.quantity || 0)
      const itemTotal = Number(item.lineTotal || item.item_total || Number(item.price || product?.price || 0) * quantity)
      return {
        id: `${order.id}-${productId}`,
        orderId: order.id,
        productName: product?.name || productId,
        quantity,
        itemTotal,
        status: order.fulfillmentStatus,
        createdAt: order.createdAt,
      }
    })
  })
  const salesSummary = {
    totalEarnings: salesRows.reduce((sum, row) => sum + row.itemTotal, 0),
    totalOrders: orders.length,
    totalItemsSold: salesRows.reduce((sum, row) => sum + row.quantity, 0),
  }
  const salesColumns = [
    { header: 'Order', accessorKey: 'orderId' },
    { header: 'Product', accessorKey: 'productName' },
    { header: 'Qty', accessorKey: 'quantity' },
    { header: 'Item total', accessorKey: 'itemTotal', cell: ({ row }) => formatCurrency(row.original.itemTotal) },
    { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM YYYY') },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor insights"
        title="Performance reports"
        description="Monitor revenue, inventory depth, and the distribution of performance across your product portfolio."
        compact
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ChartCard title="Inventory by product" description="Stock depth across products in the current vendor catalog.">
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
              <p className="text-3xl font-semibold text-dark">{formatCurrency(salesSummary.totalEarnings)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Orders</p>
              <p className="text-3xl font-semibold text-dark">{salesSummary.totalOrders}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Items sold</p>
              <p className="text-3xl font-semibold text-dark">{salesSummary.totalItemsSold}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Published products</p>
              <p className="text-3xl font-semibold text-dark">{products.filter((product) => product.status === 'published').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6">
          <DataTable columns={salesColumns} data={salesRows} searchPlaceholder="Search sales by order or product" />
        </CardContent>
      </Card>
    </div>
  )
}

export default VendorReportsPage
