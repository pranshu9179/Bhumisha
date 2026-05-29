import { STORAGE_KEYS } from '@/lib/constants'

export function loadJson(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveJson(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadSession() {
  return loadJson(STORAGE_KEYS.SESSION, null)
}

export function saveSession(session) {
  if (!session) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEYS.SESSION)
    }
    return
  }

  saveJson(STORAGE_KEYS.SESSION, session)
}

export function loadPreferences() {
  return loadJson(STORAGE_KEYS.PREFERENCES, null)
}

export function savePreferences(preferences) {
  saveJson(STORAGE_KEYS.PREFERENCES, preferences)
}
