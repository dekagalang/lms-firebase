import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  deleteDocById,
  updateDocById,
} from "../lib/firestore";
import type { Column, SchoolClass } from "../types";

interface ClassFormData {
  className: string;
  gradeLevel: string;
  homeroomTeacher: string;
  capacity: string;
}

const empty: ClassFormData = {
  className: "",
  gradeLevel: "",
  homeroomTeacher: "",
  capacity: "30",
};
export default function Classes() {
  const [rows, setRows] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ClassFormData>(empty);
  const [editing, setEditing] = useState<SchoolClass | null>(null);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs<SchoolClass>("classes");
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const columns: Column<SchoolClass>[] = [
    {
      key: "no",
      label: "No.",
      render: (_value, _row, index) => index + 1,
    },
    { key: "className", label: "Kelas" },
    { key: "gradeLevel", label: "Tingkat" },
    { key: "homeroomTeacher", label: "Wali Kelas" },
    { key: "capacity", label: "Kapasitas" },
  ];

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createDoc("classes", {
      ...form,
      capacity: parseInt(form.capacity || "0", 10),
    });
    setForm(empty);
    fetchRows();
  };
  const onDelete = async (row: SchoolClass) => {
    if (!confirm(`Hapus kelas ${row.className}?`)) return;
    await deleteDocById("classes", row.id);
    fetchRows();
  };
  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;

    const fd = new FormData(e.currentTarget);
    const updates: Partial<SchoolClass> = Object.fromEntries(fd.entries());

    if (typeof updates.capacity === "string") {
      updates.capacity = parseInt(updates.capacity, 10);
    }

    // Convert schedule to plain objects if present
    if (updates.schedule && Array.isArray(updates.schedule)) {
      updates.schedule = updates.schedule.map((item) =>
        typeof item === "object" ? { ...item } : item
      );
    }

    await updateDocById("classes", editing.id, updates);
    setEditing(null);
    fetchRows();
  };
  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Kelas</h2>
        <form
          onSubmit={onCreate}
          className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          <input
            name="className"
            placeholder="Kelas (contoh: 10A)"
            value={form.className}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          />
          <input
            name="gradeLevel"
            placeholder="Tingkat (contoh: 10)"
            value={form.gradeLevel}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          />
          <input
            name="homeroomTeacher"
            placeholder="Wali Kelas"
            value={form.homeroomTeacher}
            onChange={onChange}
            className="border rounded-xl px-3 py-2 md:col-span-2"
          />
          <input
            name="capacity"
            type="number"
            placeholder="Kapasitas"
            value={form.capacity}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          />
          <div className="md:col-span-5 flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white">
              Tambah Kelas
            </button>
          </div>
        </form>
        {loading ? (
          <div className="text-sm text-gray-500">Memuat...</div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            onEdit={setEditing}
            onDelete={onDelete}
          />
        )}
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2 z-50"
          >
            <h3 className="text-lg font-semibold">Edit Kelas</h3>
            {columns.map((c) => (
              <div key={c.key}>
                <label className="text-sm">{c.label}</label>
                {c.key === "no" ? (
                  <input
                    disabled
                    value={rows.findIndex((r) => r.id === editing.id) + 1}
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  />
                ) : (
                  <input
                    name={c.key}
                    defaultValue={String(editing[c.key] || "")}
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-3 py-2 rounded-xl border"
              >
                Batal
              </button>
              <button className="px-3 py-2 rounded-xl bg-blue-600 text-white">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
