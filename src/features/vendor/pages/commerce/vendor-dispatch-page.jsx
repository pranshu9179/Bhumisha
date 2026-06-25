import { toast } from 'sonner'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/features/shared/components/page-header'
import { formatCurrency } from '@/lib/format'
import { useOrderUpdateMutation, useOrders } from '@/services/api/hooks'

export function VendorDispatchPage() {
  const { data: orders = [] } = useOrders()
  const mutation = useOrderUpdateMutation()

  const dispatchable = orders.filter((order) => String(order.fulfillmentStatus).toLowerCase() !== 'delivered')

  const updateOrder = async (orderId, status) => {
    await mutation.mutateAsync({
      id: orderId,
      payload: { orderStatus: status },
    })
    toast.success(`Order moved to ${status}.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dispatch board"
        title="Dispatch management"
        description="Move orders from processing to dispatched and delivered while keeping fulfillment visible."
        compact
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {dispatchable.map((order) => (
          <Card key={order.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-dark">{order.id}</p>
                  <p className="text-sm text-slate-500">{order.customerName}</p>
                </div>
                <StatusBadge value={order.fulfillmentStatus} />
              </div>
              <p className="text-lg font-semibold text-dark">{formatCurrency(order.total)}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => updateOrder(order.id, 'Processing')}>
                  Processing
                </Button>
                <Button size="sm" onClick={() => updateOrder(order.id, 'Shipped')}>
                  Ship
                </Button>
                <Button size="sm" variant="accent" onClick={() => updateOrder(order.id, 'Delivered')}>
                  Deliver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default VendorDispatchPage
