import { useEffect, useState } from "react";
import { AppUser, Student } from "@/types";
import { listDocs } from "@/lib/firestore";
import DataTable from "../components/DataTable";
import type { Attendance, Column, Grade } from "../types";

interface ReportRow {
  id: string;
  studentId: string;
  studentName: string;
  avgScore: number;
  totalPresent: number;
  totalAbsent: number;
}

interface ReportsProps {
  appUser: AppUser;
}

export default function Reports({ appUser }: ReportsProps) {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  /** ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    generateReports();
  }, []);

  const generateReports = async () => {
    try {
      setLoading(true);
      const grades = await listDocs<Grade>("grades");
      const attendance = await listDocs<Attendance>("attendance");
      const students = await listDocs<Student>("students");

      // filter sesuai role
      let filteredGrades = grades;
      let filteredAttendance = attendance;

      if (appUser.role === "student") {
        filteredGrades = grades.filter((g) => g.studentId === appUser.id);
        filteredAttendance = attendance.filter(
          (a) => a.studentId === appUser.id
        );
      }

      // ambil semua studentId unik
      const studentIds = [
        ...new Set([
          ...filteredGrades.map((g) => g.studentId),
          ...filteredAttendance.map((a) => a.studentId),
        ]),
      ];

      // hitung laporan
      const rows: ReportRow[] = studentIds.map((id) => {
        const studentGrades = filteredGrades.filter((g) => g.studentId === id);
        const avgScore =
          studentGrades.length > 0
            ? studentGrades.reduce((acc, g) => acc + g.score, 0) /
              studentGrades.length
            : 0;

        const studentAttendance = filteredAttendance.filter(
          (a) => a.studentId === id
        );
        const totalPresent = studentAttendance.filter(
          (a) => a.status === "present"
        ).length;
        const totalAbsent = studentAttendance.filter(
          (a) => a.status === "absent"
        ).length;

        // cari data student
        const student = students.find((s) => s.id === id);

        return {
          id,
          studentId: id,
          studentName: student ? `${student.fullName} (${student.nisn})` : id, // fallback kalau tidak ketemu
          avgScore,
          totalPresent,
          totalAbsent,
        };
      });

      setReports(rows);
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- COLUMNS ---------------- */
  const columns: Column<ReportRow>[] = [
    {
      key: "no",
      label: "No.",
      render: (_value, _row, index) => index + 1,
    },
    { key: "studentName", label: "Nama Siswa" },
    {
      key: "avgScore",
      label: "Rata-rata Nilai",
      render: (value) =>
        typeof value === "number" ? (
          <span>{value.toFixed(2)}</span>
        ) : (
          <span>{value}</span>
        ),
    },
    { key: "totalPresent", label: "Total Hadir" },
    { key: "totalAbsent", label: "Total Absen" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Laporan</h2>

      {loading ? (
        <div className="text-sm text-gray-500">Memuat laporan...</div>
      ) : reports.length === 0 ? (
        <p className="text-gray-600">Tidak ada laporan tersedia.</p>
      ) : (
        <DataTable columns={columns} data={reports} />
      )}
    </div>
  );
}
