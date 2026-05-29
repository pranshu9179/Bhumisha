import { initializeMockApi } from '@/services/mock/initialize-mock-api'

let bootstrapped = false

export function bootstrapApp() {
  if (bootstrapped) {
    return
  }

  initializeMockApi()
  bootstrapped = true
}
