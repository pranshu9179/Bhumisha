import { useMemo } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  useAuditLogDeleteMutation,
  useAuditLogs,
  useEscalationDeleteMutation,
  useEscalationUpdateMutation,
  useEscalations,
  useOrderDeleteMutation,
  useOrders,
  useQueries,
  useUsers,
} from '@/services/api/hooks'

export function OrdersPage() {
  const { data: orders = [] } = useOrders()
  const { data: vendors = [] } = useUsers({ role: 'vendor' })
  const deleteMutation = useOrderDeleteMutation()
  const vendorMap = useMemo(() => Object.fromEntries(vendors.map((item) => [item.id, item.name])), [vendors])

  const columns = useMemo(
    () => [
      { header: 'Order ID', accessorKey: 'id' },
      { header: 'Vendor', accessorKey: 'vendorId', cell: ({ row }) => vendorMap[row.original.vendorId] || '-' },
      { header: 'Customer', accessorKey: 'customerName' },
      { header: 'Total', accessorKey: 'total', cell: ({ row }) => formatCurrency(row.original.total) },
      { header: 'Payment', accessorKey: 'paymentStatus', cell: ({ row }) => <StatusBadge value={row.original.paymentStatus} /> },
      { header: 'Fulfillment', accessorKey: 'fulfillmentStatus', cell: ({ row }) => <StatusBadge value={row.original.fulfillmentStatus} /> },
      { header: 'Created', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.id} details`}
              description="Order metadata, payment state, and fulfillment context."
              record={row.original}
              fields={[
                { label: 'Order ID', value: row.original.id },
                { label: 'Vendor', value: vendorMap[row.original.vendorId] || row.original.vendorId },
                { label: 'Customer', value: row.original.customerName },
                { label: 'Total', value: formatCurrency(row.original.total) },
                { label: 'Payment', value: row.original.paymentStatus },
                { label: 'Fulfillment', value: row.original.fulfillmentStatus },
                { label: 'Created', value: row.original.createdAt },
                { label: 'Dispatch', value: row.original.dispatchAt },
              ]}
            />
            <DeleteActionButton
              confirmMessage={`Delete order ${row.original.id} from the demo marketplace flow?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Order deleted successfully.'))
              }
            />
          </div>
        ),
      },
    ],
    [deleteMutation, vendorMap],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commerce operations"
        title="Orders oversight"
        description="Track all marketplace orders, payment progress, and fulfillment stages across vendors."
        compact
      />
      <DataTable columns={columns} data={orders} searchPlaceholder="Search orders, customers, vendors..." />
    </div>
  )
}

export function EscalationsPage() {
  const { data: escalations = [] } = useEscalations()
  const { data: queries = [] } = useQueries()
  const { data: employees = [] } = useUsers({ role: 'employee' })
  const mutation = useEscalationUpdateMutation()
  const deleteMutation = useEscalationDeleteMutation()

  const queryMap = useMemo(() => Object.fromEntries(queries.map((item) => [item.id, item])), [queries])
  const employeeMap = useMemo(() => Object.fromEntries(employees.map((item) => [item.id, item.name])), [employees])

  const columns = useMemo(
    () => [
      { header: 'Escalation', accessorKey: 'id' },
      {
        header: 'Query',
        accessorKey: 'queryId',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-dark">{queryMap[row.original.queryId]?.farmerName || row.original.queryId}</p>
            <p className="text-xs text-slate-400">{queryMap[row.original.queryId]?.crop}</p>
          </div>
        ),
      },
      { header: 'Reason', accessorKey: 'reason' },
      { header: 'Severity', accessorKey: 'severity', cell: ({ row }) => <StatusBadge value={row.original.severity} /> },
      { header: 'Owner', accessorKey: 'assignedEmployeeId', cell: ({ row }) => employeeMap[row.original.assignedEmployeeId] || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <RecordDetailsDialog
              title={`${row.original.id} details`}
              description="Escalation metadata, linked query context, and owner assignment."
              record={row.original}
              fields={[
                { label: 'Escalation', value: row.original.id },
                { label: 'Farmer', value: queryMap[row.original.queryId]?.farmerName || '-' },
                { label: 'Crop', value: queryMap[row.original.queryId]?.crop || '-' },
                { label: 'Reason', value: row.original.reason },
                { label: 'Severity', value: row.original.severity },
                { label: 'Owner', value: employeeMap[row.original.assignedEmployeeId] || row.original.assignedEmployeeId },
                { label: 'Status', value: row.original.status },
                { label: 'Started', value: row.original.startedAt },
                { label: 'Due', value: row.original.dueAt },
              ]}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                return mutation
                  .mutateAsync({ id: row.original.id, payload: { status: 'in_follow_up' } })
                  .then(() => toast.success('Escalation moved to follow-up.'))
              }}
            >
              Follow-up
            </Button>
            <Button
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                return mutation
                  .mutateAsync({ id: row.original.id, payload: { status: 'closed' } })
                  .then(() => toast.success('Escalation closed.'))
              }}
            >
              Resolve
            </Button>
            <DeleteActionButton
              confirmMessage={`Delete escalation ${row.original.id} from the SLA queue?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Escalation deleted successfully.'))
              }
            />
          </div>
        ),
      },
    ],
    [deleteMutation, employeeMap, mutation, queryMap],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SLA control"
        title="Escalation center"
        description="Investigate breaches, reassign delayed queries, and coordinate employee follow-up."
        compact
      />
      <DataTable columns={columns} data={escalations} searchPlaceholder="Search escalations or farmer names..." />
    </div>
  )
}

export function AuditLogsPage() {
  const { data: logs = [] } = useAuditLogs()
  const deleteMutation = useAuditLogDeleteMutation()

  const columns = useMemo(
    () => [
      { header: 'Actor', accessorKey: 'actor' },
      { header: 'Action', accessorKey: 'action' },
      { header: 'Target', accessorKey: 'target' },
      { header: 'Channel', accessorKey: 'channel', cell: ({ row }) => <StatusBadge value={row.original.channel} /> },
      { header: 'Timestamp', accessorKey: 'timestamp', cell: ({ row }) => formatDate(row.original.timestamp, 'DD MMM YYYY · hh:mm A') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.id} details`}
              description="Audit event payload captured by the mock platform."
              record={row.original}
            />
            <DeleteActionButton
              confirmMessage="Delete this audit log entry from the demo activity stream?"
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('Audit log deleted successfully.'))
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
        eyebrow="Governance"
        title="Audit trail"
        description="Review platform actions and workflow changes captured by the in-browser mock activity log."
        compact
      />
      <DataTable columns={columns} data={logs} searchPlaceholder="Search audit logs" />
    </div>
  )
}
