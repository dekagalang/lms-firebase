import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Admissions from "./pages/Admissions";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Schedule from "./pages/Schedule";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Optional: Students page placeholder
// import Students from "./pages/Students";

const SignIn: React.FC = () => {
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
          className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return <SignIn />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Dashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/admissions"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Admissions />
          </DashboardLayout>
        }
      />
      {/* <Route
        path="/students"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Students />
          </DashboardLayout>
        }
      /> */}
      <Route
        path="/teachers"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Teachers />
          </DashboardLayout>
        }
      />
      <Route
        path="/classes"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Classes />
          </DashboardLayout>
        }
      />
      <Route
        path="/schedule"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Schedule />
          </DashboardLayout>
        }
      />
      <Route
        path="/attendance"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Attendance />
          </DashboardLayout>
        }
      />
      <Route
        path="/grades"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Grades />
          </DashboardLayout>
        }
      />
      <Route
        path="/finance"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Finance />
          </DashboardLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Reports />
          </DashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Settings />
          </DashboardLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
