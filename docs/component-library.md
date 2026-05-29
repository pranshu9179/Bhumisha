# Component Library

## UI Primitives
- `Button`
- `Card`
- `Badge`
- `Input`
- `Textarea`
- `Label`
- `NativeSelect`
- `Avatar`
- `Dialog`
- `DropdownMenu`
- `Tabs`
- `Separator`
- `ScrollArea`
- `Table`
- `Skeleton`

## App Shell
- `AppSidebar`
- `Topbar`
- `BreadcrumbTrail`
- `NotificationPanel`
- `ProfileMenu`

## Data + Feedback
- `DataTable`
- `StatusBadge`
- `EmptyState`

## Dashboard Components
- `StatCard`
- `ChartCard`
- `PageHeader`
- `ActivityFeed`
- `WorkflowTimeline`

## Form Helpers
- `Field`
- Auth cards and demo credentials blocks

## Intended Reuse
- All role dashboards should compose from `PageHeader`, `StatCard`, `ChartCard`, and `DataTable`.
- Any future role/module should plug into the same shell without custom navigation or layout logic.
