import { Edit2, Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GuideHeadingDeleteButton, GuideHeadingRestoreButton } from '@/features/admin/components/catalog/guide-heading-actions'
import { GuideHeadingDialog } from '@/features/admin/components/catalog/guide-heading-dialog'
import { readDeletedGuideHeadings, writeDeletedGuideHeadings } from '@/features/admin/components/catalog/catalog-utils'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { useGuideHeadings } from '@/services/api/hooks'

export function GuideHeadingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHeading, setEditingHeading] = useState(null)
  const [deletedHeadings, setDeletedHeadings] = useState(readDeletedGuideHeadings)
  const { data: activeHeadings = [], isLoading } = useGuideHeadings()
  const activeHeadingIds = useMemo(() => new Set(activeHeadings.map((heading) => String(heading.id))), [activeHeadings])
  const visibleDeletedHeadings = useMemo(
    () => deletedHeadings.filter((heading) => !activeHeadingIds.has(String(heading.id))),
    [activeHeadingIds, deletedHeadings],
  )

  const persistDeletedHeadings = useCallback((rows) => {
    setDeletedHeadings(rows)
    writeDeletedGuideHeadings(rows)
  }, [])

  const handleDeleted = useCallback(
    (heading) => {
      const deletedHeading = {
        ...heading,
        status: 'deleted',
        is_delete: true,
        deletedAt: new Date().toISOString(),
      }
      persistDeletedHeadings([
        deletedHeading,
        ...deletedHeadings.filter((item) => String(item.id) !== String(heading.id)),
      ])
    },
    [deletedHeadings, persistDeletedHeadings],
  )

  const handleRestored = useCallback(
    (id) => {
      persistDeletedHeadings(deletedHeadings.filter((heading) => String(heading.id) !== String(id)))
    },
    [deletedHeadings, persistDeletedHeadings],
  )

  const openCreateDialog = () => {
    setEditingHeading(null)
    setDialogOpen(true)
  }

  const openEditDialog = useCallback((heading) => {
    setEditingHeading(heading)
    setDialogOpen(true)
  }, [])

  const allHeadings = useMemo(() => [...activeHeadings, ...visibleDeletedHeadings], [activeHeadings, visibleDeletedHeadings])

  const columns = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'English heading', accessorKey: 'title' },
      { header: 'Hindi heading', accessorKey: 'title_hi', cell: ({ row }) => row.original.title_hi || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.title} details`}
              description="Guide heading bilingual metadata."
              record={row.original}
              fields={[
                { label: 'ID', value: row.original.id },
                { label: 'English heading', value: row.original.title },
                { label: 'Hindi heading', value: row.original.title_hi },
                { label: 'Status', value: row.original.status },
                { label: 'Created', value: row.original.createdAt },
                { label: 'Updated', value: row.original.updatedAt },
                { label: 'Deleted locally tracked', value: row.original.deletedAt },
              ]}
            />
            {row.original.status === 'deleted' ? (
              <GuideHeadingRestoreButton heading={row.original} onRestored={handleRestored} />
            ) : (
              <>
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
                <GuideHeadingDeleteButton heading={row.original} onDeleted={handleDeleted} />
              </>
            )}
          </div>
        ),
      },
    ],
    [handleDeleted, handleRestored, openEditDialog],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Crop guide"
        title="Guide headings"
        description="Create and maintain bilingual crop guide section headings such as sowing, diseases, care, and harvesting."
        compact
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add heading
          </Button>
        }
      />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeHeadings.length})</TabsTrigger>
          <TabsTrigger value="deleted">Deleted ({visibleDeletedHeadings.length})</TabsTrigger>
          <TabsTrigger value="all">All ({allHeadings.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={activeHeadings}
            searchPlaceholder="Search active guide headings"
            emptyMessage={isLoading ? 'Loading guide headings...' : 'No active guide headings found.'}
          />
        </TabsContent>
        <TabsContent value="deleted">
          <DataTable
            columns={columns}
            data={visibleDeletedHeadings}
            searchPlaceholder="Search deleted guide headings"
            emptyMessage="No locally tracked deleted guide headings found."
          />
        </TabsContent>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={allHeadings}
            searchPlaceholder="Search guide headings"
            emptyMessage={isLoading ? 'Loading guide headings...' : 'No guide headings found.'}
          />
        </TabsContent>
      </Tabs>

      <GuideHeadingDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setEditingHeading(null)
        }}
        heading={editingHeading}
      />
    </div>
  )
}

export default GuideHeadingsPage

