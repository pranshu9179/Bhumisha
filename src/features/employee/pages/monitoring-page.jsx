import { useMemo } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatDate } from '@/lib/format'
import { useEscalations, useStaffPendingQueries } from '@/services/api/hooks'

export default function EmployeeMonitoringPage() {
  const { data: escalations = [] } = useEscalations()
  const { data: pendingQueries = [], isLoading } = useStaffPendingQueries({ page: 1, limit: 100 })
  const mediaQueries = pendingQueries.filter((item) => item.media?.length)

  const columns = useMemo(
    () => [
      { header: 'Farmer', accessorKey: 'askedBy', cell: ({ row }) => row.original.askedBy || '-' },
      { header: 'Crop', accessorKey: 'cropName', cell: ({ row }) => row.original.cropName || '-' },
      {
        header: 'Query',
        accessorKey: 'queryText',
        cell: ({ row }) => <p className="max-w-md truncate">{row.original.queryText}</p>,
      },
      { header: 'Media', accessorKey: 'mediaType', cell: ({ row }) => <StatusBadge value={row.original.mediaType} /> },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM - hh:mm A') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.askedBy || 'Farmer'} query`}
              description="Pending query details from the staff monitoring queue."
              record={row.original}
            />
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control tower"
        title="Monitoring center"
        description="Surface pending farmer queries, media-heavy cases, and response workload for the support team."
        compact
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending queries</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-dark">{pendingQueries.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open escalations</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-dark">{escalations.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Media attached</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-danger">{mediaQueries.length}</CardContent>
        </Card>
      </div>
      <DataTable
        columns={columns}
        data={pendingQueries}
        searchPlaceholder="Search pending farmer queries"
        emptyMessage={isLoading ? 'Loading pending queries...' : 'No pending queries found.'}
      />
    </div>
  )
}
