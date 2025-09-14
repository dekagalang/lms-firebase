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

  /** ---------------- FETCH STUDENTS ---------------- */
  const fetchStudents = async () => {
    const data = await listDocs<Student>("students");
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /** ---------------- COLUMNS ---------------- */
  const columns: Column<Attendance>[] = [
    {
      key: "no",
      label: "No.",
      render: (_value, _row, index) => index + 1,
    },
    {
      key: "studentId",
      label: "Nama Siswa",
      render: (value) => {
        if (typeof value === "string") {
          const student = students.find((s) => s.id === value);
          return student ? student.fullName : value;
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
          let color = "bg-gray-100 text-gray-700";
          let text = value;
          if (value === "present") {
            color = "bg-green-100 text-green-700";
            text = "Hadir";
          } else if (value === "absent") {
            color = "bg-red-100 text-red-700";
            text = "Tidak Hadir";
          } else if (value === "late") {
            color = "bg-yellow-100 text-yellow-700";
            text = "Terlambat";
          }
          return (
            <span className={`px-2 py-1 rounded-lg ${color}`}>{text}</span>
          );
        }
        return null;
      },
    },
    { key: "note", label: "Catatan" },
  ];

  /** ---------------- CREATE ---------------- */
  const onChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewRecord({ ...newRecord, [e.target.name]: e.target.value });

  const onAddAttendance = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newRecord.studentId || !newRecord.date) return;

    await createDoc("attendance", newRecord);
    setNewRecord(emptyRecord);

    paginationRef.current?.refetch();
  };

  /** ---------------- EDIT / UPDATE ---------------- */
  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;

    const formData = new FormData(e.currentTarget);
    const updates: Partial<Attendance> = Object.fromEntries(formData.entries());
    await updateDocById("attendance", editing.id, updates);
    setEditing(null);

    paginationRef.current?.refetch();
  };

  /** ---------------- DELETE ---------------- */
  const onDelete = async (row: Attendance) => {
    if (!confirm("Hapus data kehadiran ini?")) return;
    await deleteDocById("attendance", row.id);

    paginationRef.current?.refetch();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Kehadiran</h2>

        {/* Form hanya untuk teacher/admin */}
        {(appUser.role === "teacher" || appUser.role === "admin") && (
          <form
            onSubmit={onAddAttendance}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <select
              name="studentId"
              value={newRecord.studentId}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2 w-full"
            >
              <option value="">Pilih Siswa</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.nisn})
                </option>
              ))}
            </select>

            <input
              type="date"
              name="date"
              value={newRecord.date}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2 w-full"
            />

            <select
              name="status"
              value={newRecord.status}
              onChange={onChangeNew}
              className="border rounded-xl px-3 py-2 w-full"
            >
              <option value="present">Hadir</option>
              <option value="absent">Tidak Hadir</option>
              <option value="late">Terlambat</option>
            </select>

            <input
              type="text"
              name="note"
              value={newRecord.note}
              onChange={onChangeNew}
              placeholder="Catatan (opsional)"
              className="border rounded-xl px-3 py-2 md:col-span-3 w-full"
            />

            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3 w-full">
              Simpan Kehadiran
            </button>
          </form>
        )}

        {/* Tabel Attendance dengan scroll horizontal */}
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

        {/* Pagination */}
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
      {/* Modal Edit */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2 z-50"
          >
            <h3 className="text-lg font-semibold">Edit Kehadiran</h3>

            <div>
              <label className="text-sm">Siswa</label>
              <select
                name="studentId"
                defaultValue={editing.studentId}
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
              <label className="text-sm">Tanggal</label>
              <input
                type="date"
                name="date"
                defaultValue={editing.date}
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
                <option value="present">Hadir</option>
                <option value="absent">Tidak Hadir</option>
                <option value="late">Terlambat</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Catatan</label>
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
