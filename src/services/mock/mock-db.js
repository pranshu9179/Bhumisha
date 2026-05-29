import { STORAGE_KEYS } from '@/lib/constants'
import { createId } from '@/lib/utils'
import { seedDatabase } from '@/mocks/db/seed'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function ensureWindow() {
  return typeof window !== 'undefined'
}

export function loadMockDb() {
  if (!ensureWindow()) {
    return clone(seedDatabase)
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.DB)

  if (!raw) {
    const seeded = clone(seedDatabase)
    window.localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(seeded))
    return seeded
  }

  return JSON.parse(raw)
}

export function saveMockDb(db) {
  if (!ensureWindow()) return
  window.localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(db))
}

export function resetMockDb() {
  const seeded = clone(seedDatabase)
  saveMockDb(seeded)
  return seeded
}

export function mutateMockDb(mutator) {
  const db = loadMockDb()
  const result = mutator(db)
  saveMockDb(db)
  return result
}

export function upsertRecord(collection, record, prefix) {
  return mutateMockDb((db) => {
    const index = db[collection].findIndex((item) => item.id === record.id)

    if (index >= 0) {
      db[collection][index] = {
        ...db[collection][index],
        ...record,
      }
      return db[collection][index]
    }

    const created = {
      ...record,
      id: record.id || createId(prefix),
    }
    db[collection].unshift(created)
    return created
  })
}

export function appendAuditLog(entry) {
  return mutateMockDb((db) => {
    db.auditLogs.unshift({
      id: createId('log'),
      timestamp: new Date().toISOString(),
      ...entry,
    })
  })
}

export function removeRecord(collection, id) {
  return mutateMockDb((db) => {
    const index = db[collection].findIndex((item) => item.id === id)

    if (index < 0) {
      return null
    }

    const [removed] = db[collection].splice(index, 1)
    return removed
  })
}
