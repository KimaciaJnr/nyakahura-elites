import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { previousPortalPath } from "../lib/navStack";

export default function BackToLogin({
  to = "/account",
  onLogout,
  onTabBack,
  signOutAtRoot = false,
  children,
  className,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const prev = previousPortalPath(location.pathname);

  return (
    <button
      type="button"
      onClick={() => {
        if (onTabBack && onTabBack()) return;
        if (prev && !signOutAtRoot) {
          navigate(-1);
          return;
        }
        onLogout?.();
        navigate(to, { replace: true });
      }}
      className={className}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </button>
  );
}