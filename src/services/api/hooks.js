import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { demoApi, analyticsApi, auditApi, authApi, categoriesApi, cropDetailsApi, cropDiseaseApi, escalationsApi, guideDetailsApi, guideHeadingsApi, notificationsApi, ordersApi, productsApi, queriesApi, recommendationsApi, settingsApi, supportCasesApi, tasksApi, usersApi } from '@/services/api/resources'
import { queryKeys } from '@/services/api/query-keys'

export function useAnalytics(role) {
  return useQuery({
    queryKey: queryKeys.analytics(role),
    queryFn: () => analyticsApi.overview(role),
  })
}

export function useUsers(params = {}) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => usersApi.list(params),
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

export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: recommendationsApi.list,
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

export function useCropDetails(params = {}) {
  return useQuery({
    queryKey: queryKeys.cropDetails(params),
    queryFn: () => cropDetailsApi.list(params),
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

export function useGuideHeadings() {
  return useQuery({
    queryKey: queryKeys.guideHeadings,
    queryFn: guideHeadingsApi.list,
  })
}

export function useGuideHeadingDetail(id) {
  return useQuery({
    queryKey: queryKeys.guideHeadingDetail(id),
    queryFn: () => guideHeadingsApi.detail(id),
    enabled: Boolean(id),
  })
}

export function useGuideDetails() {
  return useQuery({
    queryKey: queryKeys.guideDetails,
    queryFn: guideDetailsApi.list,
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

export function useEscalations(params = {}) {
  return useQuery({
    queryKey: queryKeys.escalations(params),
    queryFn: () => escalationsApi.list(params),
  })
}

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () => notificationsApi.list(params),
  })
}

export function useAuditLogs() {
  return useQuery({
    queryKey: queryKeys.auditLogs,
    queryFn: auditApi.list,
  })
}

export function useTasks(params = {}) {
  return useQuery({
    queryKey: queryKeys.tasks(params),
    queryFn: () => tasksApi.list(params),
  })
}

export function useSupportCases() {
  return useQuery({
    queryKey: queryKeys.supportCases,
    queryFn: supportCasesApi.list,
  })
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: settingsApi.get,
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

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  })
}

export function useUserSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? usersApi.update(id, payload) : usersApi.create(payload)),
    [['users'], ['audit-logs']],
  )
}

export function useUserDeleteMutation() {
  return useInvalidatingMutation(
    (id) => usersApi.remove(id),
    [['users'], ['audit-logs'], ['analytics']],
  )
}

export function useUserRoleMutation() {
  return useInvalidatingMutation(
    ({ id, role }) => usersApi.updateRole(id, role),
    [['users'], ['audit-logs'], ['analytics']],
  )
}

export function useUserStatusToggleMutation() {
  return useInvalidatingMutation(
    (id) => usersApi.toggleStatus(id),
    [['users'], ['audit-logs'], ['analytics']],
  )
}

export function useRecommendationSaveMutation() {
  return useInvalidatingMutation(
    (payload) => recommendationsApi.create(payload),
    [['recommendations'], ['queries'], ['audit-logs'], ['analytics']],
  )
}

export function useProductSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? productsApi.update(id, payload) : productsApi.create(payload)),
    [['products'], ['audit-logs'], ['analytics']],
  )
}

export function useProductDeleteMutation() {
  return useInvalidatingMutation(
    (id) => productsApi.remove(id),
    [['products'], ['audit-logs'], ['analytics']],
  )
}

export function useCategorySaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? categoriesApi.update(id, payload) : categoriesApi.create(payload)),
    [['categories'], ['audit-logs']],
  )
}

export function useCategoryDeleteMutation() {
  return useInvalidatingMutation(
    (id) => categoriesApi.remove(id),
    [['categories'], ['audit-logs']],
  )
}

export function useCropDetailSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? cropDetailsApi.update(id, payload) : cropDetailsApi.create(payload)),
    [['crop-details'], ['products'], ['analytics']],
  )
}

export function useCropDetailStatusMutation() {
  return useInvalidatingMutation(
    (id) => cropDetailsApi.toggleStatus(id),
    [['crop-details'], ['analytics']],
  )
}

export function useCropDetailImagesMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => cropDetailsApi.updateImages(id, payload),
    [['crop-details']],
  )
}

export function useCropDiseaseSaveMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => (id ? cropDiseaseApi.update(id, payload) : cropDiseaseApi.create(payload)),
    [['crop-diseases'], ['audit-logs'], ['analytics']],
  )
}

export function useCropDiseaseDeleteMutation() {
  return useInvalidatingMutation(
    (id) => cropDiseaseApi.remove(id),
    [['crop-diseases'], ['audit-logs'], ['analytics']],
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

export function useOrderUpdateMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => ordersApi.update(id, payload),
    [['orders'], ['audit-logs'], ['analytics']],
  )
}

export function useOrderDeleteMutation() {
  return useInvalidatingMutation(
    (id) => ordersApi.remove(id),
    [['orders'], ['audit-logs'], ['analytics']],
  )
}

export function useEscalationUpdateMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => escalationsApi.update(id, payload),
    [['escalations'], ['audit-logs'], ['analytics']],
  )
}

export function useEscalationDeleteMutation() {
  return useInvalidatingMutation(
    (id) => escalationsApi.remove(id),
    [['escalations'], ['audit-logs'], ['analytics']],
  )
}

export function useQueryUpdateMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => queriesApi.update(id, payload),
    [['queries'], ['audit-logs']],
  )
}

export function useQueryCreateMutation() {
  return useInvalidatingMutation(
    (payload) => queriesApi.create(payload),
    [['queries'], ['audit-logs'], ['analytics']],
  )
}

export function useQueryReplyMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => queriesApi.reply(id, payload),
    [['queries'], ['recommendations'], ['escalations'], ['audit-logs'], ['analytics']],
  )
}

export function useQueryDeleteMutation() {
  return useInvalidatingMutation(
    (id) => queriesApi.remove(id),
    [['queries'], ['recommendations'], ['escalations'], ['audit-logs'], ['analytics']],
  )
}

export function useTaskUpdateMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => tasksApi.update(id, payload),
    [['tasks']],
  )
}

export function useTaskDeleteMutation() {
  return useInvalidatingMutation(
    (id) => tasksApi.remove(id),
    [['tasks']],
  )
}

export function useSupportCaseUpdateMutation() {
  return useInvalidatingMutation(
    ({ id, payload }) => supportCasesApi.update(id, payload),
    [['support-cases']],
  )
}

export function useSupportCaseDeleteMutation() {
  return useInvalidatingMutation(
    (id) => supportCasesApi.remove(id),
    [['support-cases']],
  )
}

export function useNotificationReadMutation() {
  return useInvalidatingMutation(
    (id) => notificationsApi.markRead(id),
    [['notifications']],
  )
}

export function useAuditLogDeleteMutation() {
  return useInvalidatingMutation(
    (id) => auditApi.remove(id),
    [['audit-logs']],
  )
}

export function useSettingsSaveMutation() {
  return useInvalidatingMutation(
    (payload) => settingsApi.update(payload),
    [['settings'], ['audit-logs']],
  )
}

export function useDemoResetMutation() {
  return useInvalidatingMutation(
    demoApi.reset,
    [['users'], ['queries'], ['recommendations'], ['products'], ['crop-diseases'], ['orders'], ['escalations'], ['notifications'], ['audit-logs'], ['tasks'], ['support-cases'], ['analytics'], ['settings']],
  )
}
