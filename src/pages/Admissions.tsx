import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { createDoc, listDocs } from "../lib/firestore";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import type { SchoolClass, Student } from "../types";

interface AdmissionForm
  extends Omit<Student, "id" | "createdAt" | "updatedAt" | "userId"> {
  admissionDate?: string;
  email: string;
  password: string;
}

const initial: AdmissionForm = {
  fullName: "",
  nisn: "",
  gradeLevel: "",
  classId: "",
  parentName: "",
  parentPhone: "",
  status: "active",
  email: "",
  password: "",
};

export default function Admissions() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  // Ambil daftar kelas
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await listDocs<SchoolClass>("classes");
        setClasses(data);
      } catch (err) {
        console.error("Gagal ambil classes:", err);
      }
    };
    fetchClasses();
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Buat akun Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // 2. Simpan data siswa ke Firestore, termasuk UID
      await createDoc("users", {
        ...form,
        userId: userCredential.user.uid,
        admissionDate: new Date().toISOString(),
        role: "student",
      });

      setForm(initial);
      setMessage({ type: "success", text: "User siswa berhasil ditambahkan." });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menambahkan user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Pendaftaran Siswa</h2>
      <form
        onSubmit={onSubmit}
        className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Nama Lengkap */}
        <div>
          <label className="text-sm">
            Nama Lengkap<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            required
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </div>

        {/* NISN */}
        <div>
          <label className="text-sm">
            NISN<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            required
            name="nisn"
            value={form.nisn}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </div>

        {/* Tingkat Kelas */}
        <div>
          <label className="text-sm">
            Tingkat Kelas<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            required
            name="gradeLevel"
            value={form.gradeLevel}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </div>

        {/* Kelas */}
        <div>
          <label className="text-sm">
            Kelas<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            required
            name="classId"
            value={form.classId}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          >
            <option value="">Pilih Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className} ({cls.gradeLevel})
              </option>
            ))}
          </select>
        </div>

        {/* Nama Orang Tua */}
        <div>
          <label className="text-sm">
            Nama Orang Tua<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            required
            name="parentName"
            value={form.parentName}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </div>

        {/* No. HP Orang Tua */}
        <div>
          <label className="text-sm">
            No. HP Orang Tua<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            required
            name="parentPhone"
            value={form.parentPhone}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-sm">
            Status<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            required
            name="status"
            value={form.status}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          >
            <option value="active">Aktif</option>
            <option value="pending">Menunggu</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm">
            Email<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm">
            Password<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            required
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </div>

        {/* Tombol Submit */}
        <div className="md:col-span-2 flex items-center gap-2">
          <button
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
