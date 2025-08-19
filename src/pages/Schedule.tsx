import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
} from "../lib/firestore";
import type { Column } from "../types";
import { AppUser } from "@/types";

interface ScheduleItem {
  id: string;
  className: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  teacherId: string;
}

interface ScheduleProps {
  appUser: AppUser;
}

const emptySchedule: Omit<ScheduleItem, "id"> = {
  className: "",
  subject: "",
  day: "",
  startTime: "",
  endTime: "",
  teacherId: "",
};

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export default function Schedule({ appUser }: ScheduleProps) {
  const [rows, setRows] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [newSchedule, setNewSchedule] = useState(emptySchedule);

  /** ---------------- FETCH ---------------- */
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs<ScheduleItem>("schedule");
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  /** ---------------- COLUMNS ---------------- */
  const columns: Column<ScheduleItem>[] = [
    { key: "className", label: "Kelas" },
    { key: "subject", label: "Mata Pelajaran" },
    { key: "day", label: "Hari" },
    { key: "startTime", label: "Jam Mulai" },
    { key: "endTime", label: "Jam Selesai" },
    { key: "teacherId", label: "ID Guru" },
  ];

  /** ---------------- CREATE ---------------- */
  const onChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });

  const onAddSchedule = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createDoc("schedule", newSchedule);
    setNewSchedule(emptySchedule);
    fetchRows();
  };

  /** ---------------- EDIT / UPDATE ---------------- */
  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;

    const formData = new FormData(e.currentTarget);
    const updates: Partial<ScheduleItem> = Object.fromEntries(formData.entries());
    await updateDocById("schedule", editing.id, updates);
    setEditing(null);
    fetchRows();
  };

  /** ---------------- DELETE ---------------- */
  const onDelete = async (row: ScheduleItem) => {
    if (!confirm(`Hapus jadwal ${row.subject}?`)) return;
    await deleteDocById("schedule", row.id);
    fetchRows();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Jadwal</h2>

      {/* Form Tambah Jadwal (Admin/Guru Saja) */}
      {(appUser.role === "admin" || appUser.role === "teacher") && (
        <form
          onSubmit={onAddSchedule}
          className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <input
            name="className"
            placeholder="Kelas"
            value={newSchedule.className}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            name="subject"
            placeholder="Mata Pelajaran"
            value={newSchedule.subject}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <select
            name="day"
            value={newSchedule.day}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          >
            <option value="">Pilih Hari</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            name="startTime"
            value={newSchedule.startTime}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            type="time"
            name="endTime"
            value={newSchedule.endTime}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            name="teacherId"
            placeholder="ID Guru"
            value={newSchedule.teacherId}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2 md:col-span-2"
          />
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
            Tambah Jadwal
          </button>
        </form>
      )}

      {/* Tabel Jadwal */}
      {loading ? (
        <div className="text-sm text-gray-500">Memuat data...</div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          onEdit={setEditing}
          onDelete={onDelete}
        />
      )}

      {/* Modal Edit */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 w-full max-w-lg space-y-3"
          >
            <h3 className="text-lg font-semibold">Edit Jadwal</h3>
            {columns.map((c) => (
              <div key={c.key}>
                <label className="text-sm">{c.label}</label>
                {c.key === "day" ? (
                  <select
                    name="day"
                    defaultValue={editing.day}
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
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
