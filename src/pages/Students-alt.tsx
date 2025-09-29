// StudentsAlt.tsx
import { useEffect, useState } from "react";
import type { AppUser, Column, SchoolClass, StudentStatus } from "../types";
import DataTable from "../components/DataTable";
import { queryDocs, listDocs } from "../lib/firestore";
import { getStudentStatusBadgeColor, studentStatusLabels } from "@/consts";

type StudentRow = AppUser & {
  nisn: string;
  gradeLevel: string;
  classId: string;
  parentName: string;
  parentPhone: string;
  admissionDate?: string;
};

export default function StudentsAlt() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await queryDocs<StudentRow>("users", [
        ["role", "==", "student"],
      ]);
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const data = await listDocs<SchoolClass>("classes");
    setClasses(data);
  };

  useEffect(() => {
    fetchRows();
    fetchClasses();
  }, []);

  const columns: Column<StudentRow>[] = [
    { key: "no", label: "No.", render: (_v, _r, i) => i + 1 },
    { key: "firstName", label: "Nama Depan" },
    { key: "lastName", label: "Nama Belakang" },
    { key: "nisn", label: "NISN" },
    { key: "gradeLevel", label: "Tingkat" },
    {
      key: "classId",
      label: "Kelas",
      render: (value) => {
        const cls = classes.find((c) => c.id === value);
        return cls ? cls.className : "-";
      },
    },
    { key: "parentName", label: "Nama Orang Tua" },
    { key: "parentPhone", label: "Telepon Orang Tua" },
    {
      key: "studentStatus",
      label: "Status",
      render: (value) => {
        const status = value as StudentStatus;
        return (
          <span
            className={`px-2 py-1 rounded-lg ${getStudentStatusBadgeColor(
              status
            )}`}
          >
            {studentStatusLabels[status]}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Siswa</h2>

      {/* Info tambah siswa */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
        <p className="text-yellow-800 text-sm">
          Untuk menambahkan siswa baru, silakan daftar mandiri melalui sistem
          pendaftaran yang tersedia.
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
