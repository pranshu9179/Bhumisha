import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/store'

export function renderWithProviders(
  ui,
  { route = '/', initialEntries = [route], preloadedState, store = createAppStore(preloadedState) } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return {
    store,
    ...render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </QueryClientProvider>
      </Provider>,
    ),
  }
}
