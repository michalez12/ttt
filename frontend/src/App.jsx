import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FakturyList from './components/FakturyList';
import ProfileForm from './components/ProfileForm';
import Navigation from './components/Navigation';
import ExportHistory from './components/ExportHistory';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navigation onLogout={handleLogout} />
        
        <main className="w-full py-6 px-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/faktury" element={<FakturyList />} />
            <Route path="/profil" element={<ProfileForm />} />
            <Route path="/history" element={<ExportHistory />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
