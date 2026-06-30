import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { queryClient } from '@/app/query-client'
import { store } from '@/store'

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </HashRouter>
      </QueryClientProvider>
    </Provider>
  )
}
