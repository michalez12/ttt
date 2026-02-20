import { Outlet, Link, useLocation } from "react-router-dom";
import KsefSync from "./KsefSync";

const Layout = () => {
  const location = useLocation();

  const linkClass = (active: boolean) =>
    "px-3 py-1 rounded " +
    (active
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-gray-100");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-gray-800">
              KSeF Bank Manager
            </span>

            <nav className="flex items-center gap-3 text-sm">
              <Link
                to="/"
                className={linkClass(location.pathname === "/")}
              >
                Dashboard
              </Link>
              <Link
                to="/faktury"
                className={linkClass(
                  location.pathname.startsWith("/faktury")
                )}
              >
                Faktury
              </Link>
              <Link
                to="/eksport"
                className={linkClass(
                  location.pathname.startsWith("/eksport")
                )}
              >
                Eksport
              </Link>
              <Link
                to="/profil"
                className={linkClass(
                  location.pathname.startsWith("/profil")
                )}
              >
                Profil
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <KsefSync />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
