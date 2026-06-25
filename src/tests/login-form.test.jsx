import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from '@/features/auth/pages/login-page'
import { authApi } from '@/services/api/resources'
import { renderWithProviders } from '@/tests/test-utils'

describe('LoginPage', () => {
  it('submits phone credentials and redirects to the admin dashboard', async () => {
    const user = userEvent.setup()
    vi.spyOn(authApi, 'login').mockResolvedValue({
      token: 'test-token',
      user: {
        id: 1,
        name: 'Admin User',
        phone: '9876543210',
        role: 'admin',
      },
    })

    const { store } = renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<div>Admin home</div>} />
      </Routes>,
      { route: '/login' },
    )

    await user.type(screen.getByPlaceholderText('9876543210'), '9876543210')
    await user.type(screen.getByPlaceholderText('Enter password'), 'Admin@123')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText('Admin home')).toBeInTheDocument()
    })

    expect(store.getState().auth.user?.role).toBe('admin')
    expect(authApi.login).toHaveBeenCalled()
    expect(authApi.login.mock.calls[0][0]).toEqual({
      phone: '9876543210',
      password: 'Admin@123',
    })
  })
})
