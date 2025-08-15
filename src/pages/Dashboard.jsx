import React from "react";
export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow border">
          <p className="text-sm text-gray-500">Students</p>
          <p className="text-3xl font-bold">—</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow border">
          <p className="text-sm text-gray-500">Teachers</p>
          <p className="text-3xl font-bold">—</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow border">
          <p className="text-sm text-gray-500">Open Invoices</p>
          <p className="text-3xl font-bold">—</p>
        </div>
      </div>
    </div>
  );
}
