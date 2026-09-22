import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import AddMemberPage from "./pages/AddMemberPage";
import TreasurerPage from "./pages/TreasurerPage";
import SecretaryPage from "./pages/SecretaryPage";
import ChairpersonPage from "./pages/ChairpersonPage";
import ViceChairPage from "./pages/ViceChairPage";
import OrganisingPage from "./pages/OrganisingPage";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/add-member" element={<AddMemberPage />} />
        <Route path="/treasurer" element={<TreasurerPage />} />
        <Route path="/secretary" element={<SecretaryPage />} />
        <Route path="/chairperson" element={<ChairpersonPage />} />
        <Route path="/vice-chair" element={<ViceChairPage />} />
        <Route path="/organising" element={<OrganisingPage />} />
        <Route path="" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}