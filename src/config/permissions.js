import { ROLES } from '@/lib/constants'

export const rolePermissions = {
  [ROLES.ADMIN]: [
    'analytics:view',
    'audit:view',
    'categories:manage',
    'employees:view',
    'escalations:manage',
    'experts:view',
    'orders:view',
    'products:manage',
    'reports:view',
    'settings:manage',
    'users:manage',
    'vendors:verify',
  ],
  [ROLES.EXPERT]: [
    'history:view',
    'notifications:view',
    'products:suggest',
    'queries:review',
    'recommendations:submit',
  ],
  [ROLES.EMPLOYEE]: [
    'monitoring:view',
    'reports:view',
    'tasks:manage',
    'vendor-support:manage',
  ],
  [ROLES.VENDOR]: [
    'dispatch:manage',
    'inventory:manage',
    'orders:view',
    'products:manage',
    'reports:view',
  ],
}

export function hasPermission(role, permission) {
  return rolePermissions[role]?.includes(permission) ?? false
}
