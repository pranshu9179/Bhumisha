import { Menu, Search, Store } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { BreadcrumbTrail } from '@/components/app-shell/breadcrumb-trail'
import { ProfileMenu } from '@/components/app-shell/profile-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { navigationByRole } from '@/config/navigation'
import { ROLES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { setMobileSidebarOpen } from '@/store/ui-slice'

export function Topbar({ role }) {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const searchableItems = useMemo(
    () =>
      (navigationByRole[role] || [])
        .flatMap((section) => section.items)
        .filter((item) => item.title.toLowerCase().includes(search.toLowerCase())),
    [role, search],
  )

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-white/60 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="md:hidden"
              onClick={() => dispatch(setMobileSidebarOpen(true))}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <BreadcrumbTrail role={role} />
          </div>
          {/* <p className="text-sm text-slate-500">
            Responsive enterprise workspace designed for operations, advisory, and commerce teams.
          </p> */}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {role === ROLES.USER ? (
            <Button asChild>
              <Link to="/user/become-vendor">
                <Store className="h-4 w-4" />
                Become a vendor
              </Link>
            </Button>
          ) : null}

          <div className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search modules, dashboards, workflows..."
              className="pl-9"
            />
            {search ? (
              <div
                className={cn(
                  'absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-2xl border border-white/70 bg-white p-2 shadow-2xl',
                  searchableItems.length ? 'block' : 'hidden',
                )}
              >
                {searchableItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSearch('')}
                    className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-dark"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}
