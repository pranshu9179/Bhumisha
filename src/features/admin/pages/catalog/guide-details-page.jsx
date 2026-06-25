import { Edit2, Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { GuideDetailDeleteButton, GuideDetailMediaDialog } from '@/features/admin/components/catalog/guide-detail-actions'
import { GuideDetailDialog } from '@/features/admin/components/catalog/guide-detail-dialog'
import { GuideMediaStrip } from '@/features/admin/components/catalog/guide-media'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useGuideDetailDeleteMutation, useGuideDetails, useGuideHeadings, useProducts } from '@/services/api/hooks'

export function GuideDetailsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState(null)
  const [cropFilter, setCropFilter] = useState('')
  const [headingFilter, setHeadingFilter] = useState('')
  const { data: guideDetails = [], isLoading } = useGuideDetails({ page: 1, limit: 10 })
  const { data: crops = [] } = useProducts({ page: 1, limit: 100, status: 'false' })
  const { data: headings = [] } = useGuideHeadings()
  const deleteMutation = useGuideDetailDeleteMutation()

  const cropMap = useMemo(() => Object.fromEntries(crops.map((crop) => [String(crop.id), crop.name])), [crops])
  const headingMap = useMemo(() => Object.fromEntries(headings.map((heading) => [String(heading.id), heading.title])), [headings])
  const visibleDetails = useMemo(
    () =>
      guideDetails.filter((detail) => {
        const cropMatches = cropFilter ? String(detail.cropId) === String(cropFilter) : true
        const headingMatches = headingFilter ? String(detail.headingId) === String(headingFilter) : true
        return cropMatches && headingMatches
      }),
    [cropFilter, guideDetails, headingFilter],
  )

  const openCreateDialog = () => {
    setEditingDetail(null)
    setDialogOpen(true)
  }

  const openEditDialog = useCallback((detail) => {
    setEditingDetail(detail)
    setDialogOpen(true)
  }, [])

  const columns = useMemo(
    () => [
      { header: 'Crop', accessorKey: 'cropName', cell: ({ row }) => cropMap[String(row.original.cropId)] || row.original.cropName || '-' },
      { header: 'Heading', accessorKey: 'headingName', cell: ({ row }) => headingMap[String(row.original.headingId)] || row.original.headingName || '-' },
      { header: 'English title', accessorKey: 'title' },
      { header: 'Hindi title', accessorKey: 'title_hi', cell: ({ row }) => row.original.title_hi || '-' },
      {
        header: 'Media',
        accessorKey: 'media',
        enableSorting: false,
        cell: ({ row }) => <GuideMediaStrip media={row.original.media || []} />,
      },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.title} details`}
              description="Crop guide detail bilingual content and parent mapping."
              record={row.original}
              fields={[
                { label: 'ID', value: row.original.id },
                { label: 'Crop', value: cropMap[String(row.original.cropId)] || row.original.cropName },
                { label: 'Heading', value: headingMap[String(row.original.headingId)] || row.original.headingName },
                { label: 'English title', value: row.original.title },
                { label: 'Hindi title', value: row.original.title_hi },
                { label: 'English description', value: row.original.description },
                { label: 'Hindi description', value: row.original.description_hi },
                { label: 'Media', value: (row.original.media || []).join('\n') },
                { label: 'Status', value: row.original.status },
              ]}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                openEditDialog(row.original)
              }}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <GuideDetailMediaDialog detail={row.original} />
            <GuideDetailDeleteButton detail={row.original} />
          </div>
        ),
      },
    ],
    [cropMap, headingMap, openEditDialog],
  )

  const filterSlot = (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <NativeSelect value={cropFilter} onChange={(event) => setCropFilter(event.target.value)} className="max-w-xs">
        <option value="">All crops</option>
        {crops.map((crop) => (
          <option key={crop.id} value={crop.id}>
            {crop.name}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect value={headingFilter} onChange={(event) => setHeadingFilter(event.target.value)} className="max-w-xs">
        <option value="">All headings</option>
        {headings.map((heading) => (
          <option key={heading.id} value={heading.id}>
            {heading.title}
          </option>
        ))}
      </NativeSelect>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Crop guide"
        title="Guide details"
        description="Create heading-wise crop guide content, edit bilingual detail rows, append media, and remove media by index."
        compact
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add detail
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={visibleDetails}
        searchPlaceholder="Search guide details, crops, headings..."
        emptyMessage={isLoading ? 'Loading guide details...' : 'No guide details found.'}
        filterSlot={filterSlot}
        onBulkDelete={async (rows) => {
          for (const row of rows) {
            await deleteMutation.mutateAsync(row.id)
          }
          toast.success(`${rows.length} guide detail${rows.length === 1 ? '' : 's'} deleted successfully.`)
        }}
        bulkDeleteConfirmMessage="Delete selected guide details?"
      />
      <GuideDetailDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setEditingDetail(null)
        }}
        detail={editingDetail}
        crops={crops}
        headings={headings}
      />
    </div>
  )
}

export default GuideDetailsPage
