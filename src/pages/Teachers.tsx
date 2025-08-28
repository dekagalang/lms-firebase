import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import type { Column, Teacher } from "../types";
import {
  createDoc,
  listDocs,
  deleteDocById,
  updateDocById,
} from "../lib/firestore";

const empty: Omit<Teacher, "id" | "createdAt" | "updatedAt"> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: [],
  status: "active",
};

export default function Teachers() {
  const [rows, setRows] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  type TeacherFormData = Omit<Teacher, "id" | "createdAt" | "updatedAt">;

  const [form, setForm] = useState<TeacherFormData>(empty);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const data: Teacher[] = await listDocs("teachers");
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const columns: Column<Teacher>[] = [
    {
      key: "no",
      label: "No.",
      render: (_value, _row, index) => index + 1,
    },
    { key: "firstName", label: "Nama Depan" },
    { key: "lastName", label: "Nama Belakang" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telepon" },
    { key: "subject", label: "Mata Pelajaran" },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const status = value as Teacher["status"];
        return (
          <span className="px-2 py-1 rounded-lg bg-gray-100">{status}</span>
        );
      },
    },
  ];

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value =
      e.target.name === "subject"
        ? e.target.value.split(",").map((s) => s.trim())
        : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Convert form data to match Firestore format
    const payload = {
      ...form,
      subject: form.subject || [], // Ensure array
    };
    await createDoc("teachers", payload);
    setForm(empty);
    fetchRows();
  };

  const onDelete = async (row: Teacher) => {
    if (!confirm(`Hapus data guru ${row.firstName} ${row.lastName}?`)) return;
    if (!row.id) return;
    await deleteDocById("teachers", row.id);
    fetchRows();
  };

  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing?.id) return;
    const fd = new FormData(e.currentTarget);
    const formData = Object.fromEntries(fd.entries());

    // Convert subject string to array
    const updates: Partial<TeacherFormData> = {
      ...formData,
      subject: formData.subject
        ? String(formData.subject)
            .split(",")
            .map((s) => s.trim())
        : [],
    };

    await updateDocById("teachers", editing.id, updates);
    setEditing(null);
    fetchRows();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Guru</h2>

      {/* Form Tambah */}
      <form
        onSubmit={onCreate}
        className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          name="firstName"
          placeholder="Nama Depan"
          value={form.firstName}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="lastName"
          placeholder="Nama Belakang"
          value={form.lastName}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
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
          placeholder="Telepon"
          value={form.phone}
          onChange={onChange}
          className="border rounded-xl px-3 py-2"
        />
        <input
          name="subject"
          placeholder="Mata Pelajaran (pisahkan dengan koma)"
          value={form.subject.join(", ")}
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
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white">
            Tambah Guru
          </button>
        </div>
      </form>

      {/* Table */}
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

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2 z-50"
          >
            <h3 className="text-lg font-semibold">Edit Guru</h3>
            <div>
              <label className="text-sm">Nama Depan</label>
              <input
                name="firstName"
                defaultValue={editing.firstName}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Nama Belakang</label>
              <input
                name="lastName"
                defaultValue={editing.lastName}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input
                name="email"
                defaultValue={editing.email}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Telepon</label>
              <input
                name="phone"
                defaultValue={editing.phone}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Mata Pelajaran</label>
              <input
                name="subject"
                defaultValue={editing.subject.join(", ")}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Status</label>
              <select
                name="status"
                defaultValue={editing.status}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
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
    </div>
  );
}
