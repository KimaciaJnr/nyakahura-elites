import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordPath } from "./lib/navStack";
import ScrollToTop from "./components/ScrollToTop";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AddMemberPage = lazy(() => import("./pages/AddMemberPage"));
const TreasurerPage = lazy(() => import("./pages/TreasurerPage"));
const SecretaryPage = lazy(() => import("./pages/SecretaryPage"));
const ChairpersonPage = lazy(() => import("./pages/ChairpersonPage"));
const ViceChairPage = lazy(() => import("./pages/ViceChairPage"));
const OrganisingPage = lazy(() => import("./pages/OrganisingPage"));

function NavTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    recordPath(pathname);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <NavTracker />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-navy text-sm font-semibold text-white">
            Loading portal...
          </div>
        }
      >
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
      </Suspense>
    </>
  );
}