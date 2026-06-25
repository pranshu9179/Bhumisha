import { CreditCard, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/features/shared/components/page-header'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function UserDashboardPage() {
  const user = useCurrentUser()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Farmer workspace"
        title={`Welcome${user?.name ? `, ${user.name}` : ''}`}
        description="Manage your farmer account and register a vendor profile when you are ready to sell products or services."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/user/checkout">
                <CreditCard className="h-4 w-4" />
                Checkout
              </Link>
            </Button>
            <Button asChild>
              <Link to="/user/become-vendor">
                <Store className="h-4 w-4" />
                Become a vendor
              </Link>
            </Button>
          </>
        }
        compact
      />
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <Info label="Role" value="User" />
          <Info label="Phone" value={user?.phone || '-'} />
          <Info label="Status" value={user?.status || 'active'} />
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/75 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-dark">{value}</p>
    </div>
  )
}
