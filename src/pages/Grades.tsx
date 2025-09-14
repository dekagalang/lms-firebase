import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
} from "../lib/firestore";
import { AppUser, Student, SchoolClass, Column, Grade } from "../types";

interface GradesProps {
  appUser: AppUser;
}

const emptyGrade: Omit<Grade, "id" | "createdAt" | "updatedAt"> = {
  studentId: "",
  classId: "",
  subject: "",
  score: 0,
  term: "",
  year: "",
};

export default function Grades({ appUser }: GradesProps) {
  const [rows, setRows] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [newGrade, setNewGrade] = useState(emptyGrade);

  /** ---------------- FETCH ---------------- */
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs<Grade>("grades");

      const filtered =
        appUser.role === "student"
          ? data.filter((g) => g.studentId === appUser.id)
          : data;

      setRows(filtered);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    const data = await listDocs<Student>("students");
    setStudents(data);
  };

  const fetchClasses = async () => {
    const data = await listDocs<SchoolClass>("classes");
    setClasses(data);
  };

  useEffect(() => {
    fetchRows();
    fetchStudents();
    fetchClasses();
  }, []);

  /** ---------------- COLUMNS ---------------- */
  const columns: Column<Grade>[] = [
    {
      key: "no",
      label: "No.",
      render: (_value, _row, index) => index + 1,
    },
    {
      key: "studentId",
      label: "Nama Siswa",
      render: (value) => {
        const student = students.find((s) => s.id === value);
        return <span>{student ? student.fullName : String(value)}</span>;
      },
    },
    {
      key: "classId",
      label: "Kelas",
      render: (value) => {
        const cls = classes.find((c) => c.id === value);
        return <span>{cls ? cls.className : String(value)}</span>;
      },
    },
    { key: "subject", label: "Mata Pelajaran" },
    { key: "term", label: "Semester" },
    { key: "year", label: "Tahun Ajaran" },
    {
      key: "score",
      label: "Nilai",
      render: (value) => <span className="font-semibold">{String(value)}</span>,
    },
  ];

  /** ---------------- CREATE ---------------- */
  const onChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewGrade({
      ...newGrade,
      [e.target.name]:
        e.target.name === "score" ? Number(e.target.value) : e.target.value,
    });

  const onAddGrade = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newGrade.studentId || !newGrade.classId || !newGrade.subject) return;

    await createDoc("grades", newGrade);
    setNewGrade(emptyGrade);
    fetchRows();
  };

  /** ---------------- EDIT / UPDATE ---------------- */
  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing?.id) return;

    const formData = new FormData(e.currentTarget);
    const updates: Partial<Grade> = Object.fromEntries(formData.entries());
    if (updates.score) updates.score = Number(updates.score);

    await updateDocById("grades", editing.id, updates);
    setEditing(null);
    fetchRows();
  };

  /** ---------------- DELETE ---------------- */
  const onDelete = async (row: Grade) => {
    if (!row.id) return;
    if (!confirm(`Hapus nilai untuk siswa ${row.studentId}?`)) return;

    await deleteDocById("grades", row.id);
    fetchRows();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Data Nilai</h2>

        {/* Form hanya untuk guru/admin */}
        {(appUser.role === "teacher" || appUser.role === "admin") && (
          <form
            onSubmit={onAddGrade}
            className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <select
              name="studentId"
              value={newGrade.studentId}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            >
              <option value="">Pilih Siswa</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.nisn})
                </option>
              ))}
            </select>

            <select
              name="classId"
              value={newGrade.classId}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            >
              <option value="">Pilih Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className}
                </option>
              ))}
            </select>

            <input
              name="subject"
              placeholder="Mata Pelajaran"
              value={newGrade.subject}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />

            <input
              type="number"
              name="score"
              placeholder="Nilai"
              value={newGrade.score}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />

            <input
              name="term"
              placeholder="Semester (misal: Ganjil)"
              value={newGrade.term}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />

            <input
              name="year"
              placeholder="Tahun Ajaran (misal: 2025/2026)"
              value={newGrade.year}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2"
            />

            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
              Simpan Nilai
            </button>
          </form>
        )}

        {/* Tabel Nilai */}
        {loading ? (
          <div className="text-sm text-gray-500">Sedang memuat...</div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            onEdit={
              appUser.role === "teacher" || appUser.role === "admin"
                ? setEditing
                : undefined
            }
            onDelete={
              appUser.role === "teacher" || appUser.role === "admin"
                ? onDelete
                : undefined
            }
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
            <h3 className="text-lg font-semibold">Edit Nilai</h3>

            <div>
              <label className="text-sm">Siswa</label>
              <select
                name="studentId"
                defaultValue={editing.studentId}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Siswa</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">Kelas</label>
              <select
                name="classId"
                defaultValue={editing.classId}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">Mata Pelajaran</label>
              <input
                name="subject"
                defaultValue={editing.subject}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm">Nilai</label>
              <input
                type="number"
                name="score"
                defaultValue={editing.score}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm">Semester</label>
              <input
                name="term"
                defaultValue={editing.term}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm">Tahun Ajaran</label>
              <input
                name="year"
                defaultValue={editing.year}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
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
