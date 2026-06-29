import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addressesApi, brokerageApi, authApi, categoriesApi, cropDiseaseApi, guideDetailsApi, guideHeadingsApi, guideParentsApi, mandiApi, ordersApi, productCategoriesApi, productsApi, queriesApi, returnRequestsApi, serviceBookingsApi, settlementsApi, shopProductsApi, usersApi, vendorApi, vendorCategoriesApi } from '@/services/api/resources'
import { queryKeys } from '@/services/api/query-keys'

export function useUsers(params = {}) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => usersApi.list(params),
  })
}

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: usersApi.me,
  })
}

export function useQueries(params = {}) {
  return useQuery({
    queryKey: queryKeys.queries(params),
    queryFn: () => queriesApi.list(params),
  })
}

export function useMyQueries(params = {}) {
  return useQuery({
    queryKey: queryKeys.myQueries(params),
    queryFn: () => queriesApi.myQueries(params),
  })
}

export function usePublicQueries(params = {}) {
  return useQuery({
    queryKey: queryKeys.publicQueries(params),
    queryFn: () => queriesApi.publicFeed(params),
  })
}

export function useStaffPendingQueries(params = {}) {
  return useQuery({
    queryKey: queryKeys.staffPendingQueries(params),
    queryFn: () => queriesApi.staffPending(params),
  })
}

export function useStaffMyReplies(params = {}) {
  return useQuery({
    queryKey: queryKeys.staffReplies(params),
    queryFn: () => queriesApi.staffMyReplies(params),
  })
}

export function useAdminQueries(params = {}) {
  return useQuery({
    queryKey: queryKeys.adminQueries(params),
    queryFn: () => queriesApi.adminAll(params),
  })
}

export function useQueryDetail(id) {
  return useQuery({
    queryKey: queryKeys.queryDetail(id),
    queryFn: () => queriesApi.detail(id),
    enabled: Boolean(id),
  })
}

export function useAdminQueryDetail(id) {
  return useQuery({
    queryKey: queryKeys.adminQueryDetail(id),
    queryFn: () => queriesApi.adminDetail(id),
    enabled: Boolean(id),
  })
}

export function useAdminUserActivity(userId) {
  return useQuery({
    queryKey: queryKeys.adminUserActivity(userId),
    queryFn: () => queriesApi.adminUserActivity(userId),
    enabled: Boolean(userId),
  })
}

export function useProducts(params = {}) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => productsApi.list(params),
  })
}

export function useProductDetail(id) {
  return useQuery({
    queryKey: queryKeys.productDetail(id),
    queryFn: () => productsApi.detail(id),
    enabled: Boolean(id),
  })
}

export function useShopProducts(params = {}) {
  return useQuery({
    queryKey: queryKeys.shopProducts(params),
    queryFn: () => shopProductsApi.list(params),
  })
}

export function useShopProductDetail(id) {
  return useQuery({
    queryKey: queryKeys.shopProductDetail(id),
    queryFn: () => shopProductsApi.detail(id),
    enabled: Boolean(id),
  })
}

export function useProductCategories(params = {}) {
  return useQuery({
    queryKey: queryKeys.productCategories(params),
    queryFn: () => productCategoriesApi.list(params),
  })
}

export function useProductSubcategories(params = {}) {
  return useQuery({
    queryKey: queryKeys.productSubcategories(params),
    queryFn: () => productCategoriesApi.subcategories(params),
  })
}

export function useVendorCategories(params = {}) {
  return useQuery({
    queryKey: queryKeys.vendorCategories(params),
    queryFn: () => vendorCategoriesApi.list(params),
  })
}

export function useVendorProfile(options = {}) {
  return useQuery({
    queryKey: queryKeys.vendorProfile,
    queryFn: vendorApi.profile,
    enabled: options.enabled ?? true,
  })
}

export function useVendors() {
  return useQuery({
    queryKey: queryKeys.vendors,
    queryFn: vendorApi.all,
  })
}

export function useServiceProviders() {
  return useQuery({
    queryKey: queryKeys.serviceProviders,
    queryFn: vendorApi.serviceProviders,
  })
}

export function useVendorsByCategory(categoryId, params = {}) {
  return useQuery({
    queryKey: queryKeys.vendorsByCategory(categoryId, params),
    queryFn: () => vendorApi.byCategory(categoryId, params),
    enabled: Boolean(categoryId),
  })
}

export function useCategories(params = {}) {
  return useQuery({
    queryKey: queryKeys.categories(params),
    queryFn: () => categoriesApi.list(params),
  })
}

export function useCategoryDetail(id) {
  return useQuery({
    queryKey: queryKeys.categoryDetail(id),
    queryFn: () => categoriesApi.detail(id),
    enabled: Boolean(id),
  })
}

export function useCropDiseases(params = {}) {
  return useQuery({
    queryKey: queryKeys.cropDiseases(params),
    queryFn: () => cropDiseaseApi.list(params),
  })
}

export function useCropDiseaseDetail(id) {
  return useQuery({
    queryKey: queryKeys.cropDiseaseDetail(id),
    queryFn: () => cropDiseaseApi.detail(id),
    enabled: Boolean(id),
  })
}

export function useGuideHeadings(params = {}) {
  return useQuery({
    queryKey: queryKeys.guideHeadings(params),
    queryFn: () => guideHeadingsApi.list(params),
  })
}

export function useGuideHeadingDetail(id) {
  return useQuery({
    queryKey: queryKeys.guideHeadingDetail(id),
    queryFn: () => guideHeadingsApi.detail(id),
    enabled: Boolean(id),
  })
}

export function useGuideDetails(params = {}) {
  return useQuery({
    queryKey: queryKeys.guideDetails(params),
    queryFn: () => guideDetailsApi.list(params),
  })
}

export function useGuideDetailsByCrop(cropId) {
  return useQuery({
    queryKey: queryKeys.guideDetailsByCrop(cropId),
    queryFn: () => guideDetailsApi.byCrop(cropId),
    enabled: Boolean(cropId),
  })
}

export function useOrders(params = {}) {
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: () => ordersApi.list(params),
  })
}

export function useMyOrders() {
  return useQuery({
    queryKey: queryKeys.myOrders,
    queryFn: ordersApi.myOrders,
  })
}

export function useReturnRequests(params = {}) {
  return useQuery({
    queryKey: queryKeys.returnRequests(params),
    queryFn: () => returnRequestsApi.list(params),
  })
}

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: addressesApi.list,
  })
}

export function useServiceBookings(params = {}) {
  return useQuery({
    queryKey: queryKeys.serviceBookings(params),
    queryFn: () => serviceBookingsApi.all(params),
  })
}

export function useBrokerageLeads() {
  return useQuery({
    queryKey: queryKeys.brokerageLeads,
    queryFn: brokerageApi.leads,
  })
}

export function useBrokerageDeals() {
  return useQuery({
    queryKey: queryKeys.brokerageDeals,
    queryFn: brokerageApi.deals,
  })
}

export function useSalesReport(params = {}) {
  return useQuery({
    queryKey: queryKeys.salesReport(params),
    queryFn: () => ordersApi.salesReport(params),
  })
}

export function useMandiRates(params = {}) {
  return useQuery({
    queryKey: queryKeys.mandiRates(params),
    queryFn: () => mandiApi.list(params),
  })
}

export function useSettlements(params = {}) {
  return useQuery({
    queryKey: queryKeys.settlements(params),
    queryFn: () => settlementsApi.list(params),
  })
}

export function useGuideParents(params = {}) {
  return useQuery({
    queryKey: queryKeys.guideParents(params),
    queryFn: () => guideParentsApi.list(params),
  })
}

function useInvalidatingMutation(mutationFn, invalidates) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidates.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
  })
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: authApi.login,
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: authApi.logout,
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authApi.register,
  })
}

export function useAdminUserCreateMutation() {
  return useInvalidatingMutation(
    authApi.register,
    [['users']],
  )
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: authApi.verifyOtp,
  })
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: authApi.resendOtp,
  })
}

export function useProfileImageMutation() {
  return useInvalidatingMutation(
    authApi.updateProfileImage,
    [['users']],
  )
}

export function useUserProfileUpdateMutation() {
  return useInvalidatingMutation(
    usersApi.updateProfile,
    [['users']],
  )
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  })
}

export function useUserRoleMutation() {
  return useInvalidatingMutation(
    ({ id, role }) => usersApi.updateRole(id, role),
    [['users']],
  )
}

export function useUserStatusToggleMutation() {
  return useInvalidatingMutation(
    (id) => usersApi.toggleStatus(id),
    [['users']],
  )
}

export function useProductSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? productsApi.update(id, payload) : productsApi.create(payload)),
    [['products']],
  )
}

export function useProductDeleteMutation() {
  return useInvalidatingMutation(
    (id) => productsApi.remove(id),
    [['products']],
  )
}

export function useCropImagesMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => productsApi.updateImages(id, payload),
    [['products']],
  )
}

export function useCategorySaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? categoriesApi.update(id, payload) : categoriesApi.create(payload)),
    [['categories']],
  )
}

export function useCategoryDeleteMutation() {
  return useInvalidatingMutation(
    (id) => categoriesApi.remove(id),
    [['categories']],
  )
}

export function useShopProductSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? shopProductsApi.update(id, payload) : shopProductsApi.create(payload)),
    [['shop-products'], ['orders']],
  )
}

export function useShopProductDeleteMutation() {
  return useInvalidatingMutation(
    (id) => shopProductsApi.remove(id),
    [['shop-products'], ['orders'], ['analytics']],
  )
}

export function useShopProductStatusMutation() {
  return useInvalidatingMutation(
    ({ id, status }) => shopProductsApi.setStatus(id, status),
    [['shop-products'], ['orders'], ['analytics']],  // ✅ sab invalidate hoga
  )
}

export function useProductCategorySaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? productCategoriesApi.update(id, payload) : productCategoriesApi.create(payload)),
    [['product-categories']],
  )
}

export function useProductSubcategorySaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? productCategoriesApi.updateSubcategory(id, payload) : productCategoriesApi.createSubcategory(payload)),
    [['product-categories']],
  )
}

export function useVendorCategorySaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? vendorCategoriesApi.update(id, payload) : vendorCategoriesApi.create(payload)),
    [['vendor-categories']],
  )
}

export function useProductCategoryDeleteMutation() {
  return useInvalidatingMutation(
    productCategoriesApi.toggleDelete,
    [['product-categories']],
  )
}

export function useProductSubcategoryDeleteMutation() {
  return useInvalidatingMutation(
    productCategoriesApi.toggleDeleteSubcategory,
    [['product-categories']],
  )
}

export function useVendorCategoryDeleteMutation() {
  return useInvalidatingMutation(
    vendorCategoriesApi.toggleDelete,
    [['vendor-categories']],
  )
}

export function useVendorRegistrationMutation() {
  return useInvalidatingMutation(
    vendorApi.register,
    [['users'], ['vendor']],
  )
}

export function useVendorProfileSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => vendorApi.updateProfile(id, payload),
    [['users'], ['vendor']],
  )
}

export function useVendorStatusMutation() {
  return useInvalidatingMutation(
    ({ id, status }) => vendorApi.updateStatus(id, status),
    [['users'], ['vendor']],
  )
}

export function useAddressSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? addressesApi.update(id, payload) : addressesApi.create(payload)),
    [['addresses']],
  )
}

export function useAddressDeleteMutation() {
  return useInvalidatingMutation(
    addressesApi.remove,
    [['addresses']],
  )
}

export function useCheckoutMutation() {
  return useInvalidatingMutation(
    ordersApi.checkout,
    [['orders'], ['shop-products']],
  )
}

export function usePaymentStatusMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => ordersApi.updatePaymentStatus(id, payload),
    [['orders']],
  )
}

export function useReturnRequestCreateMutation() {
  return useInvalidatingMutation(
    returnRequestsApi.request,
    [['orders'], ['orders', 'returns']],
  )
}

export function useReturnHandleMutation() {
  return useInvalidatingMutation(
    ({ id, status }) => returnRequestsApi.handle(id, status),
    [['orders'], ['orders', 'returns'], ['shop-products']],
  )
}

export function useBrokerageLeadSaveMutation() {
  return useInvalidatingMutation(
    brokerageApi.createLead,
    [['brokerage', 'leads']],
  )
}

export function useBrokerageDealSaveMutation() {
  return useInvalidatingMutation(
    brokerageApi.createDeal,
    [['brokerage', 'leads'], ['brokerage', 'deals'], ['service-bookings']],
  )
}

export function useServiceBookingCreateMutation() {
  return useInvalidatingMutation(
    serviceBookingsApi.create,
    [['service-bookings']],
  )
}

export function useServiceBookingStatusMutation() {
  return useInvalidatingMutation(
    ({ id, status }) => serviceBookingsApi.updateStatus(id, status),
    [['service-bookings'], ['brokerage', 'deals']],
  )
}

export function useMandiRateSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? mandiApi.update(id, payload) : mandiApi.create(payload)),
    [['mandi']],
  )
}

export function useMandiRateDeleteMutation() {
  return useInvalidatingMutation(
    mandiApi.remove,
    [['mandi']],
  )
}

export function useSettlementSaveMutation() {
  return useInvalidatingMutation(
    settlementsApi.create,
    [['settlements']],
  )
}

export function useCropDiseaseSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? cropDiseaseApi.update(id, payload) : cropDiseaseApi.create(payload)),
    [['crop-diseases']],
  )
}

export function useCropDiseaseDeleteMutation() {
  return useInvalidatingMutation(
    (id) => cropDiseaseApi.remove(id),
    [['crop-diseases']],
  )
}

export function useGuideHeadingSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? guideHeadingsApi.update(id, payload) : guideHeadingsApi.create(payload)),
    [['guide-headings']],
  )
}

export function useGuideHeadingDeleteMutation() {
  return useInvalidatingMutation(
    (id) => guideHeadingsApi.remove(id),
    [['guide-headings'], ['guide-details']],
  )
}

export function useGuideHeadingRestoreMutation() {
  return useInvalidatingMutation(
    (id) => guideHeadingsApi.restore(id),
    [['guide-headings'], ['guide-details']],
  )
}

export function useGuideDetailSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? guideDetailsApi.update(id, payload) : guideDetailsApi.create(payload)),
    [['guide-details']],
  )
}

export function useGuideDetailMediaAppendMutation() {
  return useInvalidatingMutation(
    ({ id, files }) => guideDetailsApi.appendMedia(id, files),
    [['guide-details']],
  )
}

export function useGuideDetailMediaDeleteMutation() {
  return useInvalidatingMutation(
    ({ detailId, index }) => guideDetailsApi.removeMedia(detailId, index),
    [['guide-details']],
  )
}

export function useGuideDetailDeleteMutation() {
  return useInvalidatingMutation(
    (id) => guideDetailsApi.remove(id),
    [['guide-details']],
  )
}

export function useGuideParentSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? guideParentsApi.update(id, payload) : guideParentsApi.create(payload)),
    [['guide-parents'], ['guide-headings'], ['guide-details']],
  )
}

export function useGuideParentDeleteMutation() {
  return useInvalidatingMutation(
    (id) => guideParentsApi.remove(id),
    [['guide-parents'], ['guide-headings'], ['guide-details']],
  )
}

export function useOrderUpdateMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => ordersApi.update(id, payload),
    [['orders']],
  )
}

export function useQueryUpdateMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => queriesApi.update(id, payload),
    [['queries']],
  )
}

export function useQueryCreateMutation() {
  return useInvalidatingMutation(
    (payload) => queriesApi.create(payload),
    [['queries']],
  )
}

export function useQueryReplyMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => queriesApi.reply(id, payload),
    [['queries']],
  )
}

export function useQueryDeleteMutation() {
  return useInvalidatingMutation(
    (id) => queriesApi.remove(id),
    [['queries']],
  )
}
