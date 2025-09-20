import { useEffect, useState, ChangeEvent, FormEvent, useRef } from "react";
import DataTable from "../components/DataTable";
import Pagination, { PaginationHandle } from "../components/Pagination";
import { AppUser, Attendance, Student, Column } from "@/types";
import {
  createDoc,
  updateDocById,
  deleteDocById,
  listDocs,
} from "@/lib/firestore";

interface AttendanceProps {
  appUser: AppUser;
}

const emptyRecord: Omit<Attendance, "id" | "createdAt" | "updatedAt"> = {
  studentId: "",
  classId: "",
  date: "",
  status: "present",
  note: "",
};

export default function AttendancePage({ appUser }: AttendanceProps) {
  const [rows, setRows] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newRecord, setNewRecord] = useState(emptyRecord);
  const [editing, setEditing] = useState<Attendance | null>(null);

  const paginationRef = useRef<PaginationHandle>(null);

  const fetchStudents = async () => {
    const data = await listDocs<Student>("students");
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const columns: Column<Attendance>[] = [
    { key: "no", label: "No.", render: (_v, _r, i) => i + 1 },
    {
      key: "studentId",
      label: "Nama Siswa",
      render: (value) => {
        if (typeof value === "string") {
          const s = students.find((st) => st.id === value);
          return s ? s.fullName : value;
        }
        return null;
      },
    },
    { key: "date", label: "Tanggal" },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        if (typeof value === "string") {
          const map: Record<string, { text: string; color: string }> = {
            present: { text: "Hadir", color: "bg-green-100 text-green-700" },
            absent: { text: "Tidak Hadir", color: "bg-red-100 text-red-700" },
            late: { text: "Terlambat", color: "bg-yellow-100 text-yellow-700" },
          };
          const { text, color } = map[value] || {
            text: value,
            color: "bg-gray-100 text-gray-700",
          };
          return (
            <span className={`px-2 py-1 rounded-lg ${color}`}>{text}</span>
          );
        }
        return null;
      },
    },
    { key: "note", label: "Catatan" },
  ];

  const onChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewRecord({ ...newRecord, [e.target.name]: e.target.value });

  const onAddAttendance = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createDoc("attendance", newRecord);
    setNewRecord(emptyRecord);
    paginationRef.current?.refetch();
  };

  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const formData = new FormData(e.currentTarget);
    const updates: Partial<Attendance> = Object.fromEntries(formData.entries());
    await updateDocById("attendance", editing.id, updates);
    setEditing(null);
    paginationRef.current?.refetch();
  };

  const onDelete = async (row: Attendance) => {
    if (!confirm("Hapus data kehadiran ini?")) return;
    await deleteDocById("attendance", row.id);
    paginationRef.current?.refetch();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Kehadiran</h2>

        {(appUser.role === "teacher" || appUser.role === "admin") && (
          <form
            onSubmit={onAddAttendance}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Siswa</label>
              <select
                name="studentId"
                value={newRecord.studentId}
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
              <label className="text-sm text-gray-600">Tanggal</label>
              <input
                type="date"
                name="date"
                value={newRecord.date}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Status</label>
              <select
                name="status"
                value={newRecord.status}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              >
                <option value="present">Hadir</option>
                <option value="absent">Tidak Hadir</option>
                <option value="late">Terlambat</option>
              </select>
            </div>

            <div className="flex flex-col md:col-span-3">
              <label className="text-sm text-gray-600">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                name="note"
                value={newRecord.note}
                onChange={onChangeNew}
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
              Simpan Kehadiran
            </button>
          </form>
        )}

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

        <Pagination<Attendance>
          ref={paginationRef}
          collection="attendance"
          filterFn={
            appUser.role === "student"
              ? (data) => data.filter((r) => r.studentId === appUser.id)
              : undefined
          }
          onData={setRows}
        />
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2"
          >
            <h3 className="text-lg font-semibold">Edit Kehadiran</h3>

            <div>
              <label className="text-sm text-gray-600">Siswa</label>
              <select
                name="studentId"
                defaultValue={editing.studentId}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Tanggal</label>
              <input
                type="date"
                name="date"
                defaultValue={editing.date}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select
                name="status"
                defaultValue={editing.status}
                required
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="present">Hadir</option>
                <option value="absent">Tidak Hadir</option>
                <option value="late">Terlambat</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                name="note"
                defaultValue={editing.note}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex gap-2 justify-end flex-wrap">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-3 py-2 rounded-xl border w-full sm:w-auto"
              >
                Batal
              </button>
              <button className="px-3 py-2 rounded-xl bg-blue-600 text-white w-full sm:w-auto">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
