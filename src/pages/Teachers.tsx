// Teachers.tsx
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import CreatableSelect from "react-select/creatable";
import type { Column, AppUser, TeacherStatus } from "../types";
import DataTable from "../components/DataTable";
import {
  createDoc,
  queryDocs,
  deleteDocById,
  updateDocById,
} from "../lib/firestore";
import { getTeacherStatusBadgeColor, teacherStatusLabels } from "@/consts";
import type { MultiValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

// opsi default mata pelajaran
const defaultSubjectOptions: Option[] = [
  { value: "Matematika", label: "Matematika" },
  { value: "Fisika", label: "Fisika" },
  { value: "Bahasa Inggris", label: "Bahasa Inggris" },
  { value: "Biologi", label: "Biologi" },
  // bisa tambahan
];

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  subject: [] as Option[],
  teacherStatus: "active" as TeacherStatus,
  role: "teacher",
  displayName: "",
  notification: false,
};

export default function Teachers() {
  const [rows, setRows] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [editing, setEditing] = useState<AppUser | null>(null);

  const [subjectOptions, setSubjectOptions] = useState<Option[]>(
    defaultSubjectOptions
  );

  // State untuk subject pada mode edit
  const [editingSubject, setEditingSubject] = useState<Option[]>([]);

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
    {
      key: "subject",
      label: "Mata Pelajaran",
      render: (value) => {
        if (!Array.isArray(value)) return "";
        return (value as string[]).join(", ");
      },
    },
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

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectChange = (
    newValue: MultiValue<Option>
    // actionMeta: ActionMeta<Option>
  ) => {
    // newValue adalah readonly Option[], kita perlu map ke Option[]
    const opts: Option[] = newValue.map((o) => ({
      value: o.value,
      label: o.label,
    }));
    setForm((prev) => ({
      ...prev,
      subject: opts,
    }));
  };

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createDoc("users", {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      subject: form.subject.map((o) => o.value),
      teacherStatus: form.teacherStatus,
      role: "teacher",
      displayName: form.displayName,
      notification: form.notification,
    });
    setForm(emptyForm);
    fetchRows();
  };

  const onDelete = async (row: AppUser) => {
    if (!confirm(`Hapus data guru ${row.firstName} ${row.lastName}?`)) return;
    if (!row.id) return;
    await deleteDocById("users", row.id);
    fetchRows();
  };

  // Set ngobrol edit
  const openEdit = (row: AppUser) => {
    setEditing(row);
    const opts = row.subject?.map((s) => ({ value: s, label: s })) || [];
    setEditingSubject(opts);
  };

  const handleEditSubjectChange = (
    newValue: MultiValue<Option>
    // actionMeta: ActionMeta<Option>
  ) => {
    const opts: Option[] = newValue.map((o) => ({
      value: o.value,
      label: o.label,
    }));
    setEditingSubject(opts);
  };

  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing || !editing.id) return;

    const fd = new FormData(e.currentTarget);
    const formData = Object.fromEntries(fd.entries());

    const updates: Partial<AppUser> = {
      firstName: String(formData.firstName),
      lastName: String(formData.lastName),
      phone: String(formData.phone),
      teacherStatus: String(formData.teacherStatus) as TeacherStatus,
      subject: editingSubject.map((o) => o.value),
    };

    await updateDocById("users", editing.id, updates);
    setEditing(null);
    setEditingSubject([]);
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
              onChange={handleInputChange}
              required
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Nama Belakang</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleInputChange}
              required
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Telepon</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              required
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-600">Mata Pelajaran</label>
            <CreatableSelect
              isMulti
              options={subjectOptions}
              value={form.subject}
              onChange={handleSubjectChange}
              className="mt-1 w-full"
              onCreateOption={(inputValue) => {
                const newOption: Option = {
                  value: inputValue,
                  label: inputValue,
                };
                setSubjectOptions((prev) => [...prev, newOption]);
                setForm((prev) => ({
                  ...prev,
                  subject: [...prev.subject, newOption],
                }));
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Status</label>
            <select
              name="teacherStatus"
              value={form.teacherStatus}
              onChange={handleInputChange}
              required
              className="border rounded-xl px-3 py-2"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-4"
          >
            Tambah Guru
          </button>
        </form>

        {loading ? (
          <div className="text-sm text-gray-500">Memuat...</div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            onEdit={openEdit}
            onDelete={onDelete}
          />
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2"
          >
            <h3 className="text-lg font-semibold">Edit Guru</h3>

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
              <CreatableSelect
                isMulti
                options={subjectOptions}
                value={editingSubject}
                onChange={handleEditSubjectChange}
                className="mt-1 w-full"
                onCreateOption={(inputValue) => {
                  const newOption: Option = {
                    value: inputValue,
                    label: inputValue,
                  };
                  setSubjectOptions((prev) => [...prev, newOption]);
                  setEditingSubject((prev) => [...prev, newOption]);
                }}
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
                onClick={() => {
                  setEditing(null);
                  setEditingSubject([]);
                }}
                className="px-3 py-2 rounded-xl border"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-blue-600 text-white"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
