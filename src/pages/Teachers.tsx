import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import type { Column, AppUser, TeacherStatus } from "../types";
import {
  createDoc,
  queryDocs,
  deleteDocById,
  updateDocById,
} from "../lib/firestore";
import { getTeacherStatusBadgeColor, teacherStatusLabels } from "@/consts";

const empty: Omit<
  AppUser,
  "id" | "createdAt" | "updatedAt" | "email" | "password"
> = {
  firstName: "",
  lastName: "",
  phone: "",
  subject: [],
  teacherStatus: "active",
  role: "teacher",
  displayName: "",
  notification: false,
};

export default function Teachers() {
  const [rows, setRows] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<AppUser | null>(null);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await queryDocs<AppUser>("users", [
        ["role", "==", "teacher"],
      ]);
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const columns: Column<AppUser>[] = [
    { key: "no", label: "No.", render: (_v, _r, i) => i + 1 },
    { key: "firstName", label: "Nama Depan" },
    { key: "lastName", label: "Nama Belakang" },
    { key: "phone", label: "Telepon" },
    { key: "subject", label: "Mata Pelajaran" },
    {
      key: "teacherStatus",
      label: "Status",
      render: (value) => {
        const status = value as TeacherStatus;
        return (
          <span
            className={`px-2 py-1 rounded-lg ${getTeacherStatusBadgeColor(
              status
            )}`}
          >
            {teacherStatusLabels[status]}
          </span>
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
    await createDoc("users", {
      ...form,
      subject: form.subject || [],
      role: "teacher",
    });
    setForm(empty);
    fetchRows();
  };

  const onDelete = async (row: AppUser) => {
    if (!confirm(`Hapus data guru ${row.firstName} ${row.lastName}?`)) return;
    if (!row.id) return;
    await deleteDocById("users", row.id);
    fetchRows();
  };

  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing?.id) return;
    const fd = new FormData(e.currentTarget);
    const formData = Object.fromEntries(fd.entries());
    const updates = {
      ...formData,
      subject: formData.subject
        ? String(formData.subject)
            .split(",")
            .map((s) => s.trim())
        : [],
    };
    await updateDocById("users", editing.id, updates);
    setEditing(null);
    fetchRows();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Guru</h2>

        <form
          onSubmit={onCreate}
          className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Nama Depan</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              required
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Nama Belakang</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              required
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Telepon</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              required
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-600">
              Mata Pelajaran (pisahkan koma)
            </label>
            <input
              name="subject"
              value={form.subject?.join(", ")}
              onChange={onChange}
              required
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Status</label>
            <select
              name="teacherStatus"
              value={form.teacherStatus}
              onChange={onChange}
              required
              className="border rounded-xl px-3 py-2"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          {/* Tombol submit memenuhi grid, sama dengan Schedule */}
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-4">
            Tambah Guru
          </button>
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
            <h3 className="text-lg font-semibold">Edit Guru</h3>
            {/* Input edit sama seperti sebelumnya */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Nama Depan</label>
              <input
                name="firstName"
                defaultValue={editing.firstName}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Nama Belakang</label>
              <input
                name="lastName"
                defaultValue={editing.lastName}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Telepon</label>
              <input
                name="phone"
                defaultValue={editing.phone}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Mata Pelajaran</label>
              <input
                name="subject"
                defaultValue={editing.subject?.join(", ") || ""}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Status</label>
              <select
                name="teacherStatus"
                defaultValue={editing.teacherStatus}
                required
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
    </>
  );
}
