import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import { AppUser } from "@/types";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
} from "@/lib/firestore";
import type { Column } from "../types";
import { Timestamp } from "firebase/firestore";

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: "present" | "absent";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface AttendanceProps {
  appUser: AppUser;
}

const emptyRecord: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt"> = {
  studentId: "",
  date: "",
  status: "present",
};

export default function Attendance({ appUser }: AttendanceProps) {
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState(emptyRecord);

  /** ---------------- FETCH ---------------- */
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs<AttendanceRecord>("attendance");
      let filtered = data;
      if (appUser.role === "student") {
        filtered = data.filter((r) => r.studentId === appUser.uid);
      }
      setRows(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  /** ---------------- COLUMNS ---------------- */
  const columns: Column<AttendanceRecord>[] = [
    { key: "studentId", label: "ID Siswa" },
    { key: "date", label: "Tanggal" },
    {
      key: "status",
      label: "Status",
      render: (value: string | Timestamp | undefined) => {
        if (value === "present" || value === "absent") {
          return (
            <span
              className={`px-2 py-1 rounded-lg ${
                value === "present"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {value}
            </span>
          );
        }
        return null; // fallback kalau undefined atau tipe lain
      },
    },
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
  const onDelete = async (row: AttendanceRecord) => {
    if (!confirm("Hapus data kehadiran ini?")) return;
    await deleteDocById("attendance", row.id);
    fetchRows();
  };

  /** ---------------- TOGGLE STATUS (pakai onEdit) ---------------- */
  const onToggleStatus = async (row: AttendanceRecord) => {
    const newStatus = row.status === "present" ? "absent" : "present";
    await updateDocById("attendance", row.id, { status: newStatus });
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
          <input
            name="studentId"
            placeholder="ID Siswa"
            value={newRecord.studentId}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            type="date"
            name="date"
            value={newRecord.date}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <select
            name="status"
            value={newRecord.status}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          >
            <option value="present">Hadir</option>
            <option value="absent">Tidak Hadir</option>
          </select>
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
