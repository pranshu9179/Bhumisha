import { useMemo } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/features/shared/components/page-header'
import { useEscalations, useSupportCases, useTasks, useUsers } from '@/services/api/hooks'

export default function EmployeeReportsPage() {
  const { data: tasks = [] } = useTasks()
  const { data: cases = [] } = useSupportCases()
  const { data: escalations = [] } = useEscalations()
  const { data: employees = [] } = useUsers({ role: 'employee' })

  const workload = useMemo(
    () =>
      employees.map((employee) => ({
        employee: employee.name,
        tasks: tasks.filter((task) => task.ownerId === employee.id).length,
        cases: cases.filter((item) => item.ownerId === employee.id).length,
        escalations: escalations.filter((item) => item.assignedEmployeeId === employee.id).length,
      })),
    [cases, employees, escalations, tasks],
  )

  const columns = useMemo(
    () => [
      { header: 'Employee', accessorKey: 'employee' },
      { header: 'Tasks', accessorKey: 'tasks' },
      { header: 'Support cases', accessorKey: 'cases' },
      { header: 'Escalations', accessorKey: 'escalations' },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations reporting"
        title="Employee workload reports"
        description="Summarize support tasks, vendor cases, and escalations handled by the employee team."
        compact
      />
      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={workload} searchPlaceholder="Search employee reports" />
        </CardContent>
      </Card>
    </div>
  )
}
