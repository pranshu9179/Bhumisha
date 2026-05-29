import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatDate } from '@/lib/format'
import { useEscalations, useQueries, useQueryDeleteMutation } from '@/services/api/hooks'

export default function EmployeeMonitoringPage() {
  const { data: escalations = [] } = useEscalations()
  const { data: queries = [] } = useQueries()
  const deleteMutation = useQueryDeleteMutation()

  const delayedQueries = queries.filter((item) => ['assigned', 'review', 'escalated'].includes(item.status))

  const columns = useMemo(
    () => [
      { header: 'Farmer', accessorKey: 'farmerName' },
      { header: 'Crop', accessorKey: 'crop' },
      { header: 'Issue', accessorKey: 'issueType' },
      { header: 'Priority', accessorKey: 'priority', cell: ({ row }) => <StatusBadge value={row.original.priority} /> },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM · hh:mm A') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.farmerName} query`}
              description="Delayed advisory query details from the monitoring queue."
              record={row.original}
            />
            <DeleteActionButton
              confirmMessage={`Delete the query for ${row.original.farmerName} from the monitoring queue?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Query deleted successfully.'))
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
        eyebrow="Control tower"
        title="Monitoring center"
        description="Surface advisory delays, watch escalating queries, and keep response SLAs visible to the operations team."
        compact
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Delayed queries</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-dark">{delayedQueries.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open escalations</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-dark">{escalations.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Critical queue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-danger">
            {delayedQueries.filter((item) => item.priority === 'critical').length}
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={delayedQueries} searchPlaceholder="Search delayed farmer cases" />
    </div>
  )
}
