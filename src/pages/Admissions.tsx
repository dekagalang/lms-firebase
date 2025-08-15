import { useState, ChangeEvent, FormEvent } from "react";
import { createDoc } from "../lib/firestore";
import type { Student } from "../types";

interface AdmissionForm extends Omit<Student, 'id' | 'createdAt' | 'updatedAt'> {
  admissionDate?: string;
}

const initial: AdmissionForm = {
  fullName: "",
  nisn: "",
  gradeLevel: "",
  className: "",
  parentName: "",
  parentPhone: "",
  status: "active",
};
export default function Admissions() {
  const [form, setForm] = useState<AdmissionForm>(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await createDoc("students", {
        ...form,
        admissionDate: new Date().toISOString(),
      } as const);
      setForm(initial);
      setMessage("Student added successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Failed to add student");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Admissions</h2>
      <form
        onSubmit={onSubmit}
        className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {Object.keys(initial).map((key) =>
          key === "status" ? (
            <div key={key}>
              <label className="text-sm capitalize">{key}</label>
              <select
                name={key}
                value={form[key]}
                onChange={onChange}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          ) : (
            <div key={key}>
              <label className="text-sm capitalize">{key}</label>
              <input
                name={key}
                value={form[key as keyof AdmissionForm] || ""}
                onChange={onChange}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </div>
          )
        )}
        <div className="md:col-span-2 flex items-center gap-2">
          <button
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          {message && <span className="text-sm text-gray-600">{message}</span>}
        </div>
      </form>
    </div>
  );
}
