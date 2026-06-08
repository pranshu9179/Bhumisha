import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, ImageOff, MessageSquare, Paperclip, Send, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Field } from '@/components/forms/field'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { WorkflowTimeline } from '@/features/shared/components/workflow-timeline'
import { formatDate } from '@/lib/format'
import { useProducts, useQueryDetail, useQueryReplyMutation, useStaffMyReplies, useStaffPendingQueries } from '@/services/api/hooks'

const replySchema = z.object({
  reply_text: z.string().trim().min(5, 'Write a useful reply before submitting.'),
  files: z.any().optional(),
})

const statusStepMap = {
  pending: 1,
  confirmed: 3,
}

function fileListToArray(value) {
  if (!value) return []
  if (typeof FileList !== 'undefined' && value instanceof FileList) return Array.from(value)
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function isValidReplyFile(file) {
  if (!file) return true
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4']
  return allowedTypes.includes(file.type) && file.size <= 50 * 1024 * 1024
}

function getMediaUrl(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.url || item.media_url || item.image_url || item.file_url || item.path || ''
}

function isVideoMedia(item) {
  const url = getMediaUrl(item)
  return item?.type === 'video' || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
}

function MediaGrid({ media = [], title = 'Attached media' }) {
  if (!media.length) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50 text-slate-400">
        <div className="text-center">
          <ImageOff className="mx-auto h-6 w-6" />
          <p className="mt-2 text-sm">No media attached</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {media.map((item, index) => {
        const url = getMediaUrl(item)
        if (!url) return null

        return (
          <div key={`${url}-${index}`} className="overflow-hidden rounded-2xl border border-border bg-slate-50">
            {isVideoMedia(item) ? (
              <video src={url} className="h-52 w-full object-cover" controls preload="metadata" />
            ) : (
              <PreviewableImage src={url} alt={`${title} ${index + 1}`} className="h-52 w-full object-cover" previewTitle={title} />
            )}
            <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-slate-500">
              <span className="truncate">{item.original_name || item.originalName || `${title} ${index + 1}`}</span>
              <StatusBadge value={item.type || 'media'} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function QuerySummary({ query }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Query snapshot</CardTitle>
        <CardDescription>Farmer, crop, status, and upload context from the backend query record.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Info label="Asked by" value={query.askedBy || query.farmerName} />
        <Info label="Crop" value={query.cropName || '-'} />
        <Info label="Status" value={<StatusBadge value={query.status} />} />
        <Info label="Replies" value={query.replyCount ?? query.replies?.length ?? 0} />
        <Info label="Raised" value={formatDate(query.createdAt, 'DD MMM YYYY - hh:mm A')} />
        <Info label="Confirmed" value={formatDate(query.confirmedAt, 'DD MMM YYYY - hh:mm A')} />
      </CardContent>
    </Card>
  )
}

export function ExpertQueriesPage() {
  const navigate = useNavigate()
  const [cropFilter, setCropFilter] = useState('')
  const queryParams = useMemo(
    () => ({ page: 1, limit: 100, crop_id: cropFilter || undefined }),
    [cropFilter],
  )
  const { data: queries = [], isLoading } = useStaffPendingQueries(queryParams)
  const { data: crops = [] } = useProducts({ page: 1, limit: 100, status: 'false' })

  const columns = useMemo(
    () => [
      { header: 'Farmer', accessorKey: 'askedBy', cell: ({ row }) => row.original.askedBy || '-' },
      { header: 'Crop', accessorKey: 'cropName', cell: ({ row }) => row.original.cropName || '-' },
      {
        header: 'Problem',
        accessorKey: 'queryText',
        cell: ({ row }) => <p className="max-w-md truncate">{row.original.queryText}</p>,
      },
      { header: 'Media', accessorKey: 'mediaType', cell: ({ row }) => <StatusBadge value={row.original.mediaType} /> },
      { header: 'Replies', accessorKey: 'replyCount' },
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
              description="Pending query metadata returned by the staff queue API."
              record={row.original}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                navigate(`/expert/queries/${row.original.id}`)
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

  const filterSlot = (
    <NativeSelect value={cropFilter} onChange={(event) => setCropFilter(event.target.value)} className="max-w-xs">
      <option value="">All crops</option>
      {crops.map((crop) => (
        <option key={crop.id} value={crop.id}>
          {crop.name}
        </option>
      ))}
    </NativeSelect>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Expert queue"
        title="Pending farmer queries"
        description="Review unconfirmed farmer questions, inspect their media, and reply to make useful answers public."
        compact
      />
      <DataTable
        columns={columns}
        data={queries}
        searchPlaceholder="Search farmer, crop, problem..."
        emptyMessage={isLoading ? 'Loading pending queries...' : 'No pending queries found.'}
        filterSlot={filterSlot}
        onRowClick={(row) => navigate(`/expert/queries/${row.id}`)}
      />
    </div>
  )
}

export function ExpertHistoryPage() {
  const navigate = useNavigate()
  const { data: replies = [], isLoading } = useStaffMyReplies({ page: 1, limit: 100 })

  const columns = useMemo(
    () => [
      { header: 'Crop', accessorKey: 'cropName', cell: ({ row }) => row.original.cropName || '-' },
      { header: 'Asked by', accessorKey: 'askedBy', cell: ({ row }) => row.original.askedBy || '-' },
      {
        header: 'Farmer query',
        accessorKey: 'queryText',
        cell: ({ row }) => <p className="max-w-sm truncate">{row.original.queryText}</p>,
      },
      {
        header: 'Your reply',
        accessorKey: 'replyText',
        cell: ({ row }) => <p className="max-w-sm truncate">{row.original.replyText}</p>,
      },
      { header: 'Status', accessorKey: 'queryStatus', cell: ({ row }) => <StatusBadge value={row.original.queryStatus} /> },
      { header: 'Replied', accessorKey: 'repliedAt', cell: ({ row }) => formatDate(row.original.repliedAt, 'DD MMM YYYY') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/expert/queries/${row.original.queryId}`)
            }}
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        ),
      },
    ],
    [navigate],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Advisory archive"
        title="My replies"
        description="See every answer you have submitted and the current status of each farmer query."
        compact
      />
      <DataTable
        columns={columns}
        data={replies}
        searchPlaceholder="Search replies, crops, farmers..."
        emptyMessage={isLoading ? 'Loading your replies...' : 'No replies submitted yet.'}
      />
    </div>
  )
}

export function ExpertQueryDetailPage() {
  const { id } = useParams()
  const { data: query, isLoading } = useQueryDetail(id)
  const mutation = useQueryReplyMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(replySchema),
    defaultValues: {
      reply_text: '',
      files: undefined,
    },
  })

  const onSubmit = async (values) => {
    const files = fileListToArray(values.files)

    if (files.length > 3) {
      toast.error('Upload up to 3 reply media files.')
      return
    }

    if (!files.every(isValidReplyFile)) {
      toast.error('Use JPEG, JPG, PNG, or MP4 files up to 50MB each.')
      return
    }

    try {
      await mutation.mutateAsync({
        id,
        payload: {
          reply_text: values.reply_text.trim(),
          files,
        },
      })
      toast.success('Reply submitted. The query will be public once confirmed by the backend.')
      reset()
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to submit reply.')
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading query detail...</p>
  }

  if (!query) {
    return <p className="text-sm text-slate-500">Query not found.</p>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Case review"
        title={`${query.cropName || 'Crop'} - ${query.askedBy || 'Farmer query'}`}
        description={query.queryText}
        compact
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <QuerySummary query={query} />

          <WorkflowTimeline
            title="Query lifecycle"
            description="Backend status changes from farmer submission to public confirmed answer."
            activeStep={statusStepMap[query.status] ?? 1}
            steps={[
              'Query Raised',
              'Pending Review',
              'Staff Reply',
              'Confirmed Public',
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle>Farmer uploads</CardTitle>
              <CardDescription>Images and videos attached while raising this query.</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGrid media={query.media || query.media_url || []} title="Query media" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reply to query</CardTitle>
              <CardDescription>Employee, expert, and admin replies can confirm pending queries for the public feed.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <Field label="Reply" error={errors.reply_text?.message}>
                  <Textarea rows={6} placeholder="Write diagnosis, treatment, dosage, and follow-up steps." {...register('reply_text')} />
                </Field>
                <Field label="Attach media" hint="Optional. Upload up to 3 JPEG, JPG, PNG, or MP4 files." error={errors.files?.message}>
                  <Input type="file" multiple accept="image/jpeg,image/png,image/jpg,video/mp4" {...register('files')} />
                </Field>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit reply
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Replies</CardTitle>
              <CardDescription>{query.replies?.length || 0} responses on this query.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {query.replies?.length ? (
                query.replies.map((reply) => (
                  <div key={reply.id} className="rounded-2xl border border-border bg-slate-50/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-dark">{reply.repliedBy || 'Responder'}</p>
                          <p className="text-xs text-slate-500">
                            {reply.responderType || 'Staff'} - {formatDate(reply.createdAt, 'DD MMM - hh:mm A')}
                          </p>
                        </div>
                      </div>
                      <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{reply.replyText}</p>
                    {reply.media?.length ? (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          <Paperclip className="h-3.5 w-3.5" />
                          Reply media
                        </div>
                        <MediaGrid media={reply.media} title="Reply media" />
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No replies yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
