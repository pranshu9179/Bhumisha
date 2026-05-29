import { Link } from 'react-router-dom'
import { StatCard } from '@/components/charts/stat-card'
import { Button } from '@/components/ui/button'
import { ActivityFeed } from '@/features/shared/components/activity-feed'
import { PageHeader } from '@/features/shared/components/page-header'
import { WorkflowTimeline } from '@/features/shared/components/workflow-timeline'
import { useAnalytics, useAuditLogs } from '@/services/api/hooks'

export default function EmployeeDashboardPage() {
  const { data: analytics } = useAnalytics('employee')
  const { data: auditLogs = [] } = useAuditLogs()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations workspace"
        title="Field support coordination for delays, vendors, and follow-up loops."
        description="Employees manage cross-role interventions, SLA breaches, and vendor support handoffs in one queue-friendly workspace."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/employee/vendor-support">Vendor support</Link>
            </Button>
            <Button asChild>
              <Link to="/employee/tasks">Open task board</Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics?.widgets?.map((item, index) => (
          <StatCard key={item.label} label={item.label} value={item.value} delta={item.delta} accent={index % 2 === 0 ? 'primary' : 'accent'} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <WorkflowTimeline
          title="Escalation operating rhythm"
          description="How employees step in once advisory workflows risk breaching SLA."
          activeStep={4}
          steps={[
            'Assign Query',
            'Start Timer',
            'Delay > 2 Hours',
            'Notify Admin',
            'Reassign',
            'Employee Follow-up',
          ]}
        />
        <ActivityFeed
          items={auditLogs.filter((item) => item.channel === 'operations').slice(0, 4)}
          title="Operations highlights"
          description="Latest interventions and monitoring actions."
        />
      </div>
    </div>
  )
}
