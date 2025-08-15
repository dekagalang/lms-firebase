import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut, User } from "firebase/auth";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Admissions from "./pages/Admissions";
// import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Schedule from "./pages/Schedule";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// interface SignInProps {}

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
      <Route path="/" element={
          <DashboardLayout onSignOut={handleSignOut} user={user}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="admissions" element={<Admissions />} />
              {/* <Route path="students" element={<Students />} /> */}
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
      } />
    </Routes>
  );
};

export default App;
