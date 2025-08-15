import { useEffect, useState, FormEvent } from "react";
import DataTable from "../components/DataTable";
import { listDocs, deleteDocById, updateDocById } from "../lib/firestore";
import type { Student } from "../types";
export default function Students() {
  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Student | null>(null);
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs<Student>("students");
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const columns: Array<{
    key: keyof Student;
    label: string;
    render?: (value: any) => JSX.Element;
  }> = [
    { key: "fullName", label: "Full Name" },
    { key: "nisn", label: "NISN" },
    { key: "gradeLevel", label: "Grade" },
    { key: "className", label: "Class" },
    { key: "parentName", label: "Parent" },
    { key: "parentPhone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      render: (v: string) => (
        <span className="px-2 py-1 rounded-lg bg-gray-100">{v}</span>
      ),
    },
  ];

  const onDelete = async (row: Student) => {
    if (!confirm(`Delete ${row.fullName}?`)) return;
    await deleteDocById("students", row.id);
    fetchRows();
  };
  const onEdit = (row: Student) => setEditing(row);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;

    const formData = new FormData(e.currentTarget);
    const updates: Partial<Student> = Object.fromEntries(formData.entries());
    await updateDocById("students", editing.id, updates);
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Students</h2>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
        {editing && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
            <form
              onSubmit={onSaveEdit}
              className="bg-white rounded-2xl p-4 w-full max-w-lg space-y-3"
            >
              <h3 className="text-lg font-semibold">Edit Student</h3>
              {columns
                .filter((c) => c.key !== "status")
                .map((c) => (
                  <div key={c.key}>
                    <label className="text-sm">{c.label}</label>
                    <input
                      name={c.key}
                      defaultValue={String(editing[c.key] || "")}
                      className="mt-1 w-full border rounded-xl px-3 py-2"
                    />
                  </div>
                ))}
              <div>
                <label className="text-sm">Status</label>
                <select
                  name="status"
                  defaultValue={editing.status}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-3 py-2 rounded-xl border"
                >
                  Cancel
                </button>
                <button className="px-3 py-2 rounded-xl bg-blue-600 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };
}
