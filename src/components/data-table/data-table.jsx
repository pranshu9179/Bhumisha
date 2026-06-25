/* eslint-disable react-hooks/incompatible-library */
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { cn } from '@/lib/utils'

function globalFilter(row, columnId, value) {
  const cell = row.getValue(columnId)
  if (cell == null) return false
  return String(cell).toLowerCase().includes(String(value).toLowerCase())
}

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function getCreatedTime(row) {
  const value = firstPresent(
    row?.createdAt,
    row?.created_at,
    row?.created,
    row?.createdDate,
    row?.created_date,
    row?.query_created_at,
  )
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function getComparableId(row) {
  const value = firstPresent(row?.id, row?._id, row?.order_id, row?.orderId, row?.query_id, row?.queryId)
  if (!value) return null
  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? String(value) : numericValue
}

function sortOldestFirst(data) {
  return [...data].sort((a, b) => {
    const firstTime = getCreatedTime(a)
    const secondTime = getCreatedTime(b)

    if (firstTime !== null && secondTime !== null && firstTime !== secondTime) {
      return firstTime - secondTime
    }

    if (firstTime !== null) return -1
    if (secondTime !== null) return 1
    const firstId = getComparableId(a)
    const secondId = getComparableId(b)
    if (typeof firstId === 'number' && typeof secondId === 'number') return firstId - secondId
    if (firstId !== null && secondId !== null) return String(firstId).localeCompare(String(secondId), undefined, { numeric: true })
    return 0
  })
}

function isIdColumn(column) {
  return column?.accessorKey === 'id' && String(column?.header || '').trim().toLowerCase() === 'id'
}

export function DataTable({
  columns,
  data = [],
  searchPlaceholder = 'Search records',
  actions,
  filterSlot,
  emptyMessage = 'No records found.',
  onRowClick,
  initialPageSize = DEFAULT_PAGE_SIZE,
}) {
  const [sorting, setSorting] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [columnVisibility, setColumnVisibility] = useState({})
  const sortedData = useMemo(() => sortOldestFirst(data), [data])
  const displayColumns = useMemo(
    () => [
      {
        id: '__serial',
        header: 'No.',
        enableSorting: false,
        enableHiding: false,
      },
      ...columns.filter((column) => !isIdColumn(column)),
    ],
    [columns],
  )

  const table = useReactTable({
    data: sortedData,
    columns: displayColumns,
    state: {
      sorting,
      globalFilter: globalFilterValue,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilterValue,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: globalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const visibleColumns = useMemo(
    () => table.getAllLeafColumns().filter((column) => column.getCanHide()),
    [table],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={globalFilterValue}
            onChange={(event) => setGlobalFilterValue(event.target.value)}
            placeholder={searchPlaceholder}
            className="max-w-md"
          />
          {filterSlot}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                <SlidersHorizontal className="h-4 w-4" />
                Columns
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {visibleColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                >
                  {column.columnDef.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className={cn(
                          'flex items-center gap-2',
                          header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted()] ?? null}
                      </button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer' : ''}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === '__serial'
                        ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + rowIndex + 1
                        : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={displayColumns.length} className="py-10 text-center text-slate-400">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          -
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{' '}
          of {table.getFilteredRowModel().rows.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="rounded-full border border-border bg-white px-3 py-2 text-sm text-slate-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
