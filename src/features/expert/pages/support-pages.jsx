import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatDate, formatCurrency } from '@/lib/format'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useNotificationReadMutation, useNotifications, useProductDeleteMutation, useProducts } from '@/services/api/hooks'

export function ExpertProductsPage() {
  const { data: products = [] } = useProducts({ status: 'published' })
  const deleteMutation = useProductDeleteMutation()

  const columns = useMemo(
    () => [
      { header: 'Product', accessorKey: 'name' },
      { header: 'SKU', accessorKey: 'sku' },
      { header: 'Price', accessorKey: 'price', cell: ({ row }) => formatCurrency(row.original.price) },
      { header: 'Stock', accessorKey: 'stock' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} details`}
              description="Published product details available to experts during recommendation drafting."
              record={row.original}
            />
            <DeleteActionButton
              confirmMessage={`Delete ${row.original.name} from the suggested products list?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Product deleted successfully.'))
              }
            />
          </div>
        ),
      },
    ],
    [deleteMutation],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recommendation catalog"
        title="Suggested products"
        description="Browse published products that can be linked to advisory recommendations."
        compact
      />
      <DataTable columns={columns} data={products} searchPlaceholder="Search products to suggest" />
    </div>
  )
}

export function ExpertNotificationsPage() {
  const user = useCurrentUser()
  const { data: notifications = [] } = useNotifications({ userId: user?.id })
  const markReadMutation = useNotificationReadMutation()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Expert notifications"
        description="Review case assignments, response reminders, and platform updates tied to your role."
        compact
      />
      <div className="grid gap-4">
        {notifications.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-dark">{item.title}</p>
                <StatusBadge value={item.status} />
              </div>
              <p className="text-sm text-slate-500">{item.description}</p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  {formatDate(item.createdAt, 'DD MMM · hh:mm A')}
                </p>
                {item.status === 'unread' ? (
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-primary"
                    onClick={() =>
                      markReadMutation
                        .mutateAsync(item.id)
                        .then(() => toast.success('Notification marked as read.'))
                    }
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
