// src/pages/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { listDocs } from "../lib/firestore";
import { AppUser } from "@/types";

interface Student {
  id: string;
  name: string;
  className?: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  students?: string[]; // array of student IDs
}

interface DashboardProps {
  appUser: AppUser;
}

export default function Dashboard({ appUser }: DashboardProps) {
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [teachersCount, setTeachersCount] = useState<number>(0);
  const [classesCount, setClassesCount] = useState<number>(0);
  const [myClass, setMyClass] = useState<Class | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      if (appUser.role === "admin" || appUser.role === "teacher") {
        const students = await listDocs<Student>("students");
        const teachers = await listDocs<Teacher>("teachers");
        const classes = await listDocs<Class>("classes");

        setStudentsCount(students.length);
        setTeachersCount(teachers.length);
        setClassesCount(classes.length);
      } else if (appUser.role === "student") {
        const classes = await listDocs<Class>("classes");
        const myClass = classes.find((c) => c.students?.includes(appUser.uid));
        setMyClass(myClass || null);
      }
    };

    fetchCounts();
  }, [appUser]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      {/* Admin & Teacher View */}
      {(appUser.role === "admin" || appUser.role === "teacher") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow border flex flex-col items-center">
            <p className="text-sm text-gray-500">Siswa</p>
            <p className="text-3xl font-bold">{studentsCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow border flex flex-col items-center">
            <p className="text-sm text-gray-500">Guru</p>
            <p className="text-3xl font-bold">{teachersCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow border flex flex-col items-center">
            <p className="text-sm text-gray-500">Kelas</p>
            <p className="text-3xl font-bold">{classesCount}</p>
          </div>
        </div>
      )}

      {/* Student View */}
      {appUser.role === "student" && (
        <div className="bg-white p-4 rounded-2xl shadow border space-y-4">
          <p className="text-sm text-gray-500">Kelas Anda</p>
          {myClass ? (
            <p className="text-3xl font-bold">{myClass.name}</p>
          ) : (
            <p className="text-gray-600">Belum ada kelas terdaftar.</p>
          )}
        </div>
      )}
    </div>
  );
}
