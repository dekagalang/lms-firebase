import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db, googleProvider } from "./firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

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

// ===== Modal Pilih Peran =====
const RoleSelectionModal: React.FC<{
  onSelect: (role: AppUser["role"]) => void;
}> = ({ onSelect }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4">
      <h2 className="text-xl font-bold text-center">Pilih Peran Anda</h2>
      <p className="text-sm text-gray-600 text-center">
        Silakan pilih peran Anda untuk melanjutkan.
      </p>
      <div className="flex gap-3 justify-center">
        {["student", "teacher", "admin"].map((r) => (
          <button
            key={r}
            onClick={() => onSelect(r as AppUser["role"])}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 capitalize"
          >
            {r === "student" ? "Siswa" : r === "teacher" ? "Guru" : "Admin"}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ===== Form Autentikasi (Masuk/Daftar) =====
const AuthForm: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    }
  };

  const signInWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    }
  };

  const registerWithEmail = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">SchoolMS v2</h1>
        <p className="text-sm text-gray-600 text-center">
          {isRegister ? "Daftar akun baru" : "Masuk untuk melanjutkan"}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {isRegister ? (
          <>
            <button
              onClick={registerWithEmail}
              className="w-full px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              Daftar
            </button>
            <p className="text-sm text-center text-gray-500">
              Sudah punya akun?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => setIsRegister(false)}
              >
                Masuk
              </span>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={signInWithEmail}
              className="w-full px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              Masuk
            </button>
            <p className="text-sm text-center text-gray-500">
              Belum punya akun?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => setIsRegister(true)}
              >
                Daftar
              </span>
            </p>
          </>
        )}

        <hr className="my-2" />
        <button
          onClick={signInWithGoogle}
          className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
};

// ===== Main App =====
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
      id: user.uid,
      email: user.email || "",
      displayName: user.displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), newUser);

    if (role === "student") {
      await setDoc(doc(db, "students", user.uid), {
        userId: user.uid,
        fullName: user.displayName || "",
        nisn: "",
        gradeLevel: "",
        classId: "",
        parentName: "",
        parentPhone: "",
        status: "pending",
        admissionDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (role === "teacher") {
      await setDoc(doc(db, "teachers", user.uid), {
        userId: user.uid,
        firstName: "",
        lastName: "",
        email: user.email,
        phone: "",
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    setAppUser(newUser);
    setShowRoleModal(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error saat keluar:", err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat...</p>
      </div>
    );

  if (!user) return <AuthForm />;
  if (showRoleModal) return <RoleSelectionModal onSelect={handleSelectRole} />;
  if (!appUser)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat data pengguna...</p>
      </div>
    );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Dashboard appUser={appUser} />
          </DashboardLayout>
        }
      />
      <Route
        path="/admissions"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Admissions />
          </DashboardLayout>
        }
      />
      <Route
        path="/teachers"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Teachers />
          </DashboardLayout>
        }
      />
      <Route
        path="/classes"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Classes />
          </DashboardLayout>
        }
      />
      <Route
        path="/students"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Students />
          </DashboardLayout>
        }
      />
      <Route
        path="/schedule"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Schedule appUser={appUser} />
          </DashboardLayout>
        }
      />
      <Route
        path="/attendance"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Attendance appUser={appUser} />
          </DashboardLayout>
        }
      />
      <Route
        path="/grades"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Grades appUser={appUser} />
          </DashboardLayout>
        }
      />
      <Route
        path="/finance"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Finance />
          </DashboardLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Reports appUser={appUser} />
          </DashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardLayout
            onSignOut={handleSignOut}
            user={user}
            appUser={appUser}
          >
            <Settings appUser={appUser} />
          </DashboardLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
