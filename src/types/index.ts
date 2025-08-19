import { FieldValue, Timestamp } from "firebase/firestore";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends BaseEntity {
  fullName: string;
  nisn: string;
  gradeLevel: string;
  className: string;
  parentName: string;
  parentPhone: string;
  status: 'active' | 'pending' | 'rejected';
  admissionDate?: string;
}

export interface Teacher extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  subject: string[];
  phone: string;
  status: 'active' | 'inactive';
}

export interface SchoolClass extends BaseEntity {
  className: string;
  gradeLevel: string;
  homeroomTeacher: string;
  capacity: number;
  status?: 'active' | 'inactive';
  schedule?: ClassSchedule[];
}

export interface ClassSchedule extends Record<string, unknown> {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
}

export interface Column<T = unknown> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row?: T) => React.ReactNode;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  score: number;
  term: string;
  year: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "student" | "teacher" | "admin";
  createdAt: Timestamp | FieldValue;
}
