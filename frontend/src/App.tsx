import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import FakturyList from "./components/FakturyList";
import Dashboard from "./components/Dashboard";
import ExportHistory from "./components/ExportHistory";
import ProfileForm from "./components/ProfileForm";
import Login from "./components/Login";
import FakturaDetails from "./components/FakturaDetails";
import Rozrachunki from "./components/Rozrachunki";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("api_token")
  );

  const handleLogin = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem("api_token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="faktury" element={<FakturyList />} />
          <Route path="faktury/:id" element={<FakturaDetails />} />
          <Route path="rozrachunki" element={<Rozrachunki />} />
          <Route path="eksport" element={<ExportHistory />} />
          <Route path="profil" element={<ProfileForm />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
