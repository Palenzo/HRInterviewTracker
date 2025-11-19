import * as React from 'react'
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getPaginationRowModel, getSortedRowModel, SortingState } from '@tanstack/react-table'
import { Table, THead, TBody, TR, TH, TD, TableContainer } from '@/components/ui/table'

export function DataTable<T>({ columns, data }: { columns: ColumnDef<T, any>[], data: T[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const table = useReactTable({
    columns,
    data,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  return (
    <div className="space-y-3">
      <TableContainer>
        <Table>
          <THead>
            {table.getHeaderGroups().map(hg => (
              <TR key={hg.id}>
                {hg.headers.map(header => (
                  <TH key={header.id}>
                    {header.isPlaceholder ? null : (
                      <button
                        className="inline-flex items-center gap-1 hover:opacity-80"
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort?.()}
                        title={header.column.getCanSort?.() ? 'Toggle sort' : ''}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <span>▲</span>}
                        {header.column.getIsSorted() === 'desc' && <span>▼</span>}
                      </button>
                    )}
                  </TH>
                ))}
              </TR>
            ))}
          </THead>
          <TBody>
            {table.getRowModel().rows.map(row => (
              <TR key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TD key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TD>
                ))}
              </TR>
            ))}
          </TBody>
        </Table>
      </TableContainer>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}</div>
        <div className="flex gap-2">
          <button className="rounded-2xl border px-3 py-1.5 text-sm disabled:opacity-50" onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</button>
          <button className="rounded-2xl border px-3 py-1.5 text-sm disabled:opacity-50" onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
        </div>
      </div>
    </div>
  )
}
