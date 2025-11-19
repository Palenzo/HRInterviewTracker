import * as React from 'react'
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getPaginationRowModel } from '@tanstack/react-table'
import { Table, THead, TBody, TR, TH, TD, TableContainer } from '@/components/ui/table'

export function DataTable<T>({ columns, data }: { columns: ColumnDef<T, any>[], data: T[] }) {
  const table = useReactTable({ columns, data, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel() })
  return (
    <div className="space-y-3">
      <TableContainer>
        <Table>
          <THead>
            {table.getHeaderGroups().map(hg => (
              <TR key={hg.id}>
                {hg.headers.map(header => (
                  <TH key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
