import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthCard({ title, description, children, footer }) {
  return (
    <Card className="overflow-hidden rounded-[32px] border-white/60 bg-white/90">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        {footer}
      </CardContent>
    </Card>
  )
}
