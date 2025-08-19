import React from "react";
import { Link, useLocation } from "react-router-dom";
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
  roles: AppUser["role"][]; // menu hanya muncul untuk role tertentu
}

const navItems: NavItem[] = [
  { to: "/", label: "Dasbor", roles: ["student", "teacher", "admin"] },
  { to: "/admissions", label: "Penerimaan", roles: ["admin"] },
  { to: "/teachers", label: "Guru", roles: ["admin"] },
  { to: "/classes", label: "Kelas", roles: ["teacher", "admin"] },
  { to: "/students", label: "Siswa", roles: ["teacher", "admin"] },
  { to: "/schedule", label: "Jadwal", roles: ["teacher", "student", "admin"] },
  { to: "/attendance", label: "Kehadiran", roles: ["teacher", "admin"] },
  { to: "/grades", label: "Nilai", roles: ["teacher", "student", "admin"] },
  { to: "/finance", label: "Keuangan", roles: ["admin"] },
  { to: "/reports", label: "Laporan", roles: ["teacher", "admin"] },
  { to: "/settings", label: "Pengaturan", roles: ["student", "teacher", "admin"] },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onSignOut,
  user,
  appUser,
}) => {
  const location = useLocation();

  // filter menu berdasarkan role
  const filteredNav = navItems.filter((item) =>
    appUser ? item.roles.includes(appUser.role) : false
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold">SchoolMS v2</h1>
          <p className="text-sm text-gray-600">
            {appUser?.displayName || user.email}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            Peran: {appUser?.role === 'admin' ? 'Administrator' : appUser?.role === 'teacher' ? 'Guru' : appUser?.role === 'student' ? 'Siswa' : '-'}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
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
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;
