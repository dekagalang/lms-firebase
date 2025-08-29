import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Admissions from "@/pages/Admissions";
import Teachers from "@/pages/Teachers";
import Classes from "@/pages/Classes";
import Students from "@/pages/Students";
import Schedule from "@/pages/Schedule";
import Attendance from "@/pages/Attendance";
import Grades from "@/pages/Grades";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
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
  return (
    <Routes>
      {[
        { path: "/", element: <Dashboard appUser={appUser} /> },
        { path: "/admissions", element: <Admissions /> },
        { path: "/teachers", element: <Teachers /> },
        { path: "/classes", element: <Classes /> },
        { path: "/students", element: <Students /> },
        { path: "/schedule", element: <Schedule appUser={appUser} /> },
        { path: "/attendance", element: <Attendance appUser={appUser} /> },
        { path: "/grades", element: <Grades appUser={appUser} /> },
        { path: "/finance", element: <Finance /> },
        { path: "/reports", element: <Reports appUser={appUser} /> },
        { path: "/settings", element: <Settings appUser={appUser} /> },
      ].map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <DashboardLayout
              user={user}
              appUser={appUser}
              onSignOut={onSignOut}
            >
              {element}
            </DashboardLayout>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
