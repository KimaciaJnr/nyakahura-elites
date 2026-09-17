import { Link, useNavigate } from "react-router-dom";

export default function BackLink({ to = "/", children, className, ...props }) {
  const navigate = useNavigate();
  const idx = window.history.state && window.history.state.idx;
  const canGoBack = typeof idx === "number" && idx > 0;

  return (
    <Link
      to={to}
      className={className}
      onClick={(e) => {
        if (canGoBack) {
          e.preventDefault();
          navigate(-1);
        }
      }}
      {...props}
    >
      {children}
    </Link>
  );
}