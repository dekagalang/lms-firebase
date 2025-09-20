import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
  queryDocs,
} from "../lib/firestore";
import type {
  AppUser,
  StudentStatus,
  SchoolClass,
  Column,
  UserRole,
} from "../types";
import { serverTimestamp } from "firebase/firestore";
import { getStudentStatusBadgeColor, studentStatusLabels } from "@/consts";

type StudentRow = AppUser & {
  nisn: string;
  gradeLevel: string;
  classId: string;
  parentName: string;
  parentPhone: string;
  admissionDate?: string;
};

const emptyStudent: StudentRow = {
  id: "",
  email: "",
  displayName: "",
  role: "student",
  notification: false,
  firstName: "",
  lastName: "",
  phone: "",
  subject: [],
  studentStatus: "active",
  password: "",
  nisn: "",
  gradeLevel: "",
  classId: "",
  parentName: "",
  parentPhone: "",
  admissionDate: "",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

export default function Students() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [newStudent, setNewStudent] = useState<StudentRow>(emptyStudent);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await queryDocs<AppUser>("users", [
        ["role", "==", "student"],
      ]);
      const mapped = data.map((d) => d as unknown as StudentRow);
      setRows(mapped);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const data = await listDocs<SchoolClass>("classes");
    setClasses(data);
  };

  useEffect(() => {
    fetchRows();
    fetchClasses();
  }, []);

  const columns: Column<StudentRow>[] = [
    { key: "no", label: "No.", render: (_v, _r, i) => i + 1 },
    { key: "displayName", label: "Nama Lengkap" },
    { key: "nisn", label: "NISN" },
    { key: "gradeLevel", label: "Tingkat" },
    {
      key: "classId",
      label: "Kelas",
      render: (value) => {
        const cls = classes.find((c) => c.id === value);
        return cls ? cls.className : "-";
      },
    },
    { key: "parentName", label: "Nama Orang Tua" },
    { key: "parentPhone", label: "No. Telepon Orang Tua" },
    {
      key: "studentStatus",
      label: "Status",
      render: (value) => {
        const status = value as StudentStatus;
        return (
          <span
            className={`px-2 py-1 rounded-lg text-sm font-medium ${getStudentStatusBadgeColor(
              status
            )}`}
          >
            {studentStatusLabels[status]}
          </span>
        );
      },
    },
  ];

  const onChangeNew = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const onAddStudent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = {
        ...newStudent,
        role: "student" as UserRole,
        displayName: newStudent.displayName || newStudent.email,
        admissionDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const id = await createDoc("users", data);
      setRows((prev) => [...prev, { ...data, id }]);
      setNewStudent(emptyStudent);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal menambahkan siswa");
    }
  };

  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const formData = new FormData(e.currentTarget);
    const updates = Object.fromEntries(
      formData.entries()
    ) as Partial<StudentRow>;
    await updateDocById("users", editing.id, {
      ...updates,
      updatedAt: new Date(),
    });
    setEditing(null);
    fetchRows();
  };

  const onDelete = async (row: StudentRow) => {
    if (!confirm(`Hapus data siswa ${row.displayName}?`)) return;
    await deleteDocById("users", row.id);
    fetchRows();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Data Siswa</h2>

        {/* Form Tambah Siswa */}
        <form
          onSubmit={onAddStudent}
          className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Nama Lengkap</label>
            <input
              required
              name="displayName"
              value={newStudent.displayName ?? ""}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">NISN</label>
            <input
              required
              name="nisn"
              value={newStudent.nisn}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Tingkat</label>
            <input
              required
              name="gradeLevel"
              value={newStudent.gradeLevel}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Kelas</label>
            <select
              required
              name="classId"
              value={newStudent.classId}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            >
              <option value="">Pilih Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className} ({cls.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Nama Orang Tua</label>
            <input
              required
              name="parentName"
              value={newStudent.parentName}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">
              No. Telepon Orang Tua
            </label>
            <input
              required
              name="parentPhone"
              value={newStudent.parentPhone}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col md:col-span-3">
            <label className="text-sm text-gray-600">Status</label>
            <select
              required
              name="studentStatus"
              value={newStudent.studentStatus}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            >
              <option value="active">Aktif</option>
              <option value="pending">Menunggu</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
            Tambah Siswa
          </button>
        </form>

        {loading ? (
          <div className="text-sm text-gray-500">Sedang memuat...</div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            onEdit={setEditing}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Modal Edit */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2"
          >
            <h3 className="text-lg font-semibold">Edit Data Siswa</h3>
            {columns.map((c) => (
              <div key={c.key} className="flex flex-col">
                <label className="text-sm text-gray-600">{c.label}</label>
                {c.key === "no" ? (
                  <input
                    disabled
                    value={rows.findIndex((r) => r.id === editing.id) + 1}
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  />
                ) : c.key === "classId" ? (
                  <select
                    name="classId"
                    defaultValue={editing.classId}
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className} ({cls.gradeLevel})
                      </option>
                    ))}
                  </select>
                ) : c.key === "studentStatus" ? (
                  <select
                    name="studentStatus"
                    defaultValue={editing.studentStatus}
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  >
                    <option value="active">Aktif</option>
                    <option value="pending">Menunggu</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                ) : (
                  <input
                    name={c.key as string}
                    defaultValue={String(
                      editing[c.key as keyof StudentRow] || ""
                    )}
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
