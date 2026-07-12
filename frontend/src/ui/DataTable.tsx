import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

// Permite que cada columna declare su alineación sin que la tabla tenga que
// saber de qué feature viene.
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "center";
  }
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  initialSorting?: SortingState;
  emptyMessage: string;
}

/**
 * Tabla tonta y reutilizable: ordena, pinta y nada más.
 * La usan Rankings y Library con juegos de columnas distintos.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  initialSorting = [],
  emptyMessage,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-surface">
              {headerGroup.headers.map((header) => {
                const align = header.column.columnDef.meta?.align ?? "center";

                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`border-b border-line px-2 py-3 text-xs font-semibold uppercase tracking-wider text-muted ${
                      header.column.getCanSort() ? "cursor-pointer select-none hover:text-ink" : ""
                    } ${align === "left" ? "text-left" : "text-center"}`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <SortIndicator direction={header.column.getIsSorted()} />
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="group border-b border-line/60 last:border-0 hover:bg-surface/60"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-1 py-0.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-muted">{emptyMessage}</p>
      )}
    </div>
  );
}

function SortIndicator({ direction }: { direction: false | "asc" | "desc" }) {
  if (!direction) return null;
  return <span className="ml-1 text-accent">{direction === "asc" ? "↑" : "↓"}</span>;
}
