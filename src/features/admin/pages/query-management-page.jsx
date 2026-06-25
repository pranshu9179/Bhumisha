import { Activity, Eye, MessageSquare } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { NativeSelect } from '@/components/ui/native-select'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { HashtagText } from '@/features/shared/components/hashtag-text'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatDate } from '@/lib/format'
import { useAdminQueries, useAdminQueryDetail, useAdminUserActivity, useProducts, useQueryDeleteMutation } from '@/services/api/hooks'

function TruncatedText({ value }) {
  return <p className="max-w-md truncate"><HashtagText text={value} /></p>
}

function AdminQueryDetailDialog({ query }) {
  const [open, setOpen] = useState(false)
  const { data: detail, isLoading } = useAdminQueryDetail(open ? query.id : null)
  const fullQuery = detail?.query || query

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" onClick={(event) => event.stopPropagation()}>
          <Eye className="h-4 w-4" />
          Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{fullQuery.cropName || 'Query'} detail</DialogTitle>
          <DialogDescription>Complete admin query view with replies and status history.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading query detail...</p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Query ID" value={fullQuery.id} />
              <Info label="Asked by" value={fullQuery.askedBy} />
              <Info label="Phone" value={fullQuery.userPhone} />
              <Info label="Crop" value={fullQuery.cropName} />
              <Info label="Status" value={<StatusBadge value={fullQuery.status} />} />
              <Info label="Created" value={formatDate(fullQuery.createdAt, 'DD MMM YYYY - hh:mm A')} />
            </div>
            <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Query</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                <HashtagText text={fullQuery.queryText} />
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-dark">Replies ({detail?.replies?.length || 0})</p>
              {detail?.replies?.length ? (
                detail.replies.map((reply) => (
                  <div key={reply.id} className="rounded-2xl border border-border bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-dark">{reply.repliedBy || 'Responder'}</p>
                      <p className="text-xs text-slate-500">{reply.responderType || 'Staff'} - {formatDate(reply.createdAt, 'DD MMM - hh:mm A')}</p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      <HashtagText text={reply.replyText} />
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No replies found.</p>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-dark">Status history ({detail?.statusHistory?.length || 0})</p>
              {detail?.statusHistory?.length ? (
                detail.statusHistory.map((item, index) => (
                  <div key={`${item.changed_at || item.changedAt}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
                    <span className="font-medium text-dark">
                      {item.old_status || 'new'} to {item.new_status || '-'}
                    </span>
                    <span className="text-slate-500">
                      {item.changed_by || '-'} - {formatDate(item.changed_at || item.changedAt, 'DD MMM - hh:mm A')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No status history found.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function UserActivityDialog({ query }) {
  const [open, setOpen] = useState(false)
  const userId = query.userId || query.user_id
  const { data: activity, isLoading } = useAdminUserActivity(open ? userId : null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" disabled={!userId} onClick={(event) => event.stopPropagation()}>
          <Activity className="h-4 w-4" />
          Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{activity?.user?.name || query.askedBy || 'User'} activity</DialogTitle>
          <DialogDescription>Admin summary for queries raised and replies given by this user.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading user activity...</p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Queries" value={activity?.summary?.total_queries_made ?? 0} />
              <Info label="Replies" value={activity?.summary?.total_replies_given ?? 0} />
              <Info label="Pending" value={activity?.summary?.pending_queries ?? 0} />
              <Info label="Confirmed" value={activity?.summary?.confirmed_queries ?? 0} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-dark">Recent queries</p>
              <div className="space-y-2">
                {(activity?.queriesMade || []).slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-dark">{item.cropName || 'Query'}</span>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-1 truncate text-slate-500"><HashtagText text={item.queryText} /></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function AdminQueryManagementPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [cropFilter, setCropFilter] = useState('')
  const params = useMemo(
    () => ({
      page: 1,
      limit: 100,
      status: statusFilter || undefined,
      crop_id: cropFilter || undefined,
    }),
    [cropFilter, statusFilter],
  )
  const { data: queries = [], isLoading } = useAdminQueries(params)
  const { data: crops = [] } = useProducts({ page: 1, limit: 100, status: 'false' })
  const deleteMutation = useQueryDeleteMutation()

  const columns = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Farmer', accessorKey: 'askedBy', cell: ({ row }) => row.original.askedBy || '-' },
      { header: 'Phone', accessorKey: 'userPhone', cell: ({ row }) => row.original.userPhone || '-' },
      { header: 'Crop', accessorKey: 'cropName', cell: ({ row }) => row.original.cropName || '-' },
      { header: 'Query', accessorKey: 'queryText', cell: ({ row }) => <TruncatedText value={row.original.queryText} /> },
      { header: 'Replies', accessorKey: 'totalReplies' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM YYYY') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.askedBy || 'Farmer'} query`}
              description="Admin query row returned by the filtered query API."
              record={row.original}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                navigate(`/admin/queries/${row.original.id}`)
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Answer
            </Button>
            <AdminQueryDetailDialog query={row.original} />
            <UserActivityDialog query={row.original} />
            <DeleteActionButton
              confirmMessage={`Delete query ${row.original.id}? Attached Cloudinary media will be removed by the backend.`}
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
    [deleteMutation, navigate],
  )

  const filterSlot = (
    <div className="flex flex-col gap-3 sm:flex-row">
      <NativeSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-40">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
      </NativeSelect>
      <NativeSelect value={cropFilter} onChange={(event) => setCropFilter(event.target.value)} className="min-w-48">
        <option value="">All crops</option>
        {crops.map((crop) => (
          <option key={crop.id} value={crop.id}>
            {crop.name}
          </option>
        ))}
      </NativeSelect>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Query management"
        title="All farmer queries"
        description="Filter, inspect, audit, and delete query records using the admin query APIs."
        compact
      />
      <DataTable
        columns={columns}
        data={queries}
        searchPlaceholder="Search farmer, phone, crop, query..."
        emptyMessage={isLoading ? 'Loading queries...' : 'No queries found.'}
        filterSlot={filterSlot}
        onRowClick={(row) => navigate(`/admin/queries/${row.id}`)}
        onBulkDelete={async (rows) => {
          for (const row of rows) {
            await deleteMutation.mutateAsync(row.id)
          }
          toast.success(`${rows.length} quer${rows.length === 1 ? 'y' : 'ies'} deleted successfully.`)
        }}
        bulkDeleteConfirmMessage="Delete selected farmer queries?"
      />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/75 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-2 text-sm font-semibold text-dark">{value ?? '-'}</div>
    </div>
  )
}
