import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Teachers from "@/pages/Teachers-no-form";
import Classes from "@/pages/Classes";
import Students from "@/pages/Students-no-form";
import Schedule from "@/pages/Schedule";
import Attendance from "@/pages/Attendance";
import Grades from "@/pages/Grades";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import ManageUsers from "@/pages/ManageUsers";
import PendingPage from "@/pages/PendingPage";
import RejectedPage from "@/pages/RejectedPage";
import InactivePage from "@/pages/InactivePage";
import LoginPage from "@/pages/LoginPage";
import SetupAdminPage from "@/pages/SetupAdminPage";

import { AppUser } from "@/types";
import { User } from "firebase/auth";

interface AppRoutesProps {
  appUser: AppUser | null;
  user: User | null;
  loading: boolean;
  requireAdminSetup: boolean;
  onSignOut: () => void;
}

export default function AppRoutes({
  appUser,
  user,
  loading,
  requireAdminSetup,
  onSignOut,
}: AppRoutesProps) {
  // ⏳ Loading state awal (auth check)
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">Memuat...</div>
    );
  }

  // 🚦 Auth flags
  const isAuthenticated = !!user; // perlu testing hapus ini agar route bisa aktif semua

  // 🧭 Jika user belum login tapi mencoba akses protected route → redirect ke login
  if (!isAuthenticated && !requireAdminSetup) {
    const currentPath = window.location.pathname;
    const isProtectedPath = [
      "/dashboard",
      "/teachers",
      "/classes",
      "/students",
      "/schedule",
      "/attendance",
      "/grades",
      "/finance",
      "/reports",
      "/settings",
      "/manage-users",
    ].some((path) => currentPath.startsWith(path));

    if (isProtectedPath) {
      return <Navigate to="/login" replace />;
    }
  }

  // 🚧 Jika sudah login tapi data appUser belum dimuat → tunggu dulu
  // if (isAuthenticated && (!appUser || !appUser.role)) {
  //   return (
  //     <div className="h-screen flex items-center justify-center">
  //       Memuat data pengguna...
  //     </div>
  //   );
  // }

  // 🚦 Cek status user (student / teacher)
  const getStatusRedirect = () => {
    if (appUser?.role === "student") {
      if (appUser.accountStatus === "pending") return "/pending";
      if (appUser.accountStatus === "rejected") return "/rejected";
      if (appUser.accountStatus === "inactive") return "/inactive";
    }
    if (appUser?.role === "teacher" && appUser.teacherStatus === "inactive") {
      return "/inactive";
    }
    return null;
  };

  // 🧱 Wrapper layout untuk route protected
  const withDashboardLayout = (element: JSX.Element) => {
    const statusRedirect = getStatusRedirect();
    if (statusRedirect) return <Navigate to={statusRedirect} replace />;

    return (
      <DashboardLayout user={user!} appUser={appUser!} onSignOut={onSignOut}>
        {element}
      </DashboardLayout>
    );
  };

  // 📦 Daftar route protected
  const protectedRoutes = [
    { path: "/dashboard", element: <Dashboard appUser={appUser!} /> },
    { path: "/teachers", element: <Teachers /> },
    { path: "/classes", element: <Classes /> },
    { path: "/students", element: <Students /> },
    { path: "/schedule", element: <Schedule appUser={appUser!} /> },
    { path: "/attendance", element: <Attendance appUser={appUser!} /> },
    { path: "/grades", element: <Grades appUser={appUser!} /> },
    { path: "/finance", element: <Finance /> },
    { path: "/reports", element: <Reports appUser={appUser!} /> },
    { path: "/settings", element: <Settings /> },
    { path: "/manage-users", element: <ManageUsers /> },
  ];

  return (
    <Routes>
      {/* =========================================
         🚪 PUBLIC & AUTH HANDLING
      ========================================= */}
      {!isAuthenticated ? (
        <>
          {/* Root redirect */}
          <Route
            path="/"
            element={
              requireAdminSetup ? (
                <Navigate to="/setup-admin" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Login */}
          <Route
            path="/login"
            element={
              requireAdminSetup ? (
                <Navigate to="/setup-admin" replace />
              ) : (
                <LoginPage />
              )
            }
          />

          {/* Setup Admin */}
          <Route
            path="/setup-admin"
            element={
              requireAdminSetup ? (
                <SetupAdminPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              requireAdminSetup ? (
                <Navigate to="/setup-admin" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </>
      ) : (
        <>
          {/* =========================================
             🔒 AUTHENTICATED ROUTES
          ========================================= */}
          {requireAdminSetup && (
            <Route path="*" element={<Navigate to="/setup-admin" replace />} />
          )}

          {/* Protected routes */}
          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={withDashboardLayout(element)}
            />
          ))}

          {/* Status pages */}
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/rejected" element={<RejectedPage />} />
          <Route path="/inactive" element={<InactivePage />} />

          {/* Default redirect */}
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
        </>
      )}
    </Routes>
  );
}
