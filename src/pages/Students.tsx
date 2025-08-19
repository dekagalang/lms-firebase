import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
} from "../lib/firestore";
import type { Student, Column } from "../types";

const emptyStudent: Omit<Student, "id" | "createdAt" | "updatedAt"> = {
  fullName: "",
  nisn: "",
  gradeLevel: "",
  className: "",
  parentName: "",
  parentPhone: "",
  status: "active",
};

export default function Students() {
  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState(emptyStudent);

  /** ---------------- FETCH ---------------- */
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

  /** ---------------- COLUMNS ---------------- */
  const columns: Column<Student>[] = [
    { key: "fullName", label: "Full Name" },
    { key: "nisn", label: "NISN" },
    { key: "gradeLevel", label: "Grade" },
    { key: "className", label: "Class" },
    { key: "parentName", label: "Parent" },
    { key: "parentPhone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      render: (value: Student[keyof Student]) => {
        if (typeof value === "string") {
          return (
            <span className="px-2 py-1 rounded-lg bg-gray-100">{value}</span>
          );
        }
        return null;
      },
    },
  ];

  /** ---------------- CREATE ---------------- */
  const onChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });

  const onAddStudent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createDoc("students", newStudent);
    setNewStudent(emptyStudent);
    fetchRows();
  };

  /** ---------------- EDIT / UPDATE ---------------- */
  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;

    const formData = new FormData(e.currentTarget);
    const updates: Partial<Student> = Object.fromEntries(formData.entries());
    await updateDocById("students", editing.id, updates);
    setEditing(null);
    fetchRows();
  };

  /** ---------------- DELETE ---------------- */
  const onDelete = async (row: Student) => {
    if (!confirm(`Delete ${row.fullName}?`)) return;
    await deleteDocById("students", row.id);
    fetchRows();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Students</h2>

      {/* Form Tambah Murid */}
      <form
        onSubmit={onAddStudent}
        className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <input
          name="fullName"
          placeholder="Full Name"
          value={newStudent.fullName}
          onChange={onChangeNew}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="nisn"
          placeholder="NISN"
          value={newStudent.nisn}
          onChange={onChangeNew}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="gradeLevel"
          placeholder="Grade"
          value={newStudent.gradeLevel}
          onChange={onChangeNew}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="className"
          placeholder="Class"
          value={newStudent.className}
          onChange={onChangeNew}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="parentName"
          placeholder="Parent Name"
          value={newStudent.parentName}
          onChange={onChangeNew}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="parentPhone"
          placeholder="Parent Phone"
          value={newStudent.parentPhone}
          onChange={onChangeNew}
          className="border rounded-xl px-3 py-2"
        />
        <select
          name="status"
          value={newStudent.status}
          onChange={onChangeNew}
          className="border rounded-xl px-3 py-2 md:col-span-3"
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
          Add Student
        </button>
      </form>

      {/* Tabel Murid */}
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

      {/* Modal Edit */}
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
}
