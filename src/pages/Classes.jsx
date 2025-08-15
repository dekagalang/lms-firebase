import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  deleteDocById,
  updateDocById,
} from "../lib/firestore";
const empty = {
  className: "",
  gradeLevel: "",
  homeroomTeacher: "",
  capacity: "30",
};
export default function Classes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs("classes");
      setRows(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRows();
  }, []);
  const columns = [
    { key: "className", label: "Class" },
    { key: "gradeLevel", label: "Grade" },
    { key: "homeroomTeacher", label: "Homeroom Teacher" },
    { key: "capacity", label: "Capacity" },
  ];
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onCreate = async (e) => {
    e.preventDefault();
    await createDoc("classes", {
      ...form,
      capacity: parseInt(form.capacity || "0", 10),
    });
    setForm(empty);
    fetchRows();
  };
  const onDelete = async (row) => {
    if (!confirm(`Delete class ${row.className}?`)) return;
    await deleteDocById("classes", row.id);
    fetchRows();
  };
  const onSaveEdit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updates = Object.fromEntries(fd.entries());
    if (updates.capacity) updates.capacity = parseInt(updates.capacity, 10);
    await updateDocById("classes", editing.id, updates);
    setEditing(null);
    fetchRows();
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Classes</h2>
      <form
        onSubmit={onCreate}
        className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          name="className"
          placeholder="Class (e.g., 10A)"
          value={form.className}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="gradeLevel"
          placeholder="Grade (e.g., 10)"
          value={form.gradeLevel}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="homeroomTeacher"
          placeholder="Homeroom Teacher"
          value={form.homeroomTeacher}
          onChange={onChange}
          className="border rounded-xl px-3 py-2 md:col-span-2"
        />
        <input
          name="capacity"
          type="number"
          placeholder="Capacity"
          value={form.capacity}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
        />
        <div className="md:col-span-5 flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white">
            Add Class
          </button>
        </div>
      </form>
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          onEdit={setEditing}
          onDelete={onDelete}
        />
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 w-full max-w-lg space-y-3"
          >
            <h3 className="text-lg font-semibold">Edit Class</h3>
            {columns.map((c) => (
              <div key={c.key}>
                <label className="text-sm">{c.label}</label>
                <input
                  name={c.key}
                  defaultValue={editing[c.key] || ""}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                />
              </div>
            ))}
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
}
