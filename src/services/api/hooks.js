import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { demoApi, analyticsApi, auditApi, authApi, categoriesApi, escalationsApi, notificationsApi, ordersApi, productsApi, queriesApi, recommendationsApi, settingsApi, supportCasesApi, tasksApi, usersApi } from '@/services/api/resources'
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

export function useQueryDetail(id) {
  return useQuery({
    queryKey: queryKeys.queryDetail(id),
    queryFn: () => queriesApi.detail(id),
    enabled: Boolean(id),
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

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesApi.list,
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

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  })
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
    (payload) => categoriesApi.create(payload),
    [['categories'], ['audit-logs']],
  )
}

export function useCategoryDeleteMutation() {
  return useInvalidatingMutation(
    (id) => categoriesApi.remove(id),
    [['categories'], ['audit-logs']],
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
    [['users'], ['queries'], ['recommendations'], ['products'], ['orders'], ['escalations'], ['notifications'], ['audit-logs'], ['tasks'], ['support-cases'], ['analytics'], ['settings']],
  )
}
