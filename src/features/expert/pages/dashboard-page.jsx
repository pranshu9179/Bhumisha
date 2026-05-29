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
import { useCurrentUser } from '@/hooks/use-current-user'
import { useAnalytics, useAuditLogs, useQueries } from '@/services/api/hooks'

export default function ExpertDashboardPage() {
  const user = useCurrentUser()
  const { data: analytics } = useAnalytics('expert')
  const { data: auditLogs = [] } = useAuditLogs()
  const { data: assignedQueries = [] } = useQueries({ assignedExpertId: user?.id })

  const statusSeries = [
    { label: 'Assigned', value: assignedQueries.filter((item) => item.status === 'assigned').length },
    { label: 'Review', value: assignedQueries.filter((item) => item.status === 'review').length },
    { label: 'Escalated', value: assignedQueries.filter((item) => item.status === 'escalated').length },
    { label: 'Closed', value: assignedQueries.filter((item) => item.status === 'closed').length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Expert workspace"
        title="Focused advisory decisions with context, SLAs, and product recommendations."
        description="Stay on top of assigned farmer queries, review case details, and close recommendations with product-linked guidance."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/expert/history">View history</Link>
            </Button>
            <Button asChild>
              <Link to="/expert/queries">Open assigned queries</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics?.widgets?.map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} accent={index % 2 === 0 ? 'primary' : 'accent'} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Assigned workload" description="Current distribution of cases by advisory stage.">
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
          description="Expert-facing stages from assignment to closure."
          activeStep={3}
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

      <ActivityFeed
        items={auditLogs.filter((item) => item.channel === 'advisory').slice(0, 4)}
        title="Advisory activity"
        description="Recent recommendation submissions and case updates."
      />
    </div>
  )
}
