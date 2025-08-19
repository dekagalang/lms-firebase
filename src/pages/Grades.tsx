// src/pages/Grades.tsx
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DataTable from "../components/DataTable";
import {
  createDoc,
  listDocs,
  updateDocById,
  deleteDocById,
} from "../lib/firestore";
import { AppUser } from "@/types";
import { Timestamp } from "firebase/firestore";
import type { Column } from "../types";

interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface GradesProps {
  appUser: AppUser;
}

const emptyGrade: Omit<Grade, "id" | "createdAt" | "updatedAt"> = {
  studentId: "",
  subject: "",
  score: 0,
};

export default function Grades({ appUser }: GradesProps) {
  const [rows, setRows] = useState<Grade[]>([]);
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
          ? data.filter((g) => g.studentId === appUser.uid)
          : data;

      setRows(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  /** ---------------- COLUMNS ---------------- */
  const columns: Column<Grade>[] = [
    { key: "studentId", label: "Student ID" },
    { key: "subject", label: "Subject" },
    {
      key: "score",
      label: "Score",
      render: (value) => (
        <span className="font-semibold">
          {typeof value === "object" && value instanceof Timestamp
            ? value.toDate().toLocaleString()
            : value}
        </span>
      ),
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
    if (!newGrade.studentId || !newGrade.subject) return;

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
    if (!confirm(`Delete grade for ${row.studentId}?`)) return;

    await deleteDocById("grades", row.id);
    fetchRows();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Grades</h2>

      {/* Form hanya untuk teacher/admin */}
      {(appUser.role === "teacher" || appUser.role === "admin") && (
        <form
          onSubmit={onAddGrade}
          className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <input
            name="studentId"
            placeholder="Student ID"
            value={newGrade.studentId}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            name="subject"
            placeholder="Subject"
            value={newGrade.subject}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <input
            type="number"
            name="score"
            placeholder="Score"
            value={newGrade.score}
            onChange={onChangeNew}
            className="border rounded-xl px-3 py-2"
          />
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-3">
            Save Grade
          </button>
        </form>
      )}

      {/* Tabel Nilai */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
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

      {/* Modal Edit */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <form
            onSubmit={onSaveEdit}
            className="bg-white rounded-2xl p-4 w-full max-w-lg space-y-3"
          >
            <h3 className="text-lg font-semibold">Edit Grade</h3>
            <div>
              <label className="text-sm">Student ID</label>
              <input
                name="studentId"
                defaultValue={editing.studentId}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Subject</label>
              <input
                name="subject"
                defaultValue={editing.subject}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Score</label>
              <input
                type="number"
                name="score"
                defaultValue={editing.score}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-3 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button className="px-3 py-2 rounded-xl bg-blue-600 text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
