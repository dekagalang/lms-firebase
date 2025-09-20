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

  const columns: Column<Grade>[] = [
    { key: "no", label: "No.", render: (_v, _r, i) => i + 1 },
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

  const onChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewGrade({
      ...newGrade,
      [e.target.name]:
        e.target.name === "score" ? Number(e.target.value) : e.target.value,
    });

  const onAddGrade = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createDoc("grades", newGrade);
    setNewGrade(emptyGrade);
    fetchRows();
  };

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

  const onDelete = async (row: Grade) => {
    if (!confirm(`Hapus nilai untuk siswa ${row.studentId}?`)) return;
    await deleteDocById("grades", row.id);
    fetchRows();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Data Nilai</h2>

        {(appUser.role === "teacher" || appUser.role === "admin") && (
          <form
            onSubmit={onAddGrade}
            className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Siswa</label>
              <select
                name="studentId"
                value={newGrade.studentId}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Siswa</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.nisn})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Kelas</label>
              <select
                name="classId"
                value={newGrade.classId}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Mata Pelajaran</label>
              <input
                name="subject"
                value={newGrade.subject}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Nilai</label>
              <input
                type="number"
                name="score"
                value={newGrade.score}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Semester</label>
              <input
                name="term"
                value={newGrade.term}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Tahun Ajaran</label>
              <input
                name="year"
                value={newGrade.year}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
              Simpan Nilai
            </button>
          </form>
        )}

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

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2"
          >
            <h3 className="text-lg font-semibold">Edit Nilai</h3>

            <div>
              <label className="text-sm text-gray-600">Siswa</label>
              <select
                name="studentId"
                defaultValue={editing.studentId}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Siswa</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Kelas</label>
              <select
                name="classId"
                defaultValue={editing.classId}
                required
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
              <label className="text-sm text-gray-600">Mata Pelajaran</label>
              <input
                name="subject"
                defaultValue={editing.subject}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Nilai</label>
              <input
                type="number"
                name="score"
                defaultValue={editing.score}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Semester</label>
              <input
                name="term"
                defaultValue={editing.term}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Tahun Ajaran</label>
              <input
                name="year"
                defaultValue={editing.year}
                required
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
