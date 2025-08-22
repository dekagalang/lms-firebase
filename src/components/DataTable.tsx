import type { DataTableProps } from "../types";

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow border">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3"
              >
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-3"></th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, rowIndex) => (
            <tr key={row.id}>
              {columns.map((c, colIndex) => (
                <td key={colIndex} className="border px-2 py-1">
                  {c.render
                    ? c.key === "no"
                      ? c.render(undefined, row, rowIndex)
                      : c.render(row[c.key], row, rowIndex)
                    : c.key === "no"
                    ? rowIndex + 1
                    : (row[c.key] as React.ReactNode)}
                </td>
              ))}{" "}
              {(onEdit || onDelete) && (
                <td className="px-4 py-2 text-sm text-right space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="px-2 py-1 rounded-lg bg-blue-500 text-white"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="px-2 py-1 rounded-lg bg-rose-500 text-white"
                    >
                      Delete
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
