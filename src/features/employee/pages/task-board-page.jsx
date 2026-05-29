import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/features/shared/components/page-header'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useTaskUpdateMutation, useTasks } from '@/services/api/hooks'

const columns = [
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
]

export default function EmployeeTaskBoardPage() {
  const user = useCurrentUser()
  const { data: tasks = [] } = useTasks({ ownerId: user?.id })
  const mutation = useTaskUpdateMutation()

  const moveTask = async (task, nextStage) => {
    await mutation.mutateAsync({
      id: task.id,
      payload: { stage: nextStage },
    })
    toast.success(`Task moved to ${nextStage.replace('_', ' ')}.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Execution board"
        title="Task board"
        description="Coordinate follow-up tasks across delays, vendor issues, and order interventions."
        compact
      />
      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <Card key={column.key}>
            <CardHeader>
              <CardTitle>{column.label}</CardTitle>
              <CardDescription>{tasks.filter((task) => task.stage === column.key).length} tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks
                .filter((task) => task.stage === column.key)
                .map((task) => (
                  <div key={task.id} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="font-semibold text-dark">{task.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{task.priority}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {columns
                        .filter((item) => item.key !== column.key)
                        .slice(0, 2)
                        .map((item) => (
                          <Button
                            key={item.key}
                            size="sm"
                            variant="secondary"
                            onClick={() => moveTask(task, item.key)}
                          >
                            Move to {item.label}
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
