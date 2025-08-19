"use client";

import { useEffect, useState } from "react";
import { listDocs } from "../lib/firestore";

interface Student {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

export default function Dashboard() {
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [teachersCount, setTeachersCount] = useState<number>(0);
  const [classesCount, setClassesCount] = useState<number>(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const students = await listDocs<Student>("students");
      const teachers = await listDocs<Teacher>("teachers");
      const classes = await listDocs<Class>("classes");

      setStudentsCount(students.length);
      setTeachersCount(teachers.length);
      setClassesCount(classes.length);
    };

    fetchCounts();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow border">
          <p className="text-sm text-gray-500">Siswa</p>
          <p className="text-3xl font-bold">{studentsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow border">
          <p className="text-sm text-gray-500">Guru</p>
          <p className="text-3xl font-bold">{teachersCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow border">
          <p className="text-sm text-gray-500">Kelas</p>
          <p className="text-3xl font-bold">{classesCount}</p>
        </div>
      </div>
    </div>
  );
}
