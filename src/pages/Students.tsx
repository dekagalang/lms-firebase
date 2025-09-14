// src/pages/Students.tsx
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
} from "../lib/firestore";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { Student, Column, SchoolClass } from "../types";

const emptyStudent: Omit<Student, "id" | "createdAt" | "updatedAt"> & {
  email: string;
  password: string;
  admissionDate?: string;
  role?: string;
} = {
  fullName: "",
  nisn: "",
  gradeLevel: "",
  classId: "",
  parentName: "",
  parentPhone: "",
  status: "active",
  userId: "",
  email: "",
  password: "",
  admissionDate: "",
  role: "student",
};

export default function Students() {
  const [rows, setRows] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState(emptyStudent);

  /** Ambil data siswa */
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs<Student>("students");
      setRows(data);
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

  /** Kolom tabel */
  const columns: Column<Student>[] = [
    { key: "no", label: "No.", render: (_v, _r, i) => i + 1 },
    { key: "fullName", label: "Nama Lengkap" },
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
      key: "status",
      label: "Status",
      render: (value) => {
        if (typeof value === "string") {
          return (
            <span className="px-2 py-1 rounded-lg bg-gray-100">{value}</span>
          );
        }
        return null;
      },
    },
  ];

  /** Input tambah siswa */
  const onChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });

  /** Tambah siswa baru */
  const onAddStudent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // 1. Buat akun Auth
      const cred: UserCredential = await createUserWithEmailAndPassword(
        auth,
        newStudent.email,
        newStudent.password
      );

      // 2. Buat dokumen di "users" agar tidak muncul RoleSelectionModal
      await setDoc(doc(db, "users", cred.user.uid), {
        id: cred.user.uid,
        email: newStudent.email,
        displayName: newStudent.fullName,
        role: "student",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3. Simpan data siswa di koleksi "students"
      await createDoc("students", {
        ...newStudent,
        userId: cred.user.uid,
        admissionDate: new Date().toISOString(),
        role: "student",
      });

      setNewStudent(emptyStudent);
      fetchRows();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal menambahkan siswa");
    }
  };

  /** Simpan perubahan edit */
  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const formData = new FormData(e.currentTarget);
    const updates: Partial<Student> = Object.fromEntries(formData.entries());
    await updateDocById("students", editing.id, updates);
    setEditing(null);
    fetchRows();
  };

  /** Hapus siswa */
  const onDelete = async (row: Student) => {
    if (!confirm(`Hapus data siswa ${row.fullName}?`)) return;
    await deleteDocById("students", row.id);
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
          <input
            required
            name="fullName"
            placeholder="Nama Lengkap"
            value={newStudent.fullName}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            required
            name="nisn"
            placeholder="NISN"
            value={newStudent.nisn}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            required
            name="gradeLevel"
            placeholder="Tingkat"
            value={newStudent.gradeLevel}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
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
          <input
            required
            name="parentName"
            placeholder="Nama Orang Tua"
            value={newStudent.parentName}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            required
            name="parentPhone"
            placeholder="No. Telepon Orang Tua"
            value={newStudent.parentPhone}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <select
            required
            name="status"
            value={newStudent.status}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          >
            <option value="active">Aktif</option>
            <option value="pending">Menunggu</option>
            <option value="rejected">Ditolak</option>
          </select>
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            value={newStudent.email}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            required
            type="password"
            name="password"
            placeholder="Password"
            value={newStudent.password}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
            Tambah Siswa
          </button>
        </form>

        {/* Tabel Siswa */}
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2 z-50"
          >
            <h3 className="text-lg font-semibold">Edit Data Siswa</h3>
            {columns
              .filter((c) => c.key !== "status")
              .map((c) => (
                <div key={c.key}>
                  <label className="text-sm">{c.label}</label>
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
                  ) : (
                    <input
                      name={c.key}
                      defaultValue={String(editing[c.key] || "")}
                      className="mt-1 w-full border rounded-xl px-3 py-2"
                    />
                  )}
                </div>
              ))}
            <div>
              <label className="text-sm">Status</label>
              <select
                name="status"
                defaultValue={editing.status}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="active">Aktif</option>
                <option value="pending">Menunggu</option>
                <option value="rejected">Ditolak</option>
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
