import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/protected-route'
import { renderWithProviders } from '@/tests/test-utils'

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <div>Admin dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { route: '/admin' },
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('redirects mismatched roles to unauthorized', () => {
    renderWithProviders(
      <Routes>
        <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <div>Admin dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      {
        route: '/admin',
        preloadedState: {
          auth: {
            session: {
              user: {
                id: 'user_vendor_1',
                role: 'vendor',
                name: 'Vendor Demo',
              },
            },
            user: {
              id: 'user_vendor_1',
              role: 'vendor',
              name: 'Vendor Demo',
            },
            redirectTo: '/vendor',
          },
        },
      },
    )

    expect(screen.getByText('Unauthorized page')).toBeInTheDocument()
  })
})
