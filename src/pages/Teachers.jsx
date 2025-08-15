import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  deleteDocById,
  updateDocById,
} from "../lib/firestore";
const empty = {
  fullName: "",
  email: "",
  phone: "",
  subjects: "",
  status: "active",
};
export default function Teachers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs("teachers");
      setRows(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRows();
  }, []);
  const columns = [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subjects", label: "Subjects" },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span className="px-2 py-1 rounded-lg bg-gray-100">{v}</span>
      ),
    },
  ];
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onCreate = async (e) => {
    e.preventDefault();
    await createDoc("teachers", form);
    setForm(empty);
    fetchRows();
  };
  const onDelete = async (row) => {
    if (!confirm(`Delete ${row.fullName}?`)) return;
    await deleteDocById("teachers", row.id);
    fetchRows();
  };
  const onSaveEdit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updates = Object.fromEntries(fd.entries());
    await updateDocById("teachers", editing.id, updates);
    setEditing(null);
    fetchRows();
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Teachers</h2>
      <form
        onSubmit={onCreate}
        className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={onChange}
          className="border rounded-xl px-3 py-2 md:col-span-2"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="subjects"
          placeholder="Subjects (comma separated)"
          value={form.subjects}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
        />
        <div className="md:col-span-5 flex items-center gap-2">
          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white">
            Add Teacher
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
            <h3 className="text-lg font-semibold">Edit Teacher</h3>
            {columns
              .filter((c) => c.key !== "status")
              .map((c) => (
                <div key={c.key}>
                  <label className="text-sm">{c.label}</label>
                  <input
                    name={c.key}
                    defaultValue={editing[c.key] || ""}
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
                <option value="inactive">Inactive</option>
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
}
