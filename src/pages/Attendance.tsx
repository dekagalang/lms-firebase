import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import { AppUser, Attendance, Student, Column } from "@/types";
import {
  createDoc,
  listDocsPaginated,
  updateDocById,
  deleteDocById,
  listDocs,
} from "@/lib/firestore";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

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
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState(emptyRecord);
  const [editing, setEditing] = useState<Attendance | null>(null);

  // pagination state
  const [pageCursors, setPageCursors] = useState<
    (QueryDocumentSnapshot<DocumentData> | null)[]
  >([]);
  const [pages, setPages] = useState<Attendance[][]>([]); // cache tiap halaman
  const [pageNumber, setPageNumber] = useState(1);

  const pageSize = 10;

  /** ---------------- FETCH ATTENDANCE PAGINATED ---------------- */
  const fetchRows = async (direction: "first" | "next" | "prev" = "first") => {
    try {
      setLoading(true);

      if (direction === "prev" && pageNumber > 1) {
        // ambil cache halaman sebelumnya
        setPageNumber((n) => n - 1);
        setRows(pages[pageNumber - 2]);
        return;
      }

      let cursor: QueryDocumentSnapshot<DocumentData> | undefined;

      if (direction === "next" && pageCursors[pageNumber - 1]) {
        cursor = pageCursors[pageNumber - 1] || undefined;
      }

      const { data, lastDoc } = await listDocsPaginated<Attendance>(
        "attendance",
        pageSize,
        cursor
      );

      let filtered = data;
      if (appUser.role === "student") {
        filtered = data.filter((r) => r.studentId === appUser.uid);
      }

      setRows(filtered);

      if (direction === "next" && lastDoc) {
        setPageCursors((prev) => {
          const updated = [...prev];
          updated[pageNumber] = lastDoc; // simpan cursor halaman berikutnya
          return updated;
        });
        setPages((prev) => {
          const updated = [...prev];
          updated[pageNumber] = filtered; // simpan cache halaman berikutnya
          return updated;
        });
        setPageNumber((n) => n + 1);
      } else if (direction === "first") {
        setPageCursors(lastDoc ? [lastDoc] : []);
        setPages([filtered]); // simpan halaman 1
        setPageNumber(1);
      }
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- FETCH STUDENTS ---------------- */
  const fetchStudents = async () => {
    const data = await listDocs<Student>("students");
    setStudents(data);
  };

  useEffect(() => {
    fetchRows("first");
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
    fetchRows("first");
  };

  /** ---------------- EDIT / UPDATE ---------------- */
  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;

    const formData = new FormData(e.currentTarget);
    const updates: Partial<Attendance> = Object.fromEntries(formData.entries());
    await updateDocById("attendance", editing.id, updates);
    setEditing(null);
    fetchRows("first");
  };

  /** ---------------- DELETE ---------------- */
  const onDelete = async (row: Attendance) => {
    if (!confirm("Hapus data kehadiran ini?")) return;
    await deleteDocById("attendance", row.id);
    fetchRows("first");
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
            <option value="late">Terlambat</option>
          </select>

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
        <>
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

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => fetchRows("prev")}
              disabled={pageNumber <= 1}
              className="px-3 py-2 rounded-xl border disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">Halaman {pageNumber}</span>
            <button
              onClick={() => fetchRows("next")}
              disabled={!pageCursors[pageNumber - 1]}
              className="px-3 py-2 rounded-xl border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal Edit */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 w-full max-w-lg space-y-3"
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
    </div>
  );
}
