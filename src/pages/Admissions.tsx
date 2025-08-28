import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { createDoc, listDocs } from "../lib/firestore";
import type { SchoolClass, Student } from "../types";

interface AdmissionForm
  extends Omit<Student, "id" | "createdAt" | "updatedAt" | "userId"> {
  admissionDate?: string;
  role?: string;
  email?: string;
  password?: string;
}

const initial: AdmissionForm = {
  fullName: "",
  nisn: "",
  gradeLevel: "",
  classId: "",
  parentName: "",
  parentPhone: "",
  status: "active",
  role: "student",
  email: "",
  password: "",
};

export default function Admissions() {
  const [form, setForm] = useState<AdmissionForm>(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  // Load classes dari Firestore
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
      await createDoc("users", {
        ...form,
        admissionDate: new Date().toISOString(),
        role: "student", // default role
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
        {(Object.keys(initial) as Array<keyof AdmissionForm>).map((key) =>
          key === "status" ? (
            <div key={key}>
              <label className="text-sm">Status</label>
              <select
                required
                name={key}
                value={form[key] || ""}
                onChange={onChange}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="active">Aktif</option>
                <option value="pending">Menunggu</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          ) : key === "role" ? null : key === "classId" ? (
            <div key={key}>
              <label className="text-sm">Kelas</label>
              <select
                required
                name={key}
                value={form[key] || ""}
                onChange={onChange}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
          ) : key === "password" ? (
            <div key={key}>
              <label className="text-sm">Password</label>
              <input
                required
                type="password"
                name={key}
                value={form[key] || ""}
                onChange={onChange}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
          ) : (
            <div key={key}>
              <label className="text-sm capitalize">
                {key === "fullName"
                  ? "Nama Lengkap"
                  : key === "nisn"
                  ? "NISN"
                  : key === "gradeLevel"
                  ? "Tingkat Kelas"
                  : key === "parentName"
                  ? "Nama Orang Tua"
                  : key === "parentPhone"
                  ? "No. HP Orang Tua"
                  : key === "email"
                  ? "Email / Username"
                  : key}
              </label>
              <input
                required
                type={key === "email" ? "email" : "text"}
                name={key}
                value={form[key] || ""}
                onChange={onChange}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
          )
        )}

        {/* Submit */}
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
