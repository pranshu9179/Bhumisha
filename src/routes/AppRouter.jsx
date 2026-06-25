import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { AuthLayout } from '@/layouts/auth-layout'
import { AppLayout } from '@/layouts/app-layout'
import { ProtectedRoute } from '@/routes/protected-route'
import { RoleHomeRedirect } from '@/routes/role-home-redirect'
import { useCurrentUser } from '@/hooks/use-current-user'

const LoginPage = lazy(() => import('@/features/auth/pages/login-page'))
const RegisterPage = lazy(() => import('@/features/auth/pages/register-page'))
const VerifyOtpPage = lazy(() => import('@/features/auth/pages/verify-otp-page'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/forgot-password-page'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/reset-password-page'))
const UnauthorizedPage = lazy(() => import('@/features/shared/pages/unauthorized-page'))
const NotFoundPage = lazy(() => import('@/features/shared/pages/not-found-page'))

const AdminDashboardPage = lazy(() => import('@/features/admin/pages/dashboard-page'))
const UsersPage = lazy(() => import('@/features/admin/pages/people-pages').then((module) => ({ default: module.UsersPage })))
const ExpertsPage = lazy(() => import('@/features/admin/pages/people-pages').then((module) => ({ default: module.ExpertsPage })))
const EmployeesPage = lazy(() => import('@/features/admin/pages/people-pages').then((module) => ({ default: module.EmployeesPage })))
const VendorsPage = lazy(() => import('@/features/admin/pages/people-pages').then((module) => ({ default: module.VendorsPage })))
const AdminQueryManagementPage = lazy(() => import('@/features/admin/pages/query-management-page'))
const AdminProductsPage = lazy(() => import('@/features/admin/pages/catalog/admin-products-page'))
const ProductManagementPage = lazy(() => import('@/features/vendor/pages/catalog/vendor-products-page'))
const CategoriesPage = lazy(() => import('@/features/admin/pages/catalog/categories-page'))
const GuideHeadingsPage = lazy(() => import('@/features/admin/pages/catalog/guide-headings-page'))
const GuideDetailsPage = lazy(() => import('@/features/admin/pages/catalog/guide-details-page'))
const CropDiseasesPage = lazy(() => import('@/features/admin/pages/catalog/crop-diseases-page'))
const MarketplaceTaxonomyPage = lazy(() => import('@/features/admin/pages/marketplace-taxonomy-page'))
const OrdersPage = lazy(() => import('@/features/admin/pages/operations-pages').then((module) => ({ default: module.OrdersPage })))
const BrokeragePage = lazy(() => import('@/features/admin/pages/brokerage-page'))
const MandiRatesPage = lazy(() => import('@/features/admin/pages/mandi-rates-page'))
const SettlementsPage = lazy(() => import('@/features/admin/pages/settlements-page'))
const GuideParentsPage = lazy(() => import('@/features/admin/pages/catalog/guide-parents-page'))

const ExpertDashboardPage = lazy(() => import('@/features/expert/pages/dashboard-page'))
const ExpertQueriesPage = lazy(() => import('@/features/expert/pages/query-pages').then((module) => ({ default: module.ExpertQueriesPage })))
const ExpertQueryDetailPage = lazy(() => import('@/features/expert/pages/query-pages').then((module) => ({ default: module.ExpertQueryDetailPage })))
const ExpertHistoryPage = lazy(() => import('@/features/expert/pages/query-pages').then((module) => ({ default: module.ExpertHistoryPage })))
const ExpertProductsPage = lazy(() => import('@/features/expert/pages/support-pages').then((module) => ({ default: module.ExpertProductsPage })))

const EmployeeDashboardPage = lazy(() => import('@/features/employee/pages/dashboard-page'))
const EmployeeMonitoringPage = lazy(() => import('@/features/employee/pages/monitoring-page'))

const UserDashboardPage = lazy(() => import('@/features/user/pages/dashboard-page'))
const BecomeVendorPage = lazy(() => import('@/features/user/pages/become-vendor-page'))

const VendorDashboardPage = lazy(() => import('@/features/vendor/pages/dashboard-page'))
const VendorProductsPage = lazy(() => import('@/features/vendor/pages/catalog/vendor-products-page'))
const VendorProductFormPage = lazy(() => import('@/features/vendor/pages/catalog/vendor-product-form-page'))
const VendorInventoryPage = lazy(() => import('@/features/vendor/pages/catalog/vendor-inventory-page'))
const VendorStoreSetupPage = lazy(() => import('@/features/vendor/pages/commerce/vendor-store-setup-page'))
const VendorOrdersPage = lazy(() => import('@/features/vendor/pages/commerce/vendor-orders-page'))
const VendorCheckoutPage = lazy(() => import('@/features/vendor/pages/commerce/vendor-checkout-page'))
const VendorDispatchPage = lazy(() => import('@/features/vendor/pages/commerce/vendor-dispatch-page'))
const VendorReportsPage = lazy(() => import('@/features/vendor/pages/commerce/vendor-reports-page'))

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

function CurrentUserProductsLayout() {
  const user = useCurrentUser()
  return <AppLayout role={user?.role || 'expert'} />
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <CurrentUserProductsLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ExpertProductsPage />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
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
          <Route path="queries" element={<AdminQueryManagementPage />} />
          <Route path="queries/:id" element={<ExpertQueryDetailPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="product-list" element={<ProductManagementPage />} />
          <Route path="product-list/new" element={<VendorProductFormPage />} />
          <Route path="product-list/:id/edit" element={<VendorProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="guide-headings" element={<GuideHeadingsPage />} />
          <Route path="guide-details" element={<GuideDetailsPage />} />
          <Route path="crop-diseases" element={<CropDiseasesPage />} />
          <Route path="marketplace-taxonomy" element={<MarketplaceTaxonomyPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="mandi-rates" element={<MandiRatesPage />} />
          <Route path="settlements" element={<SettlementsPage />} />
          <Route path="brokerage" element={<BrokeragePage />} />
          <Route path="guide-parents" element={<GuideParentsPage />} />
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
          <Route path="monitoring" element={<EmployeeMonitoringPage />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="products/new" element={<VendorProductFormPage />} />
          <Route path="products/:id/edit" element={<VendorProductFormPage />} />
          <Route path="queries/:id" element={<ExpertQueryDetailPage />} />
        </Route>

        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <AppLayout role="user" />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboardPage />} />
          <Route path="checkout" element={<VendorCheckoutPage />} />
          <Route path="become-vendor" element={<BecomeVendorPage />} />
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
          <Route path="store-setup" element={<VendorStoreSetupPage />} />
          <Route path="products/new" element={<VendorProductFormPage />} />
          <Route path="products/:id/edit" element={<VendorProductFormPage />} />
          <Route path="inventory" element={<VendorInventoryPage />} />
          <Route path="orders" element={<VendorOrdersPage />} />
          <Route path="checkout" element={<VendorCheckoutPage />} />
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
