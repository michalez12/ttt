import { Outlet, Link, useLocation } from "react-router-dom";
import KsefSync from "./KsefSync";
import {
  LayoutDashboard,
  FileText,
  Upload,
  User,
  BookOpen,
  LogOut,
} from "lucide-react";

interface Props {
  onLogout: () => void;
}

const Layout = ({ onLogout }: Props) => {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/faktury", label: "Faktury", icon: <FileText className="h-4 w-4" /> },
    { to: "/rozrachunki", label: "Rozrachunki", icon: <BookOpen className="h-4 w-4" /> },
    { to: "/eksport", label: "Eksport", icon: <Upload className="h-4 w-4" /> },
    { to: "/profil", label: "Profil", icon: <User className="h-4 w-4" /> },
  ];

  const username = localStorage.getItem("username") ?? "użytkownik";

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-md flex flex-col">
        <div className="px-6 py-5 border-b">
          <h1 className="text-lg font-bold text-blue-700">KSeF Manager</h1>
          <p className="text-xs text-gray-500 mt-1">Zalogowany: {username}</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navLinks.map(({ to, label, icon }) => {
            const isActive =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-800 py-2 rounded hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Wyloguj
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
          <KsefSync />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
