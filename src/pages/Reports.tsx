import { useEffect, useState } from "react";
import { AppUser } from "@/types";
import { listDocs } from "@/lib/firestore";
import DataTable from "../components/DataTable";
import type { Column } from "../types";

interface Grade {
  id?: string;
  studentId: string;
  subject: string;
  score: number;
}

interface Attendance {
  id?: string;
  studentId: string;
  date: string;
  status: "present" | "absent";
}

interface ReportRow {
  id: string;
  studentId: string;
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

      // filter sesuai role
      let filteredGrades = grades;
      let filteredAttendance = attendance;

      if (appUser.role === "student") {
        filteredGrades = grades.filter((g) => g.studentId === appUser.uid);
        filteredAttendance = attendance.filter(
          (a) => a.studentId === appUser.uid
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

        return {
          id,
          studentId: id,
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
    { key: "studentId", label: "Student ID" },
    {
      key: "avgScore",
      label: "Average Score",
      render: (value) =>
        typeof value === "number" ? (
          <span>{value.toFixed(2)}</span>
        ) : (
          <span>{value}</span>
        ),
    },
    { key: "totalPresent", label: "Total Present" },
    { key: "totalAbsent", label: "Total Absent" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Reports</h2>

      {loading ? (
        <div className="text-sm text-gray-500">Loading reports...</div>
      ) : reports.length === 0 ? (
        <p className="text-gray-600">No reports available.</p>
      ) : (
        <DataTable columns={columns} data={reports} />
      )}
    </div>
  );
}
