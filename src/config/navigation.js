import {
  Activity,
  AlertTriangle,
  BadgeIndianRupee,
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  FileBarChart2,
  FileSearch,
  History,
  KanbanSquare,
  LayoutDashboard,
  LifeBuoy,
  PackagePlus,
  ReceiptText,
  ScanSearch,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCheck,
  UserRoundCog,
  Users,
  Warehouse,
} from 'lucide-react'
import { ROLES } from '@/lib/constants'

export const navigationByRole = {
  [ROLES.ADMIN]: [
    {
      group: 'Overview',
      items: [
        {
          title: 'Dashboard',
          description: 'Cross-role metrics, alerts, and marketplace health.',
          path: '/admin',
          icon: LayoutDashboard,
        },
        {
          title: 'Analytics',
          description: 'Executive trend analysis and revenue insights.',
          path: '/admin/analytics',
          icon: BarChart3,
        },
        {
          title: 'Reports',
          description: 'Operational snapshots and export-ready summaries.',
          path: '/admin/reports',
          icon: FileBarChart2,
        },
      ],
    },
    {
      group: 'Operations',
      items: [
        { title: 'Users', description: 'Manage all platform users.', path: '/admin/users', icon: Users },
        { title: 'Experts', description: 'Track expert utilization.', path: '/admin/experts', icon: UserCheck },
        { title: 'Employees', description: 'Coordinate support staff.', path: '/admin/employees', icon: UserRoundCog },
        {
          title: 'Vendor Verification',
          description: 'Approve or reject marketplace vendors.',
          path: '/admin/vendors',
          icon: ShieldCheck,
        },
        { title: 'Products', description: 'Catalog, pricing, and stock governance.', path: '/admin/products', icon: Boxes },
        { title: 'Categories', description: 'Taxonomy and merchandising structure.', path: '/admin/categories', icon: ScanSearch },
        { title: 'Orders', description: 'Order flow and commerce status.', path: '/admin/orders', icon: ShoppingCart },
        {
          title: 'Escalations',
          description: 'SLA breaches, reassignment, and follow-up.',
          path: '/admin/escalations',
          icon: AlertTriangle,
        },
      ],
    },
    {
      group: 'Control',
      items: [
        { title: 'Audit Logs', description: 'Activity trace and governance.', path: '/admin/audit-logs', icon: ReceiptText },
        { title: 'Settings', description: 'Platform preferences and workflow controls.', path: '/admin/settings', icon: Settings },
      ],
    },
  ],
  [ROLES.EXPERT]: [
    {
      group: 'Workspace',
      items: [
        { title: 'Dashboard', description: 'Assigned workload and response performance.', path: '/expert', icon: LayoutDashboard },
        { title: 'Assigned Queries', description: 'Live advisory queue for expert handling.', path: '/expert/queries', icon: ClipboardList },
        { title: 'Suggested Products', description: 'Products mapped to recommendations.', path: '/expert/products', icon: PackagePlus },
        { title: 'History', description: 'Closed and previously handled cases.', path: '/expert/history', icon: History },
        { title: 'Notifications', description: 'Recent updates and reassignment alerts.', path: '/expert/notifications', icon: Bell },
      ],
    },
  ],
  [ROLES.EMPLOYEE]: [
    {
      group: 'Coordination',
      items: [
        { title: 'Dashboard', description: 'Open support load and SLA health.', path: '/employee', icon: LayoutDashboard },
        { title: 'Task Board', description: 'Kanban view of operational follow-ups.', path: '/employee/tasks', icon: KanbanSquare },
        { title: 'Monitoring', description: 'Delayed query detection and control tower.', path: '/employee/monitoring', icon: Activity },
        { title: 'Vendor Support', description: 'Resolve onboarding and order help cases.', path: '/employee/vendor-support', icon: LifeBuoy },
        { title: 'Reports', description: 'Team throughput and issue themes.', path: '/employee/reports', icon: FileSearch },
      ],
    },
  ],
  [ROLES.VENDOR]: [
    {
      group: 'Commerce',
      items: [
        { title: 'Dashboard', description: 'Store performance, dispatch health, and stock alerts.', path: '/vendor', icon: LayoutDashboard },
        { title: 'Products', description: 'Published catalog and product controls.', path: '/vendor/products', icon: Boxes },
        { title: 'Add Product', description: 'Create a new listing in the marketplace.', path: '/vendor/products/new', icon: PackagePlus },
        { title: 'Inventory', description: 'Stock depth and replenishment planning.', path: '/vendor/inventory', icon: Warehouse },
        { title: 'Orders', description: 'Incoming orders and fulfillment updates.', path: '/vendor/orders', icon: ShoppingCart },
        { title: 'Dispatch', description: 'Shipment pipeline and delivery status.', path: '/vendor/dispatch', icon: Truck },
        { title: 'Reports', description: 'Revenue, SKUs, and conversion insights.', path: '/vendor/reports', icon: BadgeIndianRupee },
      ],
    },
  ],
}

export const utilityRoutes = [
  {
    title: 'Query Detail',
    path: '/expert/queries/:id',
    description: 'Detailed expert review and recommendation composer.',
  },
  {
    title: 'Edit Product',
    path: '/vendor/products/:id/edit',
    description: 'Update product content, price, and stock strategy.',
  },
]

export function getFlatNavigation(role) {
  return navigationByRole[role]?.flatMap((section) => section.items) ?? []
}
