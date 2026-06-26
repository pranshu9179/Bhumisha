import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { NativeSelect } from '@/components/ui/native-select'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatDate } from '@/lib/format'
import { useServiceBookingStatusMutation, useServiceBookings } from '@/services/api/hooks'

const SERVICE_BOOKING_STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled']

function selectedStatus(value) {
  const normalized = String(value || '').toLowerCase()
  return SERVICE_BOOKING_STATUS_OPTIONS.find((option) => option.toLowerCase() === normalized) || SERVICE_BOOKING_STATUS_OPTIONS[0]
}

export default function EmployeeServiceBookingsPage() {
  const { data: serviceBookings = [] } = useServiceBookings({ page: 1, limit: 100 })
  const statusMutation = useServiceBookingStatusMutation()

  const columns = useMemo(
    () => [
      { header: 'Booking', accessorKey: 'id' },
      { header: 'Farmer', accessorKey: 'name', cell: ({ row }) => row.original.name || row.original.user_name || '-' },
      { header: 'Phone', accessorKey: 'phone_number', cell: ({ row }) => row.original.phone_number || row.original.phoneNumber || '-' },
      { header: 'Vendor', accessorKey: 'vendor_name', cell: ({ row }) => row.original.vendor_name || row.original.vendorName || '-' },
      { header: 'Category', accessorKey: 'category_name', cell: ({ row }) => row.original.category_name || row.original.categoryName || '-' },
      { header: 'Remark', accessorKey: 'remark', cell: ({ row }) => row.original.remark || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt || row.original.created_at, 'DD MMM') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`Service booking ${row.original.id}`}
              description="Service request metadata, vendor, farmer, and status."
              record={row.original}
            />
            <NativeSelect
              className="h-9 w-36"
              value={selectedStatus(row.original.status)}
              disabled={statusMutation.isPending}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                statusMutation
                  .mutateAsync({ id: row.original.id, status: event.target.value })
                  .then(() => toast.success(`Service booking marked ${event.target.value}.`))
              }
            >
              {SERVICE_BOOKING_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </NativeSelect>
          </div>
        ),
      },
    ],
    [statusMutation],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service operations"
        title="Service bookings"
        description="Review farmer service requests and update request status."
        compact
      />
      <DataTable columns={columns} data={serviceBookings} searchPlaceholder="Search service bookings" />
    </div>
  )
}
