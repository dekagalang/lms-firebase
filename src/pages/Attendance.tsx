import { AppUser } from "@/lib/firestore";

interface AttendanceProps {
  appUser: AppUser;
}

export default function Attendance({ appUser }: AttendanceProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Attendance</h2>

      <div className="bg-white p-4 rounded-2xl shadow border">
        {appUser.role === "admin" && (
          <p>📊 Admin can view attendance for all classes.</p>
        )}
        {appUser.role === "teacher" && (
          <p>👩‍🏫 Teacher can mark attendance for their classes.</p>
        )}
        {appUser.role === "student" && (
          <p>🎓 Student can view their own attendance record.</p>
        )}
      </div>
    </div>
  );
}
