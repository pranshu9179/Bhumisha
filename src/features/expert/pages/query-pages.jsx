/* eslint-disable react-hooks/incompatible-library */
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { WorkflowTimeline } from '@/features/shared/components/workflow-timeline'
import { formatDate } from '@/lib/format'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useProducts, useQueries, useQueryDeleteMutation, useQueryDetail, useRecommendationSaveMutation } from '@/services/api/hooks'

const recommendationSchema = z.object({
  summary: z.string().min(10, 'Add a concise recommendation summary'),
  actions: z.string().min(20, 'Describe the treatment or action plan'),
  suggestedProductIds: z.array(z.string()).min(1, 'Select at least one suggested product'),
})

const statusStepMap = {
  created: 0,
  assigned: 1,
  review: 2,
  recommended: 3,
  closed: 5,
  escalated: 2,
}

export function ExpertQueriesPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const { data: queries = [] } = useQueries({ assignedExpertId: user?.id })
  const deleteMutation = useQueryDeleteMutation()

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
              description="Assigned query metadata for expert review."
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
              View
            </Button>
            <DeleteActionButton
              confirmMessage={`Delete the query for ${row.original.farmerName} from your assigned queue?`}
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Expert queue"
        title="Assigned queries"
        description="Review active advisory cases and jump straight into detailed diagnosis and recommendation drafting."
        compact
      />
      <DataTable
        columns={columns}
        data={queries.filter((item) => item.status !== 'closed')}
        searchPlaceholder="Search farmer, crop, issue..."
        onRowClick={(row) => navigate(`/expert/queries/${row.id}`)}
      />
    </div>
  )
}

export function ExpertHistoryPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const { data: queries = [] } = useQueries({ assignedExpertId: user?.id })
  const deleteMutation = useQueryDeleteMutation()

  const columns = useMemo(
    () => [
      { header: 'Farmer', accessorKey: 'farmerName' },
      { header: 'Crop', accessorKey: 'crop' },
      { header: 'Issue', accessorKey: 'issueType' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      { header: 'Completed', accessorKey: 'createdAt', cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM YYYY') },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.farmerName} history`}
              description="Completed advisory case details."
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
              View
            </Button>
            <DeleteActionButton
              confirmMessage={`Delete the history item for ${row.original.farmerName}?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('History item deleted successfully.'))
              }
            />
          </div>
        ),
      },
    ],
    [deleteMutation, navigate],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Advisory archive"
        title="Recommendation history"
        description="Review past query outcomes and previously submitted suggestion sets."
        compact
      />
      <DataTable
        columns={columns}
        data={queries.filter((item) => ['closed', 'recommended'].includes(item.status))}
        searchPlaceholder="Search closed recommendations"
      />
    </div>
  )
}

export function ExpertQueryDetailPage() {
  const { id } = useParams()
  const user = useCurrentUser()
  const { data: query } = useQueryDetail(id)
  const { data: products = [] } = useProducts({ status: 'published' })
  const mutation = useRecommendationSaveMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      summary: query?.recommendation?.summary || '',
      actions: query?.recommendation?.actions || '',
      suggestedProductIds: query?.recommendation?.suggestedProductIds || [],
    },
  })

  useEffect(() => {
    if (query) {
      reset({
        summary: query.recommendation?.summary || '',
        actions: query.recommendation?.actions || '',
        suggestedProductIds: query.recommendation?.suggestedProductIds || [],
      })
    }
  }, [query, reset])

  const selectedProducts = watch('suggestedProductIds') || []

  const toggleProduct = (productId) => {
    const current = selectedProducts.includes(productId)
      ? selectedProducts.filter((item) => item !== productId)
      : [...selectedProducts, productId]
    setValue('suggestedProductIds', current, { shouldValidate: true })
  }

  const onSubmit = async (values) => {
    await mutation.mutateAsync({
      queryId: query.id,
      expertId: user.id,
      ...values,
    })
    toast.success('Recommendation submitted and query closed.')
  }

  if (!query) {
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Case review"
        title={`${query.farmerName} · ${query.crop}`}
        description={`${query.issueType} reported from ${query.district}. Use the timeline, case notes, and suggested product library to close the recommendation.`}
        compact
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case snapshot</CardTitle>
              <CardDescription>Current advisory metadata and SLA context.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Info label="Farmer" value={query.farmerName} />
              <Info label="Crop" value={query.crop} />
              <Info label="Issue type" value={query.issueType} />
              <Info label="Priority" value={<StatusBadge value={query.priority} />} />
              <Info label="Status" value={<StatusBadge value={query.status} />} />
              <Info label="Created" value={formatDate(query.createdAt, 'DD MMM · hh:mm A')} />
            </CardContent>
          </Card>

          <WorkflowTimeline
            title="Query lifecycle"
            description="This case follows the standard expert recommendation workflow."
            activeStep={statusStepMap[query.status] ?? 1}
            steps={[
              'Create Query',
              'Assign Expert',
              'Expert Review',
              'Recommendation',
              'Submit',
              'Close',
            ]}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommendation composer</CardTitle>
            <CardDescription>Draft the final response and link marketplace products to the treatment plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <Field label="Recommendation summary" error={errors.summary?.message}>
                <Input
                  placeholder="Example: restore soil balance and irrigate before next fertilizer cycle"
                  {...register('summary')}
                />
              </Field>
              <Field label="Detailed actions" error={errors.actions?.message}>
                <Textarea
                  placeholder="Capture field actions, dosage guidance, monitoring steps, and follow-up expectations."
                  {...register('actions')}
                />
              </Field>
              <Field
                label="Suggested products"
                hint="Select products that reinforce the advisory plan and are already published in the marketplace."
                error={errors.suggestedProductIds?.message}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.slice(0, 6).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedProducts.includes(product.id)
                          ? 'border-primary bg-primary/6'
                          : 'border-slate-200 bg-slate-50/80 hover:border-primary/30'
                      }`}
                    >
                      <p className="font-semibold text-dark">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.recommendedFor?.join(', ')}</p>
                    </button>
                  ))}
                </div>
              </Field>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Submitting...' : 'Submit recommendation'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/75 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-2 text-sm font-semibold text-dark">{value}</div>
    </div>
  )
}
