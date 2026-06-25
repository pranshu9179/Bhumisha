import { screen } from '@testing-library/react'
import { AppSidebar } from '@/components/app-shell/app-sidebar'
import { renderWithProviders } from '@/tests/test-utils'

describe('AppSidebar', () => {
  it('shows role-specific admin navigation', () => {
    renderWithProviders(<AppSidebar role="admin" />)

    expect(screen.getByText('Marketplace Taxonomy')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument()
    expect(screen.queryByText('Dispatch')).not.toBeInTheDocument()
  })

  it('shows vendor commerce navigation without admin modules', () => {
    renderWithProviders(<AppSidebar role="vendor" />)

    expect(screen.getByText('Dispatch')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.queryByText('Users')).not.toBeInTheDocument()
  })
})
