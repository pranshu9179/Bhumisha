import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { ChartCard } from '@/components/charts/chart-card'
import { StatCard } from '@/components/charts/stat-card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/shared/components/page-header'
import { WorkflowTimeline } from '@/features/shared/components/workflow-timeline'
import { useStaffMyReplies, useStaffPendingQueries } from '@/services/api/hooks'

export default function ExpertDashboardPage() {
  const { data: pendingQueries = [] } = useStaffPendingQueries({ page: 1, limit: 100 })
  const { data: myReplies = [] } = useStaffMyReplies({ page: 1, limit: 100 })

  const statusSeries = [
    { label: 'Pending', value: pendingQueries.length },
    { label: 'With media', value: pendingQueries.filter((item) => item.media?.length).length },
    { label: 'Answered', value: myReplies.length },
    { label: 'Confirmed', value: myReplies.filter((item) => item.queryStatus === 'confirmed').length },
  ]

  const widgets = [
    { label: 'Pending queries', value: pendingQueries.length, delta: 'From /queries/staff/pending' },
    { label: 'Queries with media', value: pendingQueries.filter((item) => item.media?.length).length, delta: 'Need inspection' },
    { label: 'My replies', value: myReplies.length, delta: 'From /queries/staff/my-replies' },
    { label: 'Confirmed answers', value: myReplies.filter((item) => item.queryStatus === 'confirmed').length, delta: 'Public feed' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Expert workspace"
        title="Query review dashboard"
        description="Data is sourced from documented query endpoints only."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/expert/history">History</Link>
            </Button>
            <Button asChild>
              <Link to="/expert/queries">Open queries</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {widgets.map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} accent={index % 2 === 0 ? 'primary' : 'accent'} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Query workload" description="Current pending queries and submitted replies.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusSeries}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#166534" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <WorkflowTimeline
          title="Advisory flow"
          description="Backend query flow from farmer submission to public answer."
          activeStep={pendingQueries.length ? 1 : 3}
          steps={['Query Raised', 'Pending Review', 'Staff Reply', 'Confirmed Public']}
        />
      </div>
    </div>
  )
}
