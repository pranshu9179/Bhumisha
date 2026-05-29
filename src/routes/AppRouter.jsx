import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { AuthLayout } from '@/layouts/auth-layout'
import { AppLayout } from '@/layouts/app-layout'
import { ProtectedRoute } from '@/routes/protected-route'
import { RoleHomeRedirect } from '@/routes/role-home-redirect'

const LoginPage = lazy(() => import('@/features/auth/pages/login-page'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/forgot-password-page'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/reset-password-page'))
const UnauthorizedPage = lazy(() => import('@/features/shared/pages/unauthorized-page'))
const NotFoundPage = lazy(() => import('@/features/shared/pages/not-found-page'))

const AdminDashboardPage = lazy(() => import('@/features/admin/pages/dashboard-page'))
const UsersPage = lazy(() => import('@/features/admin/pages/people-pages').then((module) => ({ default: module.UsersPage })))
const ExpertsPage = lazy(() => import('@/features/admin/pages/people-pages').then((module) => ({ default: module.ExpertsPage })))
const EmployeesPage = lazy(() => import('@/features/admin/pages/people-pages').then((module) => ({ default: module.EmployeesPage })))
const VendorsPage = lazy(() => import('@/features/admin/pages/people-pages').then((module) => ({ default: module.VendorsPage })))
const AdminProductsPage = lazy(() => import('@/features/admin/pages/catalog-pages').then((module) => ({ default: module.AdminProductsPage })))
const CategoriesPage = lazy(() => import('@/features/admin/pages/catalog-pages').then((module) => ({ default: module.CategoriesPage })))
const OrdersPage = lazy(() => import('@/features/admin/pages/operations-pages').then((module) => ({ default: module.OrdersPage })))
const EscalationsPage = lazy(() => import('@/features/admin/pages/operations-pages').then((module) => ({ default: module.EscalationsPage })))
const AuditLogsPage = lazy(() => import('@/features/admin/pages/operations-pages').then((module) => ({ default: module.AuditLogsPage })))
const AnalyticsPage = lazy(() => import('@/features/admin/pages/insights-pages').then((module) => ({ default: module.AnalyticsPage })))
const ReportsPage = lazy(() => import('@/features/admin/pages/insights-pages').then((module) => ({ default: module.ReportsPage })))
const SettingsPage = lazy(() => import('@/features/admin/pages/insights-pages').then((module) => ({ default: module.SettingsPage })))

const ExpertDashboardPage = lazy(() => import('@/features/expert/pages/dashboard-page'))
const ExpertQueriesPage = lazy(() => import('@/features/expert/pages/query-pages').then((module) => ({ default: module.ExpertQueriesPage })))
const ExpertQueryDetailPage = lazy(() => import('@/features/expert/pages/query-pages').then((module) => ({ default: module.ExpertQueryDetailPage })))
const ExpertHistoryPage = lazy(() => import('@/features/expert/pages/query-pages').then((module) => ({ default: module.ExpertHistoryPage })))
const ExpertProductsPage = lazy(() => import('@/features/expert/pages/support-pages').then((module) => ({ default: module.ExpertProductsPage })))
const ExpertNotificationsPage = lazy(() => import('@/features/expert/pages/support-pages').then((module) => ({ default: module.ExpertNotificationsPage })))

const EmployeeDashboardPage = lazy(() => import('@/features/employee/pages/dashboard-page'))
const EmployeeTaskBoardPage = lazy(() => import('@/features/employee/pages/task-board-page'))
const EmployeeMonitoringPage = lazy(() => import('@/features/employee/pages/monitoring-page'))
const EmployeeVendorSupportPage = lazy(() => import('@/features/employee/pages/vendor-support-page'))
const EmployeeReportsPage = lazy(() => import('@/features/employee/pages/reports-page'))

const VendorDashboardPage = lazy(() => import('@/features/vendor/pages/dashboard-page'))
const VendorProductsPage = lazy(() => import('@/features/vendor/pages/catalog-pages').then((module) => ({ default: module.VendorProductsPage })))
const VendorProductFormPage = lazy(() => import('@/features/vendor/pages/catalog-pages').then((module) => ({ default: module.VendorProductFormPage })))
const VendorInventoryPage = lazy(() => import('@/features/vendor/pages/catalog-pages').then((module) => ({ default: module.VendorInventoryPage })))
const VendorOrdersPage = lazy(() => import('@/features/vendor/pages/commerce-pages').then((module) => ({ default: module.VendorOrdersPage })))
const VendorDispatchPage = lazy(() => import('@/features/vendor/pages/commerce-pages').then((module) => ({ default: module.VendorDispatchPage })))
const VendorReportsPage = lazy(() => import('@/features/vendor/pages/commerce-pages').then((module) => ({ default: module.VendorReportsPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md p-6">
        <CardContent className="space-y-2 p-0 text-center">
          <p className="text-lg font-semibold text-dark">Loading workspace...</p>
          <p className="text-sm text-slate-500">Preparing the next role module and dashboard experience.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AppLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="experts" element={<ExpertsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="escalations" element={<EscalationsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>

        <Route
          path="/expert"
          element={
            <ProtectedRoute role="expert">
              <AppLayout role="expert" />
            </ProtectedRoute>
          }
        >
          <Route index element={<ExpertDashboardPage />} />
          <Route path="queries" element={<ExpertQueriesPage />} />
          <Route path="queries/:id" element={<ExpertQueryDetailPage />} />
          <Route path="products" element={<ExpertProductsPage />} />
          <Route path="history" element={<ExpertHistoryPage />} />
          <Route path="notifications" element={<ExpertNotificationsPage />} />
        </Route>

        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <AppLayout role="employee" />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboardPage />} />
          <Route path="tasks" element={<EmployeeTaskBoardPage />} />
          <Route path="monitoring" element={<EmployeeMonitoringPage />} />
          <Route path="vendor-support" element={<EmployeeVendorSupportPage />} />
          <Route path="reports" element={<EmployeeReportsPage />} />
        </Route>

        <Route
          path="/vendor"
          element={
            <ProtectedRoute role="vendor">
              <AppLayout role="vendor" />
            </ProtectedRoute>
          }
        >
          <Route index element={<VendorDashboardPage />} />
          <Route path="products" element={<VendorProductsPage />} />
          <Route path="products/new" element={<VendorProductFormPage />} />
          <Route path="products/:id/edit" element={<VendorProductFormPage />} />
          <Route path="inventory" element={<VendorInventoryPage />} />
          <Route path="orders" element={<VendorOrdersPage />} />
          <Route path="dispatch" element={<VendorDispatchPage />} />
          <Route path="reports" element={<VendorReportsPage />} />
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
