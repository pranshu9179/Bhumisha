import { CheckCircle2, CircleDashed } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function WorkflowTimeline({ title, description, steps = [], activeStep }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const isDone = index < activeStep
          const isActive = index === activeStep

          return (
            <div key={step} className="relative flex items-start gap-4">
              {index < steps.length - 1 ? (
                <span className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-slate-200" />
              ) : null}
              <div
                className={cn(
                  'relative z-10 rounded-full p-1',
                  isDone ? 'bg-success/10 text-success' : isActive ? 'bg-accent/15 text-accent' : 'bg-slate-100 text-slate-400',
                )}
              >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}
              </div>
              <div className="space-y-1 pb-4">
                <p className={cn('font-semibold', isActive ? 'text-dark' : 'text-slate-600')}>{step}</p>
                <p className="text-sm text-slate-500">
                  {isActive ? 'Current stage in the workflow.' : isDone ? 'Completed stage with audit trail.' : 'Upcoming handoff stage.'}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
