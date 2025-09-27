import { useEffect, useState } from "react";
import { auth } from "@/firebase"; // pastikan ada auth
import type {
  AppUser,
  StudentStatus,
  TeacherStatus,
  Column,
  UserRole,
} from "@/types";
import { queryDocs, updateDocById } from "@/lib/firestore";
import DataTable from "@/components/DataTable";
import {
  getStudentStatusBadgeColor,
  getTeacherStatusBadgeColor,
  roleLabels,
  studentStatusLabels,
  teacherStatusLabels,
} from "@/consts";

export default function ManageUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const currentUid = auth.currentUser?.uid; // id user login

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await queryDocs<AppUser>("users", []);
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Save edit
  const handleSaveEdit = async (updates: Partial<AppUser>) => {
    if (!editing?.id) return;
    await updateDocById("users", editing.id, updates);
    setEditing(null);
    fetchUsers();
  };

  const columns: Column<AppUser>[] = [
    { key: "no", label: "No", render: (_v, _r, i) => i + 1 },
    { key: "firstName", label: "Nama" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (value) => {
        const role = value as UserRole | undefined;
        return role ? <span>{roleLabels[role]}</span> : "-";
      },
    },
    {
      key: "studentStatus",
      label: "Status Siswa",
      render: (value) => {
        const status = value as StudentStatus | undefined;
        return status ? (
          <span
            className={`px-2 py-1 rounded-lg ${getStudentStatusBadgeColor(
              status
            )}`}
          >
            {studentStatusLabels[status]}
          </span>
        ) : (
          "-"
        );
      },
    },
    {
      key: "teacherStatus",
      label: "Status Guru",
      render: (value) => {
        const status = value as TeacherStatus | undefined;
        return status ? (
          <span
            className={`px-2 py-1 rounded-lg ${getTeacherStatusBadgeColor(
              status
            )}`}
          >
            {teacherStatusLabels[status]}
          </span>
        ) : (
          "-"
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Kelola Pengguna</h2>

        {loading ? (
          <div className="text-sm text-gray-500">Memuat...</div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            onEdit={setEditing}
             currentUid={currentUid}
            // onDelete={handleDelete}
          />
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const updates: Partial<AppUser> = Object.fromEntries(
                fd.entries()
              );
              handleSaveEdit(updates);
            }}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-3 mx-2"
          >
            <h3 className="text-lg font-semibold">Ubah Pengguna</h3>

            <div>
              <label className="text-sm">Nama</label>
              <input
                name="firstName"
                defaultValue={editing.firstName ?? ""}
                className="border rounded-xl px-3 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="text-sm">Role</label>
              <select
                name="role"
                defaultValue={editing.role}
                className="border rounded-xl px-3 py-2 w-full"
              >
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Status Siswa</label>
              <select
                name="studentStatus"
                defaultValue={editing.studentStatus || "pending"}
                className="border rounded-xl px-3 py-2 w-full"
              >
                <option value="active">Aktif</option>
                <option value="pending">Menunggu</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Status Guru</label>
              <select
                name="teacherStatus"
                defaultValue={editing.teacherStatus || "inactive"}
                className="border rounded-xl px-3 py-2 w-full"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
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
