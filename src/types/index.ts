import { FieldValue, Timestamp } from "firebase/firestore";

export type UserRole = "student" | "teacher" | "admin";
export type StudentStatus = "active" | "pending" | "rejected";
export type TeacherStatus = "active" | "inactive";
export type ClassStatus = "active" | "inactive";
export type AttendanceStatus = "present" | "absent" | "late";

export interface BaseEntity {
  id: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface Student extends BaseEntity {
  userId: string; // FK ke AppUser.uid
  fullName: string;
  nisn: string;
  gradeLevel: string;
  classId: string; // FK ke SchoolClass.id
  parentName: string;
  parentPhone: string;
  status: StudentStatus;
  admissionDate?: string;
}

export interface Teacher extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  subject: string[];
  phone: string;
  status: TeacherStatus;
}

export interface SchoolClass extends BaseEntity {
  className: string;
  gradeLevel: string;
  homeroomTeacher: string;
  capacity: number;
  status?: ClassStatus;
  schedule?: ClassSchedule[];
}

export interface ClassSchedule extends Record<string, unknown> {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
}

export interface Column<T = unknown> {
  key: keyof T | "no";
  label: string;
  render?: (
    value: T[keyof T] | undefined,
    row: T,
    index: number
  ) => React.ReactNode;
}

export interface DataTableProps<T = unknown> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export interface Class {
  id: string;
  name: string;
  teacher: string;
  students: string[];
  schedule: ClassSchedule[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface Grade {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  score: number;
  term: string;
  year: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface AppUser {
  id: string;
  email: string | null; // dipakai untuk login (boleh isi email/username)
  displayName: string | null;
  role: UserRole;
  notification?: boolean;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue; // tambahkan biar konsisten
  firstName?: string;
  lastName?: string;
  phone?: string;
  subject?: string[];
  status?: TeacherStatus;
  password?: string; // tambahkan password
}
