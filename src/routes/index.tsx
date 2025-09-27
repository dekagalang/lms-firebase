import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
// import Admissions from "@/pages/Admissions";
import Teachers from "@/pages/Teachers";
import Classes from "@/pages/Classes";
import Students from "@/pages/Students";
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

import { AppUser } from "@/types";
import { User } from "firebase/auth";

interface AppRoutesProps {
  appUser: AppUser;
  user: User;
  onSignOut: () => void;
}

export default function AppRoutes({
  appUser,
  user,
  onSignOut,
}: AppRoutesProps) {
  const protectedRoutes = [
    { path: "/dashboard", element: <Dashboard appUser={appUser} /> },
    // { path: "/admissions", element: <Admissions /> },
    { path: "/teachers", element: <Teachers /> },
    { path: "/classes", element: <Classes /> },
    { path: "/students", element: <Students /> },
    { path: "/schedule", element: <Schedule appUser={appUser} /> },
    { path: "/attendance", element: <Attendance appUser={appUser} /> },
    { path: "/grades", element: <Grades appUser={appUser} /> },
    { path: "/finance", element: <Finance /> },
    { path: "/reports", element: <Reports appUser={appUser} /> },
    { path: "/settings", element: <Settings /> },
    { path: "/manage-users", element: <ManageUsers /> },
  ];

  // Render route dengan cek status
  const renderRoute = (element: JSX.Element) => {
    if (appUser.studentStatus === "pending")
      return <Navigate to="/pending" replace />;
    if (appUser.studentStatus === "rejected")
      return <Navigate to="/rejected" replace />;
    if (appUser.studentStatus === "inactive")
      return <Navigate to="/inactive" replace />;
    if (appUser.teacherStatus === "inactive")
      return <Navigate to="/inactive" replace />;

    return (
      <DashboardLayout user={user} appUser={appUser} onSignOut={onSignOut}>
        {element}
      </DashboardLayout>
    );
  };

  return (
    <Routes>
      {protectedRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={renderRoute(element)} />
      ))}
      <Route path="/pending" element={<PendingPage />} />
      <Route path="/rejected" element={<RejectedPage />} />
      <Route path="/inactive" element={<InactivePage />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
