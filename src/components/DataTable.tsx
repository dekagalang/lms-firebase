import type { DataTableProps } from "../types";

export default function DataTable<T extends { id?: string; uid?: string }>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow border grid">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50 sticky top-0 ">
          <tr>
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className={`text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap
                  ${c.key === "no" ? "sticky left-0 bg-gray-50 " : ""}
                `}
              >
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 text-right whitespace-nowrap"></th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, rowIndex) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {columns.map((c, colIndex) => (
                <td
                  key={colIndex}
                  className={`border px-2 py-1 whitespace-nowrap
                    ${c.key === "no" ? "sticky left-0 bg-white " : ""}
                  `}
                >
                  {c.render
                    ? c.key === "no"
                      ? c.render(undefined, row, rowIndex)
                      : c.render(row[c.key], row, rowIndex)
                    : c.key === "no"
                    ? rowIndex + 1
                    : (row[c.key] as React.ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-2 text-sm text-right space-x-2 whitespace-nowrap">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="px-2 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                    >
                      Ubah
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="px-2 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
