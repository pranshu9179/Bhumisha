import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-xl p-6">
        <CardContent className="space-y-6 p-0 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-dark">Page not found</h1>
            <p className="text-slate-500">
              The route you requested does not exist in this demo workspace.
            </p>
          </div>
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
