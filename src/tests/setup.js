import '@testing-library/jest-dom'
import { afterEach, beforeAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { initializeMockApi } from '@/services/mock/initialize-mock-api'
import { resetMockDb } from '@/services/mock/mock-db'

beforeAll(() => {
  initializeMockApi()

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

beforeEach(() => {
  window.localStorage.clear()
  resetMockDb()
})

afterEach(() => {
  cleanup()
})
