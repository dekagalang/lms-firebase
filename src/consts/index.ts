import type { StudentStatus } from "../types";

/** Mapping status siswa ke label user-friendly */
export const statusLabels: Record<StudentStatus, string> = {
  active: "Aktif",
  pending: "Menunggu",
  rejected: "Ditolak",
};

/** Tentukan warna badge berdasarkan status */
export const getStatusBadgeColor = (status: StudentStatus): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
