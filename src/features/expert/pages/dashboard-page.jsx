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
import { ActivityFeed } from '@/features/shared/components/activity-feed'
import { PageHeader } from '@/features/shared/components/page-header'
import { WorkflowTimeline } from '@/features/shared/components/workflow-timeline'
import { useAnalytics, useAuditLogs, useStaffMyReplies, useStaffPendingQueries } from '@/services/api/hooks'

export default function ExpertDashboardPage() {
  const { data: analytics } = useAnalytics('expert')
  const { data: auditLogs = [] } = useAuditLogs()
  const { data: pendingQueries = [] } = useStaffPendingQueries({ page: 1, limit: 100 })
  const { data: myReplies = [] } = useStaffMyReplies({ page: 1, limit: 100 })

  const statusSeries = [
    { label: 'Pending', value: pendingQueries.length },
    { label: 'With media', value: pendingQueries.filter((item) => item.media?.length).length },
    { label: 'Answered', value: myReplies.length },
    { label: 'Confirmed', value: myReplies.filter((item) => item.queryStatus === 'confirmed').length },
  ]

  const widgets = [
    { label: 'Pending queries', value: pendingQueries.length, delta: 'Live queue' },
    { label: 'Queries with media', value: pendingQueries.filter((item) => item.media?.length).length, delta: 'Need inspection' },
    { label: 'My replies', value: myReplies.length, delta: 'Submitted' },
    { label: 'Confirmed answers', value: myReplies.filter((item) => item.queryStatus === 'confirmed').length, delta: 'Public feed' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Expert workspace"
        title="Focused farmer query review with media, replies, and confirmed public answers."
        description="Stay on top of pending farmer problems, inspect uploaded images or videos, and submit practical replies from one workspace."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/expert/history">View history</Link>
            </Button>
            <Button asChild>
              <Link to="/expert/queries">Open pending queries</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(pendingQueries.length || myReplies.length ? widgets : analytics?.widgets || widgets).map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} accent={index % 2 === 0 ? 'primary' : 'accent'} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Query workload" description="Current pending queries and your submitted reply footprint.">
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
          description="Backend query flow from farmer submission to public confirmed answer."
          activeStep={pendingQueries.length ? 1 : 3}
          steps={[
            'Query Raised',
            'Pending Review',
            'Staff Reply',
            'Confirmed Public',
          ]}
        />
      </div>

      <ActivityFeed
        items={auditLogs.filter((item) => ['advisory', 'queries'].includes(item.channel)).slice(0, 4)}
        title="Advisory activity"
        description="Recent query replies, confirmations, and case updates."
      />
    </div>
  )
}
