import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getFlatNavigation } from '@/config/navigation'
import { sentenceCase } from '@/lib/format'

export function BreadcrumbTrail({ role }) {
  const { pathname } = useLocation()
  const items = getFlatNavigation(role)
  const pathParts = pathname.split('/').filter(Boolean)
  const breadcrumbs = pathParts.map((part, index) => {
    const href = `/${pathParts.slice(0, index + 1).join('/')}`
    const match = items.find((item) => item.path === href)
    return {
      href,
      label: match?.title || sentenceCase(part),
    }
  })

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Home className="h-4 w-4" />
      {breadcrumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <Link to={crumb.href} className="transition hover:text-dark">
            {crumb.label}
          </Link>
        </span>
      ))}
    </div>
  )
}
