import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Admissions from "./pages/Admissions";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Schedule from "./pages/Schedule";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
function SignIn() {
  const signIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">SchoolMS v2</h1>
        <p className="text-sm text-gray-600 text-center">Sign in to continue</p>
        <button
          onClick={signIn}
          className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          Sign in with Google
        </button>
        <p className="text-xs text-gray-500 text-center">
          Setup Firebase in <code>src/firebase.js</code>
        </p>
      </div>
    </div>
  );
}
function Protected({ children }) {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
    console.log("Current user:", u)
    setUser(u || null)
  })
    return () => unsub();
  }, []);
  if (user === undefined)
    return <div className="p-6 text-sm text-gray-500">Checking session...</div>;
  if (!user) return <SignIn />;
  return children(user);
}
export default function App() {
  const handleSignOut = async () => {
    await signOut(auth);
  };
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <Protected>
            {(user) => (
              <DashboardLayout user={user} onSignOut={handleSignOut}>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="admissions" element={<Admissions />} />
                  <Route path="students" element={<Students />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="classes" element={<Classes />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="grades" element={<Grades />} />
                  <Route path="finance" element={<Finance />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            )}
          </Protected>
        }
      />
    </Routes>
  );
}
