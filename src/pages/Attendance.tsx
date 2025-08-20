import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  AppUser,
  Attendance,
  Student,
  AttendanceStatus,
  Column,
} from "@/types";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
} from "@/lib/firestore";

interface AttendanceProps {
  appUser: AppUser;
}

const emptyRecord: Omit<Attendance, "id" | "createdAt" | "updatedAt"> = {
  studentId: "",
  classId: "", // default kosong
  date: "",
  status: "present",
  note: "",
};

export default function AttendancePage({ appUser }: AttendanceProps) {
  const [rows, setRows] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState(emptyRecord);

  /** ---------------- FETCH ATTENDANCE ---------------- */
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs<Attendance>("attendance");
      let filtered = data;
      if (appUser.role === "student") {
        filtered = data.filter((r) => r.studentId === appUser.uid);
      }
      setRows(filtered);
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- FETCH STUDENTS ---------------- */
  const fetchStudents = async () => {
    const data = await listDocs<Student>("students"); // ambil langsung dari collection students
    setStudents(data);
  };

  useEffect(() => {
    fetchRows();
    fetchStudents();
  }, []);

  /** ---------------- COLUMNS ---------------- */
  const columns: Column<Attendance>[] = [
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
    fetchRows();
  };

  /** ---------------- DELETE ---------------- */
  const onDelete = async (row: Attendance) => {
    if (!confirm("Hapus data kehadiran ini?")) return;
    await deleteDocById("attendance", row.id);
    fetchRows();
  };

  /** ---------------- TOGGLE STATUS ---------------- */
  const onToggleStatus = async (row: Attendance) => {
    const nextStatus: AttendanceStatus =
      row.status === "present"
        ? "absent"
        : row.status === "absent"
        ? "late"
        : "present"; // cycle antara 3 status

    await updateDocById("attendance", row.id, { status: nextStatus });
    fetchRows();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Kehadiran</h2>

      {/* Form hanya untuk teacher/admin */}
      {(appUser.role === "teacher" || appUser.role === "admin") && (
        <form
          onSubmit={onAddAttendance}
          className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {/* Dropdown siswa */}
          <select
            name="studentId"
            value={newRecord.studentId}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          >
            <option value="">Pilih Siswa</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>

          {/* Tanggal */}
          <input
            type="date"
            name="date"
            value={newRecord.date}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />

          {/* Status */}
          <select
            name="status"
            value={newRecord.status}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          >
            <option value="present">Hadir</option>
            <option value="absent">Tidak Hadir</option>
            <option value="late">Terlambat</option>
          </select>

          {/* Catatan opsional */}
          <input
            type="text"
            name="note"
            value={newRecord.note}
            onChange={onChangeNew}
            placeholder="Catatan (opsional)"
            className="border rounded-xl px-3 py-2 md:col-span-3"
          />

          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
            Simpan Kehadiran
          </button>
        </form>
      )}

      {/* Tabel Attendance */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          onEdit={
            appUser.role === "teacher" || appUser.role === "admin"
              ? onToggleStatus
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
  );
}
