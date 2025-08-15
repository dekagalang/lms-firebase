import { Link, useLocation } from "react-router-dom";
import { User } from "firebase/auth";

interface NavItem {
  to: string;
  label: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  onSignOut: () => void;
  user: User;
};
const nav: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/admissions", label: "Admissions" },
  { to: "/students", label: "Students" },
  { to: "/teachers", label: "Teachers" },
  { to: "/classes", label: "Classes" },
  { to: "/schedule", label: "Schedule" },
  { to: "/attendance", label: "Attendance" },
  { to: "/grades", label: "Grades" },
  { to: "/finance", label: "Finance" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
];

export default function DashboardLayout({ children, onSignOut, user }: DashboardLayoutProps) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">SchoolMS v2</h1>
          <p className="text-xs text-gray-500">React + Firestore</p>
        </div>
        <nav className="p-2 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-3 py-2 rounded-xl text-sm ${
                  active
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {user ? (
              <span>
                Signed in as <strong>{user.displayName || user.email}</strong>
              </span>
            ) : (
              <span>Not signed in</span>
            )}
          </div>
          {user && (
            <button
              onClick={onSignOut}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm"
            >
              Sign out
            </button>
          )}
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
