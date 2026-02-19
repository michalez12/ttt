import { useState } from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 ml-4">
                KSeF Bank Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Łowkis-Łozowski SP.J | NIP: 8522588404
              </span>
              <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
                <Settings size={16} />
                <span>Ustawienia</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
                <LogOut size={16} />
                <span>Wyloguj</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`lg:w-64 bg-white border-r shadow-sm transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="p-6">
            <ul className="space-y-2">
              <li>
                <a href="/" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">
                  <span className="w-5">📋</span>
                  <span>Faktury</span>
                </a>
              </li>
              <li>
                <a href="/eksporty" className="flex items-center space-x-3 p-3 rounded-lg text-gray-500 hover:bg-gray-100">
                  <span className="w-5">📤</span>
                  <span>Eksporty bankowe</span>
                </a>
              </li>
              <li>
                <a href="/kontrahenci" className="flex items-center space-x-3 p-3 rounded-lg text-gray-500 hover:bg-gray-100">
                  <span className="w-5">👥</span>
                  <span>Kontrahenci</span>
                </a>
              </li>
              <li>
                <a href="/sync" className="flex items-center space-x-3 p-3 rounded-lg text-gray-500 hover:bg-gray-100">
                  <span className="w-5">🔄</span>
                  <span>Synchronizuj KSeF</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
