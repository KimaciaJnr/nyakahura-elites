import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

// `className` should set the surface (e.g. "text-navy hover:bg-navy/10" for
// light headers or "text-white hover:bg-white/10" for dark/navy headers).
export default function ThemeToggle({ className = "" }) {
  const { dark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${className}`}
    >
      {dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}