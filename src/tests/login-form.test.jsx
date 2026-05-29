import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import LoginPage from '@/features/auth/pages/login-page'
import { renderWithProviders } from '@/tests/test-utils'

describe('LoginPage', () => {
  it('submits seeded admin credentials and redirects to the admin dashboard', async () => {
    const user = userEvent.setup()

    const { store } = renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<div>Admin home</div>} />
      </Routes>,
      { route: '/login' },
    )

    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText('Admin home')).toBeInTheDocument()
    })

    expect(store.getState().auth.user?.role).toBe('admin')
  })
})
