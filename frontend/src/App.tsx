import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import FakturyList from "./components/FakturyList";
import Dashboard from "./components/Dashboard";
import ExportHistory from "./components/ExportHistory";
import ProfileForm from "./components/ProfileForm";

function FakturaDetails() {
  return <div>Tu będą szczegóły pojedynczej faktury.</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="faktury" element={<FakturyList />} />
          <Route path="faktury/:id" element={<FakturaDetails />} />
          <Route path="eksport" element={<ExportHistory />} />
          <Route path="profil" element={<ProfileForm />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
