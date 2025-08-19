import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, googleProvider, db } from "./firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

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
import Students from "./pages/Students";
import { AppUser } from "./types";


// Modal pilih role
const RoleSelectionModal: React.FC<{
  onSelect: (role: AppUser["role"]) => void;
}> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center">Select Your Role</h2>
        <p className="text-sm text-gray-600 text-center">
          Please choose your role to continue.
        </p>
        <div className="flex gap-3 justify-center">
          {["student", "teacher", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => onSelect(r as AppUser["role"])}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 capitalize"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

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
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setAppUser(snap.data() as AppUser);
          setShowRoleModal(false);
        } else {
          // User baru → suruh pilih role
          setShowRoleModal(true);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectRole = async (role: AppUser["role"]) => {
    if (!user) return;

    const newUser: AppUser = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName,
      role,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), newUser);
    setAppUser(newUser);
    setShowRoleModal(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  if (showRoleModal) {
    return <RoleSelectionModal onSelect={handleSelectRole} />;
  }

  if (!appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Dashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/admissions"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Admissions />
          </DashboardLayout>
        }
      />
      <Route
        path="/teachers"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Teachers />
          </DashboardLayout>
        }
      />
      <Route
        path="/classes"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Classes />
          </DashboardLayout>
        }
      />
      <Route
        path="/students"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Students />
          </DashboardLayout>
        }
      />
      <Route
        path="/schedule"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Schedule appUser={appUser} />
          </DashboardLayout>
        }
      />
      <Route
        path="/attendance"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Attendance appUser={appUser} />
          </DashboardLayout>
        }
      />
      <Route
        path="/grades"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Grades />
          </DashboardLayout>
        }
      />
      <Route
        path="/finance"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Finance />
          </DashboardLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Reports />
          </DashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardLayout onSignOut={handleSignOut} user={user} appUser={appUser}>
            <Settings />
          </DashboardLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
