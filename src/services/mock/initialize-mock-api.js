import AxiosMockAdapter from 'axios-mock-adapter'
import dayjs from 'dayjs'
import { ROLE_LABELS } from '@/lib/constants'
import { createId } from '@/lib/utils'
import { apiClient } from '@/services/api/client'
import { appendAuditLog, loadMockDb, mutateMockDb, resetMockDb } from '@/services/mock/mock-db'

let initialized = false

function matchById(url, segment) {
  const parts = url.split('/')
  return parts[segment]
}

function withStatusFilter(items, key, value) {
  if (!value) return items
  return items.filter((item) => String(item[key]) === String(value))
}

function getAnalyticsOverview(role) {
  const db = loadMockDb()
  const totalRevenue = db.orders.reduce((sum, order) => sum + order.total, 0)
  const lowStock = db.products.filter((product) => product.stock <= 20)
  const pendingDispatch = db.orders.filter((order) => order.fulfillmentStatus !== 'delivered')
  const assignedQueries = db.queries.filter((query) => query.status !== 'closed')

  const base = {
    revenue: totalRevenue,
    orders: db.orders.length,
    products: db.products.length,
    lowStock: lowStock.length,
    revenueTrend: [
      { month: 'Jan', value: 2.4 },
      { month: 'Feb', value: 2.9 },
      { month: 'Mar', value: 3.4 },
      { month: 'Apr', value: 4.1 },
      { month: 'May', value: 4.8 },
      { month: 'Jun', value: 5.3 },
    ],
    queryMix: [
      { name: 'Assigned', value: db.queries.filter((item) => item.status === 'assigned').length },
      { name: 'Review', value: db.queries.filter((item) => item.status === 'review').length },
      { name: 'Recommended', value: db.queries.filter((item) => item.status === 'recommended').length },
      { name: 'Escalated', value: db.queries.filter((item) => item.status === 'escalated').length },
    ],
  }

  if (role === 'admin') {
    return {
      ...base,
      widgets: [
        { label: 'Total Experts', value: db.users.filter((user) => user.role === 'expert').length, delta: '+8%' },
        { label: 'Total Employees', value: db.users.filter((user) => user.role === 'employee').length, delta: '+3%' },
        { label: 'Total Vendors', value: db.users.filter((user) => user.role === 'vendor').length, delta: '+12%' },
        { label: 'Pending Queries', value: assignedQueries.length, delta: '+5%' },
        { label: 'Escalated Queries', value: db.escalations.length, delta: '-2%' },
        { label: 'Revenue', value: totalRevenue, delta: '+14%' },
        { label: 'Orders', value: db.orders.length, delta: '+9%' },
        { label: 'Products', value: db.products.length, delta: '+11%' },
        { label: 'Low Stock Alerts', value: lowStock.length, delta: 'Needs action' },
      ],
    }
  }

  if (role === 'expert') {
    const expertId = 'user_expert_1'
    return {
      ...base,
      widgets: [
        { label: 'Assigned Queries', value: db.queries.filter((item) => item.assignedExpertId === expertId).length, delta: '+2' },
        { label: 'Pending Queries', value: db.queries.filter((item) => item.assignedExpertId === expertId && item.status !== 'closed').length, delta: '+1' },
        { label: 'Average Response Time', value: '1.8 hr', delta: '-12%' },
        { label: 'Completed Suggestions', value: db.recommendations.filter((item) => item.expertId === expertId).length, delta: '+6%' },
      ],
    }
  }

  if (role === 'employee') {
    return {
      ...base,
      widgets: [
        { label: 'Pending Tasks', value: db.tasks.filter((task) => task.stage !== 'done').length, delta: '+4%' },
        { label: 'Open Queries', value: db.queries.filter((query) => query.status !== 'closed').length, delta: '+3%' },
        { label: 'Vendor Cases', value: db.supportCases.length, delta: '+1' },
        { label: 'Escalation Cases', value: db.escalations.length, delta: '-1' },
      ],
    }
  }

  return {
    ...base,
    widgets: [
      { label: 'Products', value: db.products.filter((item) => item.vendorId === 'user_vendor_1').length, delta: '+2' },
      { label: 'Revenue', value: db.orders.filter((item) => item.vendorId === 'user_vendor_1').reduce((sum, item) => sum + item.total, 0), delta: '+16%' },
      { label: 'Orders', value: db.orders.filter((item) => item.vendorId === 'user_vendor_1').length, delta: '+4%' },
      { label: 'Low Stock', value: db.products.filter((item) => item.vendorId === 'user_vendor_1' && item.stock <= 20).length, delta: 'Watch list' },
      { label: 'Pending Dispatch', value: pendingDispatch.filter((item) => item.vendorId === 'user_vendor_1').length, delta: '+1' },
    ],
  }
}

function normalizeOrder(order) {
  return {
    ...order,
    createdAt: order.createdAt || new Date().toISOString(),
  }
}

function removeFromCollection(collection, id, auditEntry) {
  const removed = mutateMockDb((db) => {
    const index = db[collection].findIndex((item) => item.id === id)

    if (index < 0) {
      return null
    }

    const [record] = db[collection].splice(index, 1)
    return record
  })

  if (removed && auditEntry) {
    appendAuditLog({
      ...auditEntry,
      target: auditEntry.target || removed.name || removed.id,
    })
  }

  return removed
}

export function initializeMockApi() {
  if (initialized) {
    return apiClient
  }

  const mock = new AxiosMockAdapter(apiClient, { delayResponse: 420 })

  mock.onPost('/auth/login').reply((config) => {
    const { email, password } = JSON.parse(config.data)
    const db = loadMockDb()
    const user = db.users.find((item) => item.email === email && item.password === password)

    if (!user) {
      return [401, { message: 'Invalid email or password.' }]
    }

    appendAuditLog({
      actor: user.name,
      action: 'Signed in',
      target: ROLE_LABELS[user.role],
      channel: 'auth',
    })

    return [
      200,
      {
        user: {
          ...user,
          password: undefined,
        },
      },
    ]
  })

  mock.onPost('/auth/forgot-password').reply(200, {
    message: 'Reset instructions were simulated. Check your demo inbox.',
  })

  mock.onPost('/auth/reset-password').reply(200, {
    message: 'Password reset simulated successfully.',
  })

  mock.onGet('/analytics/overview').reply((config) => {
    const role = config.params?.role ?? 'admin'
    return [200, getAnalyticsOverview(role)]
  })

  mock.onGet('/users').reply((config) => {
    const db = loadMockDb()
    const role = config.params?.role
    const approvalStatus = config.params?.approvalStatus
    let items = db.users.map((user) => ({ ...user, password: undefined }))
    items = withStatusFilter(items, 'role', role)
    items = withStatusFilter(items, 'approvalStatus', approvalStatus)
    return [200, items]
  })

  mock.onPost('/users').reply((config) => {
    const payload = JSON.parse(config.data)
    const created = mutateMockDb((db) => {
      const record = {
        id: createId('user'),
        lastActive: new Date().toISOString(),
        avatar: '',
        approvalStatus: payload.role === 'vendor' ? 'pending' : 'approved',
        password: payload.password || 'Demo@123',
        ...payload,
      }
      db.users.unshift(record)
      return record
    })
    appendAuditLog({
      actor: 'Admin Console',
      action: 'Created user',
      target: created.name,
      channel: 'users',
    })
    return [201, { ...created, password: undefined }]
  })

  mock.onPut(/\/users\/[^/]+$/).reply((config) => {
    const userId = matchById(config.url, 2)
    const payload = JSON.parse(config.data)
    const updated = mutateMockDb((db) => {
      const index = db.users.findIndex((item) => item.id === userId)
      db.users[index] = { ...db.users[index], ...payload }
      return db.users[index]
    })
    appendAuditLog({
      actor: 'Admin Console',
      action: 'Updated user',
      target: updated.name,
      channel: 'users',
    })
    return [200, { ...updated, password: undefined }]
  })

  mock.onDelete(/\/users\/[^/]+$/).reply((config) => {
    const userId = matchById(config.url, 2)
    const removed = removeFromCollection('users', userId, {
      actor: 'Admin Console',
      action: 'Deleted user',
      channel: 'users',
    })
    return removed ? [200, { ...removed, password: undefined }] : [404, { message: 'User not found.' }]
  })

  mock.onGet('/queries').reply((config) => {
    const db = loadMockDb()
    let items = [...db.queries]
    items = withStatusFilter(items, 'assignedExpertId', config.params?.assignedExpertId)
    items = withStatusFilter(items, 'status', config.params?.status)
    return [200, items]
  })

  mock.onGet(/\/queries\/[^/]+$/).reply((config) => {
    const db = loadMockDb()
    const queryId = matchById(config.url, 2)
    const query = db.queries.find((item) => item.id === queryId)
    const recommendation = db.recommendations.find((item) => item.queryId === queryId)
    return [200, { ...query, recommendation: recommendation || null }]
  })

  mock.onPut(/\/queries\/[^/]+$/).reply((config) => {
    const queryId = matchById(config.url, 2)
    const payload = JSON.parse(config.data)
    const updated = mutateMockDb((db) => {
      const index = db.queries.findIndex((item) => item.id === queryId)
      db.queries[index] = { ...db.queries[index], ...payload }
      return db.queries[index]
    })
    appendAuditLog({
      actor: 'Workflow Engine',
      action: 'Updated query',
      target: updated.id,
      channel: 'queries',
    })
    return [200, updated]
  })

  mock.onDelete(/\/queries\/[^/]+$/).reply((config) => {
    const queryId = matchById(config.url, 2)
    const removed = mutateMockDb((db) => {
      const index = db.queries.findIndex((item) => item.id === queryId)

      if (index < 0) {
        return null
      }

      db.recommendations = db.recommendations.filter((item) => item.queryId !== queryId)
      db.escalations = db.escalations.filter((item) => item.queryId !== queryId)
      const [record] = db.queries.splice(index, 1)
      return record
    })

    if (removed) {
      appendAuditLog({
        actor: 'Workflow Engine',
        action: 'Deleted query',
        target: removed.id,
        channel: 'queries',
      })
    }

    return removed ? [200, removed] : [404, { message: 'Query not found.' }]
  })

  mock.onGet('/recommendations').reply(() => {
    const db = loadMockDb()
    return [200, db.recommendations]
  })

  mock.onPost('/recommendations').reply((config) => {
    const payload = JSON.parse(config.data)
    const created = mutateMockDb((db) => {
      const record = {
        id: createId('rec'),
        submittedAt: new Date().toISOString(),
        ...payload,
      }
      db.recommendations.unshift(record)
      const queryIndex = db.queries.findIndex((item) => item.id === payload.queryId)
      if (queryIndex >= 0) {
        db.queries[queryIndex] = {
          ...db.queries[queryIndex],
          status: 'closed',
        }
      }
      return record
    })
    appendAuditLog({
      actor: 'Expert Desk',
      action: 'Submitted recommendation',
      target: created.queryId,
      channel: 'advisory',
    })
    return [201, created]
  })

  mock.onGet('/products').reply((config) => {
    const db = loadMockDb()
    let items = [...db.products]
    items = withStatusFilter(items, 'vendorId', config.params?.vendorId)
    items = withStatusFilter(items, 'status', config.params?.status)
    return [200, items]
  })

  mock.onGet(/\/products\/[^/]+$/).reply((config) => {
    const db = loadMockDb()
    const productId = matchById(config.url, 2)
    return [200, db.products.find((item) => item.id === productId)]
  })

  mock.onPost('/products').reply((config) => {
    const payload = JSON.parse(config.data)
    const created = mutateMockDb((db) => {
      const record = {
        id: createId('prod'),
        status: payload.status || 'draft',
        rating: payload.rating || 4.2,
        ...payload,
      }
      db.products.unshift(record)
      return record
    })
    appendAuditLog({
      actor: 'Vendor Console',
      action: 'Created product',
      target: created.name,
      channel: 'catalog',
    })
    return [201, created]
  })

  mock.onPut(/\/products\/[^/]+$/).reply((config) => {
    const productId = matchById(config.url, 2)
    const payload = JSON.parse(config.data)
    const updated = mutateMockDb((db) => {
      const index = db.products.findIndex((item) => item.id === productId)
      db.products[index] = {
        ...db.products[index],
        ...payload,
      }
      return db.products[index]
    })
    appendAuditLog({
      actor: 'Vendor Console',
      action: 'Updated product',
      target: updated.name,
      channel: 'catalog',
    })
    return [200, updated]
  })

  mock.onDelete(/\/products\/[^/]+$/).reply((config) => {
    const productId = matchById(config.url, 2)
    const removed = removeFromCollection('products', productId, {
      actor: 'Catalog Console',
      action: 'Deleted product',
      channel: 'catalog',
    })
    return removed ? [200, removed] : [404, { message: 'Product not found.' }]
  })

  mock.onGet('/categories').reply(() => {
    const db = loadMockDb()
    return [200, db.categories]
  })

  mock.onPost('/categories').reply((config) => {
    const payload = JSON.parse(config.data)
    const created = mutateMockDb((db) => {
      const record = {
        id: createId('cat'),
        productCount: 0,
        ...payload,
      }
      db.categories.unshift(record)
      return record
    })
    appendAuditLog({
      actor: 'Admin Console',
      action: 'Created category',
      target: created.name,
      channel: 'catalog',
    })
    return [201, created]
  })

  mock.onDelete(/\/categories\/[^/]+$/).reply((config) => {
    const categoryId = matchById(config.url, 2)
    const removed = removeFromCollection('categories', categoryId, {
      actor: 'Admin Console',
      action: 'Deleted category',
      channel: 'catalog',
    })
    return removed ? [200, removed] : [404, { message: 'Category not found.' }]
  })

  mock.onGet('/orders').reply((config) => {
    const db = loadMockDb()
    let items = [...db.orders].map(normalizeOrder)
    items = withStatusFilter(items, 'vendorId', config.params?.vendorId)
    items = withStatusFilter(items, 'fulfillmentStatus', config.params?.fulfillmentStatus)
    return [200, items]
  })

  mock.onPut(/\/orders\/[^/]+$/).reply((config) => {
    const orderId = matchById(config.url, 2)
    const payload = JSON.parse(config.data)
    const updated = mutateMockDb((db) => {
      const index = db.orders.findIndex((item) => item.id === orderId)
      db.orders[index] = normalizeOrder({
        ...db.orders[index],
        ...payload,
        dispatchAt:
          payload.fulfillmentStatus === 'dispatched'
            ? new Date().toISOString()
            : db.orders[index].dispatchAt,
      })
      return db.orders[index]
    })
    appendAuditLog({
      actor: 'Commerce Flow',
      action: 'Updated order',
      target: updated.id,
      channel: 'orders',
    })
    return [200, updated]
  })

  mock.onDelete(/\/orders\/[^/]+$/).reply((config) => {
    const orderId = matchById(config.url, 2)
    const removed = removeFromCollection('orders', orderId, {
      actor: 'Commerce Flow',
      action: 'Deleted order',
      channel: 'orders',
    })
    return removed ? [200, removed] : [404, { message: 'Order not found.' }]
  })

  mock.onGet('/escalations').reply((config) => {
    const db = loadMockDb()
    let items = [...db.escalations]
    items = withStatusFilter(items, 'assignedEmployeeId', config.params?.assignedEmployeeId)
    items = withStatusFilter(items, 'status', config.params?.status)
    return [200, items]
  })

  mock.onPut(/\/escalations\/[^/]+$/).reply((config) => {
    const escalationId = matchById(config.url, 2)
    const payload = JSON.parse(config.data)
    const updated = mutateMockDb((db) => {
      const index = db.escalations.findIndex((item) => item.id === escalationId)
      db.escalations[index] = { ...db.escalations[index], ...payload }
      return db.escalations[index]
    })
    appendAuditLog({
      actor: 'Escalation Desk',
      action: 'Updated escalation',
      target: updated.id,
      channel: 'operations',
    })
    return [200, updated]
  })

  mock.onDelete(/\/escalations\/[^/]+$/).reply((config) => {
    const escalationId = matchById(config.url, 2)
    const removed = removeFromCollection('escalations', escalationId, {
      actor: 'Escalation Desk',
      action: 'Deleted escalation',
      channel: 'operations',
    })
    return removed ? [200, removed] : [404, { message: 'Escalation not found.' }]
  })

  mock.onGet('/notifications').reply((config) => {
    const db = loadMockDb()
    let items = [...db.notifications]
    items = withStatusFilter(items, 'userId', config.params?.userId)
    return [200, items]
  })

  mock.onPatch(/\/notifications\/[^/]+\/read$/).reply((config) => {
    const notificationId = matchById(config.url, 2)
    const updated = mutateMockDb((db) => {
      const index = db.notifications.findIndex((item) => item.id === notificationId)
      db.notifications[index] = {
        ...db.notifications[index],
        status: 'read',
      }
      return db.notifications[index]
    })
    return [200, updated]
  })

  mock.onGet('/audit-logs').reply(() => {
    const db = loadMockDb()
    return [200, db.auditLogs]
  })

  mock.onDelete(/\/audit-logs\/[^/]+$/).reply((config) => {
    const logId = matchById(config.url, 2)
    const removed = removeFromCollection('auditLogs', logId)
    return removed ? [200, removed] : [404, { message: 'Audit log not found.' }]
  })

  mock.onGet('/tasks').reply((config) => {
    const db = loadMockDb()
    let items = [...db.tasks]
    items = withStatusFilter(items, 'ownerId', config.params?.ownerId)
    return [200, items]
  })

  mock.onPut(/\/tasks\/[^/]+$/).reply((config) => {
    const taskId = matchById(config.url, 2)
    const payload = JSON.parse(config.data)
    const updated = mutateMockDb((db) => {
      const index = db.tasks.findIndex((item) => item.id === taskId)
      db.tasks[index] = { ...db.tasks[index], ...payload }
      return db.tasks[index]
    })
    return [200, updated]
  })

  mock.onDelete(/\/tasks\/[^/]+$/).reply((config) => {
    const taskId = matchById(config.url, 2)
    const removed = removeFromCollection('tasks', taskId, {
      actor: 'Operations Board',
      action: 'Deleted task',
      channel: 'operations',
    })
    return removed ? [200, removed] : [404, { message: 'Task not found.' }]
  })

  mock.onGet('/support-cases').reply(() => {
    const db = loadMockDb()
    return [200, db.supportCases]
  })

  mock.onPut(/\/support-cases\/[^/]+$/).reply((config) => {
    const caseId = matchById(config.url, 2)
    const payload = JSON.parse(config.data)
    const updated = mutateMockDb((db) => {
      const index = db.supportCases.findIndex((item) => item.id === caseId)
      db.supportCases[index] = {
        ...db.supportCases[index],
        ...payload,
        updatedAt: dayjs().toISOString(),
      }
      return db.supportCases[index]
    })
    return [200, updated]
  })

  mock.onDelete(/\/support-cases\/[^/]+$/).reply((config) => {
    const caseId = matchById(config.url, 2)
    const removed = removeFromCollection('supportCases', caseId, {
      actor: 'Vendor Care',
      action: 'Deleted support case',
      channel: 'operations',
    })
    return removed ? [200, removed] : [404, { message: 'Support case not found.' }]
  })

  mock.onGet('/settings').reply(() => {
    const db = loadMockDb()
    return [200, db.settings]
  })

  mock.onPut('/settings').reply((config) => {
    const payload = JSON.parse(config.data)
    const updated = mutateMockDb((db) => {
      db.settings = { ...db.settings, ...payload }
      return db.settings
    })
    appendAuditLog({
      actor: 'Admin Console',
      action: 'Updated settings',
      target: 'Platform settings',
      channel: 'settings',
    })
    return [200, updated]
  })

  mock.onPost('/demo/reset').reply(() => {
    const db = resetMockDb()
    return [200, db]
  })

  mock.onAny().reply(404, { message: 'Mock endpoint not found.' })

  initialized = true
  return apiClient
}
