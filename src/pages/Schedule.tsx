import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
} from "../lib/firestore";
import type { Column, Teacher } from "../types";
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

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function Schedule({ appUser }: ScheduleProps) {
  const [rows, setRows] = useState<ScheduleItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [newSchedule, setNewSchedule] = useState(emptySchedule);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listDocs<ScheduleItem>("schedule");
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    const data = await listDocs<Teacher>("teachers");
    setTeachers(data);
  };

  useEffect(() => {
    fetchRows();
    fetchTeachers();
  }, []);

  const columns: Column<ScheduleItem>[] = [
    { key: "no", label: "No.", render: (_v, _r, i) => i + 1 },
    { key: "className", label: "Kelas" },
    { key: "subject", label: "Mata Pelajaran" },
    { key: "day", label: "Hari" },
    { key: "startTime", label: "Jam Mulai" },
    { key: "endTime", label: "Jam Selesai" },
    {
      key: "teacherId",
      label: "Guru",
      render: (value) => {
        const teacher = teachers.find((t) => t.id === value);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : value;
      },
    },
  ];

  const onChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });

  const onAddSchedule = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createDoc("schedule", newSchedule);
    setNewSchedule(emptySchedule);
    fetchRows();
  };

  const onSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const formData = new FormData(e.currentTarget);
    const updates: Partial<ScheduleItem> = Object.fromEntries(
      formData.entries()
    );
    await updateDocById("schedule", editing.id, updates);
    setEditing(null);
    fetchRows();
  };

  const onDelete = async (row: ScheduleItem) => {
    if (!confirm(`Hapus jadwal ${row.subject}?`)) return;
    await deleteDocById("schedule", row.id);
    fetchRows();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Jadwal</h2>

        {(appUser.role === "admin" || appUser.role === "teacher") && (
          <form
            onSubmit={onAddSchedule}
            className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Kelas</label>
              <input
                name="className"
                value={newSchedule.className}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Mata Pelajaran</label>
              <input
                name="subject"
                value={newSchedule.subject}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Hari</label>
              <select
                name="day"
                value={newSchedule.day}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Hari</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Jam Mulai</label>
              <input
                type="time"
                name="startTime"
                value={newSchedule.startTime}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Jam Selesai</label>
              <input
                type="time"
                name="endTime"
                value={newSchedule.endTime}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-gray-600">Guru</label>
              <select
                name="teacherId"
                value={newSchedule.teacherId}
                onChange={onChangeNew}
                required
                className="border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Guru</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
              Tambah Jadwal
            </button>
          </form>
        )}

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
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2 z-50"
          >
            <h3 className="text-lg font-semibold">Edit Jadwal</h3>
            {columns.map((c) => (
              <div key={c.key}>
                <label className="text-sm text-gray-600">{c.label}</label>
                {c.key === "no" ? (
                  <input
                    disabled
                    value={rows.findIndex((r) => r.id === editing.id) + 1}
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  />
                ) : c.key === "day" ? (
                  <select
                    name="day"
                    defaultValue={editing.day}
                    required
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : c.key === "teacherId" ? (
                  <select
                    name="teacherId"
                    defaultValue={editing.teacherId}
                    required
                    className="mt-1 w-full border rounded-xl px-3 py-2"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={c.key}
                    type={
                      c.key === "startTime" || c.key === "endTime"
                        ? "time"
                        : "text"
                    }
                    defaultValue={String(editing[c.key] || "")}
                    required
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
    </>
  );
}
