import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { AppUser } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onSignOut: () => void;
  user: User;
  appUser: AppUser | null;
}

interface NavItem {
  to: string;
  label: string;
  roles: AppUser["role"][];
}

const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dasboard",
    roles: ["student", "teacher", "admin"],
  },
  // { to: "/admissions", label: "Penerimaan", roles: ["admin"] },
  { to: "/teachers", label: "Guru", roles: ["admin"] },
  { to: "/classes", label: "Kelas", roles: ["teacher", "admin"] },
  { to: "/students", label: "Siswa", roles: ["teacher", "admin"] },
  { to: "/schedule", label: "Jadwal", roles: ["teacher", "student", "admin"] },
  { to: "/attendance", label: "Kehadiran", roles: ["teacher", "admin"] },
  { to: "/grades", label: "Nilai", roles: ["teacher", "student", "admin"] },
  { to: "/finance", label: "Keuangan", roles: ["admin"] },
  { to: "/reports", label: "Laporan", roles: ["teacher", "admin"] },
  { to: "/manage-users", label: "Kelola Pengguna", roles: ["admin"] },
  {
    to: "/settings",
    label: "Pengaturan",
    roles: ["student", "teacher", "admin"],
  },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onSignOut,
  user,
  appUser,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredNav = navItems.filter((item) =>
    appUser ? item.roles.includes(appUser.role) : false
  );

  // Redirect otomatis jika status pending/rejected
  useEffect(() => {
    if (appUser?.studentStatus === "pending") {
      navigate("/pending", { replace: true });
    } else if (appUser?.studentStatus === "rejected") {
      navigate("/rejected", { replace: true });
    }
  }, [appUser, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static lg:flex`}
      >
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">SchoolMS v2</h1>
            <p className="text-sm text-gray-600">
              {appUser?.displayName || user.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              Peran:{" "}
              {appUser?.role === "admin"
                ? "Administrator"
                : appUser?.role === "teacher"
                ? "Guru"
                : appUser?.role === "student"
                ? "Siswa"
                : "-"}
            </p>
          </div>
          <button
            className="lg:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={onSignOut}
            className="w-full px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden p-4 bg-white shadow flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-700 focus:outline-none"
          >
            ☰
          </button>
          <div>{appUser?.displayName || user.email}</div>
        </div>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
