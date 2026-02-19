import { Link } from 'react-router-dom';
import { Home, FileText, User, LogOut } from 'lucide-react';

export default function Navigation({ onLogout }) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">
                KSeF Bank Manager
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/faktury"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <FileText className="w-4 h-4 mr-2" />
                Faktury
              </Link>
              <Link
                to="/profil"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <User className="w-4 h-4 mr-2" />
                Profil
              </Link>
<Link
  to="/history"
  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-gray-900"
>
  <FileText className="w-4 h-4 mr-2" />
  Historia
</Link>

            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
