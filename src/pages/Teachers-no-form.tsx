// Teachers.tsx
import { useEffect, useState } from "react";
import type { Column, AppUser, TeacherStatus } from "../types";
import DataTable from "../components/DataTable";
import { queryDocs } from "../lib/firestore";
import { getTeacherStatusBadgeColor, teacherStatusLabels } from "@/consts";

export default function TeachersNoForm() {
  const [rows, setRows] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await queryDocs<AppUser>("users", [["role", "==", "teacher"]]);
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const columns: Column<AppUser>[] = [
    { key: "no", label: "No.", render: (_v, _r, i) => i + 1 },
    { key: "firstName", label: "Nama Depan" },
    { key: "lastName", label: "Nama Belakang" },
    { key: "phone", label: "Telepon" },
    {
      key: "subject",
      label: "Mata Pelajaran",
      render: (value) => {
        if (!Array.isArray(value)) return "";
        return (value as string[]).join(", ");
      },
    },
    {
      key: "teacherStatus",
      label: "Status",
      render: (value) => {
        const status = value as TeacherStatus;
        return (
          <span
            className={`px-2 py-1 rounded-lg ${getTeacherStatusBadgeColor(status)}`}
          >
            {teacherStatusLabels[status]}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Guru</h2>

      {/* Info tambah guru */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
        <p className="text-yellow-800 text-sm">
          Untuk menambahkan guru baru, silakan daftar mandiri melalui sistem pendaftaran yang tersedia.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Memuat...</div>
      ) : (
        <DataTable columns={columns} data={rows} />
      )}
    </div>
  );
}
