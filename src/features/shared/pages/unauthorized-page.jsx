import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-xl p-6">
        <CardContent className="space-y-6 p-0 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-dark">Access restricted</h1>
            <p className="text-slate-500">
              Your current role does not have permission to view this workspace route.
            </p>
          </div>
          <Button asChild>
            <Link to="/">Return to your dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
