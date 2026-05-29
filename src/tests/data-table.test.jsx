import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { DataTable } from '@/components/data-table/data-table'
import { renderWithProviders } from '@/tests/test-utils'

describe('DataTable', () => {
  it('filters rows based on search input', async () => {
    const user = userEvent.setup()
    const columns = [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Region', accessorKey: 'region' },
    ]
    const data = [
      { id: '1', name: 'Aarav Kulkarni', region: 'Pune' },
      { id: '2', name: 'Meera Joshi', region: 'Nashik' },
    ]

    renderWithProviders(
      <DataTable columns={columns} data={data} searchPlaceholder="Search people" />,
    )

    await user.type(screen.getByPlaceholderText('Search people'), 'nashik')

    expect(screen.getByText('Meera Joshi')).toBeInTheDocument()
    expect(screen.queryByText('Aarav Kulkarni')).not.toBeInTheDocument()
  })
})
