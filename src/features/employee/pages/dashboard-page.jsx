import { Link } from 'react-router-dom'
import { StatCard } from '@/components/charts/stat-card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/shared/components/page-header'
import { WorkflowTimeline } from '@/features/shared/components/workflow-timeline'
import { useStaffMyReplies, useStaffPendingQueries, useUsers } from '@/services/api/hooks'

export default function EmployeeDashboardPage() {
  const { data: users = [] } = useUsers({ page: 1, limit: 100 })
  const { data: pendingQueries = [] } = useStaffPendingQueries({ page: 1, limit: 100 })
  const { data: replies = [] } = useStaffMyReplies({ page: 1, limit: 100 })

  const widgets = [
    { label: 'Users', value: users.length, delta: 'From /users' },
    { label: 'Pending queries', value: pendingQueries.length, delta: 'From /queries/staff/pending' },
    { label: 'Staff replies', value: replies.length, delta: 'From /queries/staff/my-replies' },
    { label: 'Media cases', value: pendingQueries.filter((item) => item.media?.length).length, delta: 'Need review' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations workspace"
        title="Documented support overview"
        description="Employee dashboard uses only user and query endpoints from the API document."
        actions={
          <Button asChild>
            <Link to="/employee/monitoring">Open monitoring</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {widgets.map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} accent={index % 2 === 0 ? 'primary' : 'accent'} />
        ))}
      </div>
      <WorkflowTimeline
        title="Query handling flow"
        description="Documented employee-visible query flow."
        activeStep={2}
        steps={['Pending Query', 'Review Details', 'Submit Reply', 'Public Feed']}
      />
    </div>
  )
}
