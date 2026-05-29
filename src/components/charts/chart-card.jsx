import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ChartCard({ title, description, children, action }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
