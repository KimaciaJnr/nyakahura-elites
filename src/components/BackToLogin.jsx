import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackToLogin({ to = "/account", onLogout, children, className }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        onLogout();
        navigate(to, { replace: true });
      }}
      className={className}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </button>
  );
}