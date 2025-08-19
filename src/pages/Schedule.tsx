import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AppUser } from "@/types";

interface ScheduleItem {
  id: string;
  className: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  teacherId: string;
}

interface ScheduleProps {
  appUser: AppUser;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Schedule: React.FC<ScheduleProps> = ({ appUser }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [form, setForm] = useState({
    className: "",
    subject: "",
    day: "",
    startTime: "",
    endTime: "",
    teacherId: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchSchedule = async () => {
    const snap = await getDocs(collection(db, "schedule"));
    const data: ScheduleItem[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ScheduleItem, "id">),
    }));
    setSchedule(data);
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.className || !form.subject || !form.day) return;

    setLoading(true);
    await addDoc(collection(db, "schedule"), form);
    setForm({
      className: "",
      subject: "",
      day: "",
      startTime: "",
      endTime: "",
      teacherId: "",
    });
    setLoading(false);
    fetchSchedule();
  };

  const handleDeleteSchedule = async (id: string) => {
    await deleteDoc(doc(db, "schedule", id));
    fetchSchedule();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Schedule</h2>

      {(appUser.role === "admin" || appUser.role === "teacher") && (
        <form
          onSubmit={handleAddSchedule}
          className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          <input
            name="className"
            placeholder="Class Name"
            value={form.className}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          />
          <input
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          />
          <select
            name="day"
            value={form.day}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          >
            <option value="">Select Day</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          />
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={onChange}
            className="border rounded-xl px-3 py-2"
          />
          <input
            name="teacherId"
            placeholder="Teacher ID"
            value={form.teacherId}
            onChange={onChange}
            className="border rounded-xl px-3 py-2 md:col-span-2"
          />
          <div className="md:col-span-5 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              {loading ? "Saving..." : "Add Schedule"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {schedule.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-2xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {item.subject} ({item.className})
              </p>
              <p className="text-sm text-gray-600">
                {item.day} | {item.startTime} - {item.endTime} | Teacher:{" "}
                {item.teacherId}
              </p>
            </div>
            {(appUser.role === "admin" || appUser.role === "teacher") && (
              <button
                onClick={() => handleDeleteSchedule(item.id)}
                className="px-3 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
