import { Eye } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatDate } from '@/lib/format'
import { useStaffPendingQueries } from '@/services/api/hooks'

export default function EmployeeMonitoringPage() {
  const navigate = useNavigate()
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
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                navigate(`/employee/queries/${row.original.id}`)
              }}
            >
              <Eye className="h-4 w-4" />
              Review
            </Button>
          </div>
        ),
      },
    ],
    [navigate],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control tower"
        title="Monitoring center"
        description="Surface pending farmer queries, media-heavy cases, and response workload for the support team."
        compact
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending queries</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-dark">{pendingQueries.length}</CardContent>
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
        onRowClick={(row) => navigate(`/employee/queries/${row.id}`)}
      />
    </div>
  )
}
