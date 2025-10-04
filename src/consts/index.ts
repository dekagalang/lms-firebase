import type {
  StudentStatus,
  TeacherStatus,
  ClassStatus,
  UserRole,
  AccountStatus,
} from "../types";

/** ================= Role ================= */
export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  teacher: "Guru",
  student: "Siswa",
};

/** ================= Account Status ================= */
export const accountStatusLabels: Record<AccountStatus, string> = {
  active: "Aktif",
  pending: "Menunggu",
  inactive: "Tidak Aktif",
  rejected: "Ditolak",
};

export const getAccountStatusBadgeColor = (status: AccountStatus): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "inactive":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/** ================= Student Status ================= */
export const studentStatusLabels: Record<StudentStatus, string> = {
  active: "Aktif",
  pending: "Menunggu",
  inactive: "Tidak Aktif",
};

export const getStudentStatusBadgeColor = (status: StudentStatus): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "inactive":
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/** ================= Teacher Status ================= */
export const teacherStatusLabels: Record<TeacherStatus, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
};

export const getTeacherStatusBadgeColor = (status: TeacherStatus): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "inactive":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/** ================= Class Status ================= */
export const classStatusLabels: Record<ClassStatus, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
};

export const getClassStatusBadgeColor = (status: ClassStatus): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "inactive":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
