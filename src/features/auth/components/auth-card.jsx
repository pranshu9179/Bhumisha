import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthCard({ title, description, children, footer }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-2xl shadow-slate-950/10">
      <CardHeader className="pb-4 pt-7">
        <CardTitle className="text-3xl font-semibold tracking-normal text-dark">{title}</CardTitle>
        {description ? <CardDescription className="max-w-md leading-6 text-slate-500">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6 px-7 pb-7">
        {children}
        {footer ? <div className="border-t border-slate-100 pt-5">{footer}</div> : null}
      </CardContent>
    </Card>
  )
}
