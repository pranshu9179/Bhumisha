import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatDate } from '@/lib/format'
import { useSupportCaseDeleteMutation, useSupportCaseUpdateMutation, useSupportCases, useUsers } from '@/services/api/hooks'

export default function EmployeeVendorSupportPage() {
  const { data: cases = [] } = useSupportCases()
  const { data: vendors = [] } = useUsers({ role: 'vendor' })
  const mutation = useSupportCaseUpdateMutation()
  const deleteMutation = useSupportCaseDeleteMutation()
  const vendorMap = useMemo(() => Object.fromEntries(vendors.map((item) => [item.id, item.name])), [vendors])

  const columns = useMemo(
    () => [
      { header: 'Vendor', accessorKey: 'vendorId', cell: ({ row }) => vendorMap[row.original.vendorId] || '-' },
      { header: 'Subject', accessorKey: 'subject' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Updated', accessorKey: 'updatedAt', cell: ({ row }) => formatDate(row.original.updatedAt, 'DD MMM · hh:mm A') },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <RecordDetailsDialog
              title={`${row.original.id} details`}
              description="Vendor support case details and ownership metadata."
              record={row.original}
              fields={[
                { label: 'Vendor', value: vendorMap[row.original.vendorId] || row.original.vendorId },
                { label: 'Subject', value: row.original.subject },
                { label: 'Status', value: row.original.status },
                { label: 'Owner', value: row.original.ownerId },
                { label: 'Updated', value: row.original.updatedAt },
              ]}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                return mutation
                  .mutateAsync({ id: row.original.id, payload: { status: 'in_review' } })
                  .then(() => toast.success('Case moved to review.'))
              }}
            >
              Review
            </Button>
            <Button
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                return mutation
                  .mutateAsync({ id: row.original.id, payload: { status: 'closed' } })
                  .then(() => toast.success('Case closed.'))
              }}
            >
              Resolve
            </Button>
            <DeleteActionButton
              confirmMessage={`Delete support case "${row.original.subject}" from the demo queue?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Support case deleted successfully.'))
              }
            />
          </div>
        ),
      },
    ],
    [deleteMutation, mutation, vendorMap],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor care"
        title="Vendor support cases"
        description="Track onboarding, compliance, and listing-support issues assigned to the employee team."
        compact
      />
      <DataTable columns={columns} data={cases} searchPlaceholder="Search vendor support cases" />
    </div>
  )
}
