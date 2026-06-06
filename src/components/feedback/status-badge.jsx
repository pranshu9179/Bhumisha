import { Badge } from '@/components/ui/badge'

const map = {
  active: 'success',
  approved: 'success',
  published: 'success',
  delivered: 'success',
  paid: 'success',
  closed: 'success',
  open: 'warning',
  pending: 'warning',
  under_review: 'warning',
  processing: 'warning',
  assigned: 'warning',
  review: 'warning',
  recommended: 'default',
  draft: 'slate',
  inactive: 'slate',
  created: 'slate',
  in_review: 'default',
  in_follow_up: 'default',
  watching: 'default',
  pending_review: 'warning',
  escalated: 'danger',
  critical: 'danger',
  deleted: 'danger',
}

export function StatusBadge({ value }) {
  const label = String(value || '-').replace(/[_-]/g, ' ')
  return <Badge variant={map[value] || 'default'}>{label}</Badge>
}
