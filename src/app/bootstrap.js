import { initializeMockApi } from '@/services/mock/initialize-mock-api'

let bootstrapped = false

export function bootstrapApp() {
  if (bootstrapped) {
    return
  }

  if (import.meta.env.MODE === 'test' || import.meta.env.VITE_USE_MOCK_API === 'true') {
    initializeMockApi()
  }

  bootstrapped = true
}
